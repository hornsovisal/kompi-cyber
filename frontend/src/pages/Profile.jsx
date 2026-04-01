import { useState, useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import axios from "axios";
import logo from "../kompi-cyber-logo-slide.svg";
import { safeGetLocalStorage, safeSetLocalStorage } from "../utils/safeStorage";

const API_BASE = import.meta.env.VITE_API_URL || "";
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_BUCKET = "upload-lesson";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [summary, setSummary] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
  });
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    program: "",
    year_of_study: "",
    student_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = safeGetLocalStorage("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    safeSetLocalStorage("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(storedUser);
      setUser(parsed);
      setForm((f) => ({
        ...f,
        full_name: parsed.fullName || parsed.full_name || "",
        email: parsed.email || "",
      }));
    } catch {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const loadData = async () => {
      try {
        const [meRes, enrollRes, coursesRes] = await Promise.all([
          axios.get("/api/users/me", { baseURL: API_BASE, headers }),
          axios.get("/api/enrollments/my", { baseURL: API_BASE, headers }),
          axios.get("/api/courses", { baseURL: API_BASE, headers }),
        ]);

        const me = meRes.data.user;
        setUser(me);
        setForm((f) => ({
          ...f,
          full_name: me.fullName || me.full_name || "",
          email: me.email || "",
        }));

        setEnrollments(enrollRes.data.enrollments || []);
        setCourses(coursesRes.data.courses || []);

        try {
          const sumRes = await axios.get("/api/users/me/dashboard-summary", {
            baseURL: API_BASE,
            headers,
          });
          setSummary({
            enrolledCourses: Number(sumRes.data?.enrolledCourses || 0),
            completedCourses: Number(sumRes.data?.completedCourseCount || 0),
            hoursLearned: Number(sumRes.data?.hoursLearned || 0),
          });
        } catch {}

        try {
          const certRes = await axios.get("/api/certificates/my", {
            baseURL: API_BASE,
            headers,
          });
          setCertificates(certRes.data.certificates || []);
        } catch {}
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.put(
        "/api/users/me",
        { full_name: form.full_name, email: form.email },
        {
          baseURL: API_BASE,
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updated = res.data.user;
      sessionStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setSaveMsg("Profile updated successfully!");
    } catch (err) {
      setSaveMsg(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("sessionExpires");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleteMsg("");

    if (deleteConfirm !== "DELETE") {
      setDeleteMsg('Type "DELETE" to confirm account deletion.');
      return;
    }

    const confirmDelete = window.confirm(
      "This will permanently delete your account and learning data. This action cannot be undone. Continue?",
    );

    if (!confirmDelete) {
      return;
    }

    const token = sessionStorage.getItem("token");
    setDeletingAccount(true);

    try {
      await axios.delete("/api/users/me", {
        baseURL: API_BASE,
        headers: { Authorization: `Bearer ${token}` },
      });

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      const responseData = err.response?.data;
      const backendMessage =
        responseData?.message ||
        (typeof responseData === "string" ? responseData : "") ||
        err.message;
      setDeleteMsg(backendMessage || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const displayName =
    user?.fullName || user?.full_name || user?.email?.split("@")[0] || "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Build a course id -> course object lookup for cover images
  const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));

  const ASSET_BASE = (
    import.meta.env.VITE_API_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const COVER_FALLBACKS = [
    {
      pattern: /introduction to cybersecurity|intro.*cyber/i,
      path: "/upload/lesson/intro-to-cyber-course/cover.svg",
    },
    {
      pattern: /network security/i,
      path: "/upload/lesson/network-security/cover.svg",
    },
    {
      pattern: /web.*security|web application/i,
      path: "/upload/lesson/web-security/cover.svg",
    },
    {
      pattern: /ethical hacking/i,
      path: "/upload/lesson/intro-to-linux-course/cover.svg",
    },
    {
      pattern: /incident response|forensics/i,
      path: "/upload/lesson/incident-response/cover.svg",
    },
    {
      pattern: /linux/i,
      path: "/upload/lesson/intro-to-linux-course/cover.svg",
    },
  ];

  const getCourseCoverSrc = (courseId, courseTitle) => {
    const course = courseById[courseId];
    const coverUrl = course?.cover_image_url;
    if (coverUrl) {
      return /^https?:\/\//i.test(coverUrl)
        ? coverUrl
        : `${ASSET_BASE}${coverUrl}`;
    }
    const title = courseTitle || course?.title || "";
    const fallback = COVER_FALLBACKS.find((f) => f.pattern.test(title));
    return fallback ? `${ASSET_BASE}${fallback.path}` : null;
  };

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "my-courses",
      label: "My Courses",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    },
    {
      id: "certificates",
      label: "Certificates",
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    },
    {
      id: "account",
      label: "Account Settings",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      id: "security",
      label: "Security",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  ];

  // ── Loading Screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDarkMode
            ? "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"
            : "bg-gradient-to-br from-white via-gray-50 to-white"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`h-12 w-12 animate-spin rounded-full border-4 ${
              isDarkMode
                ? "border-[#FE9A00]/30 border-t-[#FE9A00]"
                : "border-amber-200 border-t-amber-500"
            }`}
          />
          <p
            className={`font-semibold ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
          >
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ── Page ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex min-h-screen flex-col transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"
          : "bg-gradient-to-br from-white via-gray-50 to-white"
      }`}
    >
      {/* ── Top Nav ── */}
      <nav
        className={`border-b px-6 py-4 shadow-xl backdrop-blur-sm ${
          isDarkMode
            ? "border-[#1E3A5F]/60 bg-gradient-to-r from-[#0F172A] via-[#1A2840] to-[#0F172A]"
            : "border-gray-200/60 bg-gradient-to-r from-white via-gray-50 to-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#FE9A00]/60 bg-gradient-to-br from-[#FE9A00]/15 to-[#FF6B35]/10 shadow-lg shadow-[#FE9A00]/20 transition-all group-hover:border-[#FE9A00] group-hover:shadow-[#FE9A00]/40">
              <img
                src={logo}
                alt="KOMPI-CYBER"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="hidden flex-col sm:flex">
              <p
                className={`text-lg font-black uppercase tracking-widest ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                KOMPI
              </p>
              <p
                className={`text-xs font-bold uppercase tracking-[0.2em] ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
              >
                CYBER
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <div
            className={`hidden md:flex items-center gap-1 rounded-full p-1.5 border backdrop-blur-sm ${
              isDarkMode
                ? "bg-[#1A2840]/40 border-[#1E3A5F]/50"
                : "bg-gray-100/40 border-gray-200/50"
            }`}
          >
            <NavLink
              to="/dashboard/my-courses"
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isDarkMode
                  ? "text-slate-300 hover:text-[#FE9A00] hover:bg-[#FE9A00]/15"
                  : "text-gray-600 hover:text-amber-600 hover:bg-amber-100/20"
              }`}
            >
              Dashboard
            </NavLink>
            <Link
              to="/explore"
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isDarkMode
                  ? "text-slate-300 hover:text-[#FE9A00] hover:bg-[#FE9A00]/15"
                  : "text-gray-600 hover:text-amber-600 hover:bg-amber-100/20"
              }`}
            >
              Explore
            </Link>
            <span
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                isDarkMode
                  ? "bg-[#FE9A00] text-[#0F172A] shadow-lg shadow-[#FE9A00]/50"
                  : "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
              }`}
            >
              Profile
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${
                isDarkMode
                  ? "bg-gradient-to-r from-[#FE9A00]/20 to-[#FF6B35]/20 text-[#FE9A00] border-[#FE9A00]/50 hover:shadow-lg hover:shadow-[#FE9A00]/40"
                  : "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border-amber-300 hover:shadow-lg hover:shadow-amber-400/40"
              }`}
            >
              {isDarkMode ? (
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path
                    strokeLinecap="round"
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  />
                </svg>
              )}
              <span className="hidden sm:inline">
                {isDarkMode ? "Light" : "Dark"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-8">
        {/* ── Sidebar ── */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          {/* Avatar card */}
          <div
            className={`mb-4 rounded-2xl border p-6 shadow-xl text-center ${
              isDarkMode
                ? "border-[#1E3A5F]/60 bg-gradient-to-br from-[#1A2840] to-[#0F172A]"
                : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50"
            }`}
          >
            <div
              className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center text-2xl font-black border-4 shadow-lg ${
                isDarkMode
                  ? "border-[#FE9A00]/60 bg-gradient-to-br from-[#FE9A00]/30 to-[#FF6B35]/20 text-[#FE9A00] shadow-[#FE9A00]/20"
                  : "border-amber-400/60 bg-gradient-to-br from-amber-100 to-orange-50 text-amber-600 shadow-amber-400/20"
              }`}
            >
              {initials}
            </div>
            <h3
              className={`mt-3 font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {displayName}
            </h3>
            <p
              className={`text-xs mt-1 truncate ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
            >
              {user?.email}
            </p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold border ${
                user?.roleId === 3
                  ? isDarkMode
                    ? "bg-[#FE9A00]/20 border-[#FE9A00]/40 text-[#FE9A00]"
                    : "bg-amber-100 border-amber-300 text-amber-700"
                  : user?.roleId === 2
                    ? isDarkMode
                      ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                      : "bg-blue-100 border-blue-300 text-blue-700"
                    : isDarkMode
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-emerald-100 border-emerald-300 text-emerald-700"
              }`}
            >
              {user?.roleId === 3
                ? "Admin"
                : user?.roleId === 2
                  ? "Instructor"
                  : "Student"}
            </span>
          </div>

          {/* Nav items */}
          <nav
            className={`rounded-2xl border shadow-lg overflow-hidden ${
              isDarkMode
                ? "border-[#1E3A5F]/60 bg-gradient-to-br from-[#1A2840] to-[#0F172A]"
                : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50"
            }`}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b last:border-b-0 ${
                  isDarkMode ? "border-[#1E3A5F]/40" : "border-gray-100"
                } ${
                  activeSection === item.id
                    ? isDarkMode
                      ? "bg-[#FE9A00]/15 text-[#FE9A00] border-l-2 border-l-[#FE9A00]"
                      : "bg-amber-50 text-amber-600 border-l-2 border-l-amber-500"
                    : isDarkMode
                      ? "text-slate-400 hover:text-[#FE9A00] hover:bg-[#FE9A00]/10"
                      : "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isDarkMode
                  ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  : "text-red-500 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </nav>
        </aside>

        {/* ── Main Content ── */}
        <main className="min-w-0 flex-1 space-y-6">
          {/* ── OVERVIEW ── */}
          {activeSection === "overview" && (
            <>
              {/* Profile Hero */}
              <div
                className={`rounded-2xl border p-6 shadow-xl ${
                  isDarkMode
                    ? "border-[#1E3A5F]/60 bg-gradient-to-br from-[#1A2840] to-[#0F172A]"
                    : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50"
                }`}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  {/* Avatar */}
                  <div
                    className={`flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl text-3xl font-black border-2 shadow-lg ${
                      isDarkMode
                        ? "border-[#FE9A00]/60 bg-gradient-to-br from-[#FE9A00]/25 to-[#FF6B35]/15 text-[#FE9A00] shadow-[#FE9A00]/20"
                        : "border-amber-400/60 bg-gradient-to-br from-amber-100 to-orange-50 text-amber-600 shadow-amber-400/20"
                    }`}
                  >
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h1
                          className={`text-2xl font-black uppercase tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {displayName}
                        </h1>
                        <div
                          className={`mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                        >
                          {form.student_id && (
                            <span>
                              Student ID:{" "}
                              <span
                                className={
                                  isDarkMode
                                    ? "text-slate-300"
                                    : "text-gray-700"
                                }
                              >
                                {form.student_id}
                              </span>
                            </span>
                          )}
                          {form.program && (
                            <span>
                              Major:{" "}
                              <span
                                className={
                                  isDarkMode
                                    ? "text-slate-300"
                                    : "text-gray-700"
                                }
                              >
                                {form.program}
                              </span>
                            </span>
                          )}
                          {form.year_of_study && (
                            <span>
                              Year:{" "}
                              <span
                                className={
                                  isDarkMode
                                    ? "text-slate-300"
                                    : "text-gray-700"
                                }
                              >
                                {form.year_of_study}
                              </span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            {user?.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveSection("account")}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${
                            isDarkMode
                              ? "border-[#FE9A00]/50 bg-[#FE9A00]/10 text-[#FE9A00] hover:shadow-lg hover:shadow-[#FE9A00]/25"
                              : "border-amber-400/50 bg-amber-50 text-amber-600 hover:shadow-lg hover:shadow-amber-400/25"
                          }`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Summary */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`h-1 w-8 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#FE9A00] to-transparent" : "bg-gradient-to-r from-amber-500 to-transparent"}`}
                  />
                  <h2
                    className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                  >
                    Academic Summary
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    {
                      label: "Enrolled Courses",
                      value: summary.enrolledCourses,
                      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                      color: "amber",
                    },
                    {
                      label: "Completed Courses",
                      value: summary.completedCourses,
                      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
                      color: "emerald",
                    },
                    {
                      label: "Hours Learned",
                      value: `${summary.hoursLearned}h`,
                      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                      color: "blue",
                    },
                    {
                      label: "Certificates",
                      value: certificates.length,
                      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                      color: "purple",
                    },
                  ].map(({ label, value, icon, color }) => {
                    const colorMap = {
                      amber: isDarkMode
                        ? "border-[#FE9A00]/30 bg-[#FE9A00]/10 text-[#FE9A00]"
                        : "border-amber-200/50 bg-amber-50 text-amber-600",
                      emerald: isDarkMode
                        ? "border-emerald-500/30 bg-emerald-900/20 text-emerald-400"
                        : "border-emerald-200/50 bg-emerald-50 text-emerald-600",
                      blue: isDarkMode
                        ? "border-blue-500/30 bg-blue-900/20 text-blue-400"
                        : "border-blue-200/50 bg-blue-50 text-blue-600",
                      purple: isDarkMode
                        ? "border-purple-500/30 bg-purple-900/20 text-purple-400"
                        : "border-purple-200/50 bg-purple-50 text-purple-600",
                    };
                    const labelColor = isDarkMode
                      ? "text-slate-400"
                      : "text-gray-500";
                    const valColor = isDarkMode
                      ? "text-white"
                      : "text-gray-900";
                    return (
                      <div
                        key={label}
                        className={`rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? "border-[#1E3A5F]/60 bg-gradient-to-br from-[#1A2840] to-[#0F172A]" : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50"}`}
                      >
                        <div
                          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap[color]}`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={icon}
                            />
                          </svg>
                        </div>
                        <p className={`text-2xl font-black ${valColor}`}>
                          {value}
                        </p>
                        <p
                          className={`mt-1 text-xs font-semibold uppercase tracking-wide ${labelColor}`}
                        >
                          {label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Courses */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-1 w-8 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#FE9A00] to-transparent" : "bg-gradient-to-r from-amber-500 to-transparent"}`}
                    />
                    <h2
                      className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                    >
                      My Active Courses
                    </h2>
                  </div>
                  <Link
                    to="/dashboard/my-courses"
                    className={`text-xs font-bold uppercase tracking-wider hover:underline ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                  >
                    View All
                  </Link>
                </div>
                {enrollments.length === 0 ? (
                  <div
                    className={`rounded-2xl border-2 border-dashed p-10 text-center ${isDarkMode ? "border-[#FE9A00]/30 bg-[#FE9A00]/5" : "border-amber-300/30 bg-amber-50/30"}`}
                  >
                    <p
                      className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                    >
                      No active courses yet.{" "}
                      <Link
                        to="/explore"
                        className={`font-bold hover:underline ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                      >
                        Explore courses →
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {enrollments.slice(0, 3).map((e) => {
                      const coverSrc = getCourseCoverSrc(e.course_id, e.title);
                      return (
                        <div
                          key={e.course_id}
                          className={`group rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                            isDarkMode
                              ? "border-[#1E3A5F]/40 bg-gradient-to-br from-[#1A2840] to-[#0F172A] hover:border-[#FE9A00]/40 hover:shadow-[#FE9A00]/15"
                              : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50 hover:border-amber-400/40 hover:shadow-amber-300/15"
                          }`}
                        >
                          {coverSrc ? (
                            <img
                              src={coverSrc}
                              alt={e.title}
                              className={`mb-3 h-28 w-full rounded-xl object-cover ring-2 transition-all ${
                                isDarkMode
                                  ? "ring-[#FE9A00]/20 group-hover:ring-[#FE9A00]/40"
                                  : "ring-amber-300/20 group-hover:ring-amber-400/40"
                              }`}
                            />
                          ) : (
                            <div
                              className={`mb-3 h-28 rounded-xl border flex items-center justify-center ${
                                isDarkMode
                                  ? "bg-gradient-to-br from-[#FE9A00]/10 to-[#FF6B35]/5 border-[#FE9A00]/20"
                                  : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/40"
                              }`}
                            >
                              <svg
                                className={`h-8 w-8 ${isDarkMode ? "text-[#FE9A00]/40" : "text-amber-400/60"}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82M12 3L1 9l11 6.18L23 9 12 3z" />
                              </svg>
                            </div>
                          )}
                          <h3
                            className={`font-bold text-sm line-clamp-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {e.title || `Course #${e.course_id}`}
                          </h3>
                          <div
                            className={`mt-2 flex items-center gap-3 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                          >
                            <span
                              className={`rounded-full px-2.5 py-1 font-bold border ${
                                isDarkMode
                                  ? "border-[#FE9A00]/40 bg-[#FE9A00]/10 text-[#FE9A00]"
                                  : "border-amber-300/50 bg-amber-50 text-amber-600"
                              }`}
                            >
                              {e.level || "Beginner"}
                            </span>
                            {e.duration_hrs && <span>{e.duration_hrs}h</span>}
                          </div>
                          <button
                            onClick={() => navigate(`/learn/${e.course_id}`)}
                            className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider border transition-all duration-200 hover:scale-105 ${
                              isDarkMode
                                ? "bg-gradient-to-r from-[#FE9A00] to-[#FF6B35] text-[#0F172A] border-[#FE9A00]/50 shadow-[#FE9A00]/25 hover:shadow-lg"
                                : "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-amber-400/50 shadow-amber-400/25 hover:shadow-lg"
                            }`}
                          >
                            Continue
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`h-1 w-8 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#FE9A00] to-transparent" : "bg-gradient-to-r from-amber-500 to-transparent"}`}
                  />
                  <h2
                    className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                  >
                    Achievements
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: "Top Performer",
                      desc: "Achieved highest grade in a course",
                      icon: "⭐",
                      color: "amber",
                    },
                    {
                      title: "Fast Learner",
                      desc: "Completed 3 courses in one semester",
                      icon: "⚡",
                      color: "blue",
                    },
                    {
                      title: "Perfect Attendance",
                      desc: "100% attendance record",
                      icon: "🎯",
                      color: "emerald",
                    },
                  ].map(({ title, desc, icon, color }) => {
                    const borderMap = {
                      amber: isDarkMode
                        ? "border-[#FE9A00]/30 bg-[#FE9A00]/5 hover:border-[#FE9A00]/60"
                        : "border-amber-200/50 bg-amber-50/30 hover:border-amber-400/60",
                      blue: isDarkMode
                        ? "border-blue-500/30 bg-blue-900/10 hover:border-blue-400/60"
                        : "border-blue-200/50 bg-blue-50/30 hover:border-blue-400/60",
                      emerald: isDarkMode
                        ? "border-emerald-500/30 bg-emerald-900/10 hover:border-emerald-400/60"
                        : "border-emerald-200/50 bg-emerald-50/30 hover:border-emerald-400/60",
                    };
                    return (
                      <div
                        key={title}
                        className={`rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? "bg-gradient-to-br from-[#1A2840] to-[#0F172A]" : "bg-gradient-to-br from-white to-gray-50"} ${borderMap[color]}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{icon}</span>
                          <div>
                            <h3
                              className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {title}
                            </h3>
                            <p
                              className={`mt-1 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                            >
                              {desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── MY COURSES ── */}
          {activeSection === "my-courses" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`h-1 w-8 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#FE9A00] to-transparent" : "bg-gradient-to-r from-amber-500 to-transparent"}`}
                />
                <h2
                  className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                >
                  My Courses
                </h2>
              </div>
              {enrollments.length === 0 ? (
                <div
                  className={`rounded-2xl border-2 border-dashed p-16 text-center ${isDarkMode ? "border-[#FE9A00]/30 bg-[#FE9A00]/5" : "border-amber-300/30 bg-amber-50/30"}`}
                >
                  <p
                    className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                  >
                    No enrollments yet.{" "}
                    <Link
                      to="/explore"
                      className={`font-bold hover:underline ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                    >
                      Explore courses →
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {enrollments.map((e) => {
                    const coverSrc = getCourseCoverSrc(e.course_id, e.title);
                    return (
                      <div
                        key={e.course_id}
                        className={`group rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                          isDarkMode
                            ? "border-[#1E3A5F]/40 bg-gradient-to-br from-[#1A2840] to-[#0F172A] hover:border-[#FE9A00]/40 hover:shadow-[#FE9A00]/15"
                            : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50 hover:border-amber-400/40"
                        }`}
                      >
                        {coverSrc ? (
                          <img
                            src={coverSrc}
                            alt={e.title}
                            className={`mb-3 h-28 w-full rounded-xl object-cover ring-2 transition-all ${
                              isDarkMode
                                ? "ring-[#FE9A00]/20 group-hover:ring-[#FE9A00]/40"
                                : "ring-amber-300/20 group-hover:ring-amber-400/40"
                            }`}
                          />
                        ) : (
                          <div
                            className={`mb-3 h-28 rounded-xl flex items-center justify-center border ${
                              isDarkMode
                                ? "bg-gradient-to-br from-[#FE9A00]/10 to-[#FF6B35]/5 border-[#FE9A00]/20"
                                : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/40"
                            }`}
                          >
                            <svg
                              className={`h-8 w-8 ${isDarkMode ? "text-[#FE9A00]/40" : "text-amber-400/60"}`}
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82M12 3L1 9l11 6.18L23 9 12 3z" />
                            </svg>
                          </div>
                        )}
                        <h3
                          className={`font-bold text-sm line-clamp-2 mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {e.title || `Course #${e.course_id}`}
                        </h3>
                        <div
                          className={`flex items-center gap-3 text-xs mb-3 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                        >
                          <span
                            className={`rounded-full px-2.5 py-1 font-bold border ${
                              isDarkMode
                                ? "border-[#FE9A00]/40 bg-[#FE9A00]/10 text-[#FE9A00]"
                                : "border-amber-300/50 bg-amber-50 text-amber-600"
                            }`}
                          >
                            {e.level || "Beginner"}
                          </span>
                          {e.duration_hrs && <span>{e.duration_hrs}h</span>}
                          <span>
                            Enrolled{" "}
                            {e.enrolled_at
                              ? new Date(e.enrolled_at).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/learn/${e.course_id}`)}
                          className={`w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider border transition-all duration-200 hover:scale-105 ${
                            isDarkMode
                              ? "bg-gradient-to-r from-[#FE9A00] to-[#FF6B35] text-[#0F172A] border-[#FE9A00]/50 hover:shadow-lg hover:shadow-[#FE9A00]/25"
                              : "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/25"
                          }`}
                        >
                          Continue Learning
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── CERTIFICATES ── */}
          {activeSection === "certificates" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`h-1 w-8 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#FE9A00] to-transparent" : "bg-gradient-to-r from-amber-500 to-transparent"}`}
                />
                <h2
                  className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                >
                  Certificates
                </h2>
              </div>
              {certificates.length === 0 ? (
                <div
                  className={`rounded-2xl border-2 border-dashed p-16 text-center ${isDarkMode ? "border-[#FE9A00]/30 bg-[#FE9A00]/5" : "border-amber-300/30 bg-amber-50/30"}`}
                >
                  <p
                    className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Complete a course to earn your first certificate.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className={`rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                        isDarkMode
                          ? "border-[#FE9A00]/30 bg-gradient-to-br from-[#1A2840] to-[#0F172A] hover:border-[#FE9A00]/60"
                          : "border-amber-200/50 bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-400/60"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xl border ${
                            isDarkMode
                              ? "border-[#FE9A00]/40 bg-[#FE9A00]/15"
                              : "border-amber-300/50 bg-amber-50"
                          }`}
                        >
                          🎓
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {cert.course_name || cert.course_title || cert.title
                              ? `${cert.course_name || cert.course_title || cert.title} Certificate`
                              : "Course Certificate"}
                          </h3>
                          <p
                            className={`mt-1 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                          >
                            Issued:{" "}
                            {cert.issued_at
                              ? new Date(cert.issued_at).toLocaleDateString()
                              : "—"}
                          </p>
                          <p
                            className={`mt-0.5 text-xs font-mono truncate ${isDarkMode ? "text-[#FE9A00]/70" : "text-amber-600/70"}`}
                          >
                            {cert.certificate_code}
                          </p>
                        </div>
                      </div>
                      {cert.certificate_hash && (
                        <Link
                          to={`/certificate/${cert.certificate_hash}`}
                          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider border transition-all duration-200 hover:scale-105 ${
                            isDarkMode
                              ? "border-[#FE9A00]/50 bg-[#FE9A00]/10 text-[#FE9A00] hover:bg-[#FE9A00]/20"
                              : "border-amber-400/50 bg-amber-50 text-amber-600 hover:bg-amber-100"
                          }`}
                        >
                          View Certificate
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── ACHIEVEMENTS ── */}
          {activeSection === "achievements" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`h-1 w-8 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#FE9A00] to-transparent" : "bg-gradient-to-r from-amber-500 to-transparent"}`}
                />
                <h2
                  className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                >
                  Achievements
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Top Performer",
                    desc: "Achieved highest grade in a course",
                    earned: "Jan 15, 2026",
                    icon: "⭐",
                    color: "amber",
                  },
                  {
                    title: "Fast Learner",
                    desc: "Completed 3 courses in one semester",
                    earned: "Dec 28, 2025",
                    icon: "⚡",
                    color: "blue",
                  },
                  {
                    title: "Perfect Attendance",
                    desc: "100% attendance in a semester",
                    earned: "Nov 30, 2025",
                    icon: "🎯",
                    color: "emerald",
                  },
                ].map(({ title, desc, earned, icon, color }) => {
                  const map = {
                    amber: isDarkMode
                      ? "border-[#FE9A00]/30 hover:border-[#FE9A00]/60"
                      : "border-amber-200/50 hover:border-amber-400/60",
                    blue: isDarkMode
                      ? "border-blue-500/30 hover:border-blue-400/60"
                      : "border-blue-200/50 hover:border-blue-400/60",
                    emerald: isDarkMode
                      ? "border-emerald-500/30 hover:border-emerald-400/60"
                      : "border-emerald-200/50 hover:border-emerald-400/60",
                  };
                  return (
                    <div
                      key={title}
                      className={`rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 ${isDarkMode ? "bg-gradient-to-br from-[#1A2840] to-[#0F172A]" : "bg-gradient-to-br from-white to-gray-50"} ${map[color]}`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">{icon}</span>
                        <div>
                          <h3
                            className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {title}
                          </h3>
                          <p
                            className={`mt-1 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                          >
                            {desc}
                          </p>
                          <p
                            className={`mt-2 text-xs font-semibold ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}
                          >
                            Earned: {earned}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── ACCOUNT SETTINGS ── */}
          {activeSection === "account" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`h-1 w-8 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#FE9A00] to-transparent" : "bg-gradient-to-r from-amber-500 to-transparent"}`}
                />
                <h2
                  className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                >
                  Account Information
                </h2>
              </div>
              <form
                onSubmit={handleSave}
                className={`rounded-2xl border p-6 shadow-xl space-y-6 ${
                  isDarkMode
                    ? "border-[#1E3A5F]/60 bg-gradient-to-br from-[#1A2840] to-[#0F172A]"
                    : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50"
                }`}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    {
                      label: "Full Name",
                      key: "full_name",
                      placeholder: "Your full name",
                    },
                    {
                      label: "Email Address",
                      key: "email",
                      placeholder: "your@email.com",
                      type: "email",
                    },
                    {
                      label: "Phone Number",
                      key: "phone",
                      placeholder: "+855 12 345 678",
                    },
                    {
                      label: "Program",
                      key: "program",
                      placeholder: "e.g. Computer Science & Engineering",
                    },
                    {
                      label: "Year of Study",
                      key: "year_of_study",
                      placeholder: "e.g. Year 3",
                    },
                    {
                      label: "Student ID",
                      key: "student_id",
                      placeholder: "e.g. CADT-2024-001234",
                    },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label
                        className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                      >
                        {label}
                      </label>
                      <input
                        type={type || "text"}
                        value={form[key]}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        placeholder={placeholder}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 ${
                          isDarkMode
                            ? "border-[#1E3A5F]/60 bg-[#0F172A]/50 text-white placeholder:text-slate-600 focus:border-[#FE9A00]/60 focus:shadow-lg focus:shadow-[#FE9A00]/10"
                            : "border-gray-200/60 bg-white text-gray-900 placeholder:text-gray-400 focus:border-amber-400/60 focus:shadow-lg focus:shadow-amber-400/10"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {saveMsg && (
                  <p
                    className={`text-sm font-semibold ${saveMsg.includes("success") ? (isDarkMode ? "text-emerald-400" : "text-emerald-600") : isDarkMode ? "text-red-400" : "text-red-600"}`}
                  >
                    {saveMsg}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex items-center gap-2 rounded-xl py-3 px-8 text-xs font-bold uppercase tracking-widest border shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
                      isDarkMode
                        ? "bg-gradient-to-r from-[#FE9A00] to-[#FF6B35] text-[#0F172A] border-[#FE9A00]/50 shadow-[#FE9A00]/30 hover:shadow-[#FE9A00]/50"
                        : "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-amber-400/50 shadow-amber-400/30 hover:shadow-amber-400/50"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>

              <div
                className={`mt-6 rounded-2xl border p-6 shadow-xl space-y-4 ${
                  isDarkMode
                    ? "border-red-500/30 bg-gradient-to-br from-red-900/20 to-[#0F172A]"
                    : "border-red-200/60 bg-gradient-to-br from-red-50 to-white"
                }`}
              >
                <div>
                  <h3
                    className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? "text-red-400" : "text-red-600"}`}
                  >
                    Danger Zone
                  </h3>
                  <p
                    className={`mt-1 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Deleting your account is permanent and cannot be undone.
                  </p>
                </div>

                <div>
                  <label
                    className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Type DELETE to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 ${
                      isDarkMode
                        ? "border-red-500/40 bg-[#0F172A]/50 text-white placeholder:text-slate-600 focus:border-red-400/70"
                        : "border-red-300/60 bg-white text-gray-900 placeholder:text-gray-400 focus:border-red-400/70"
                    }`}
                  />
                </div>

                {deleteMsg && (
                  <p
                    className={`text-sm font-semibold ${isDarkMode ? "text-red-400" : "text-red-600"}`}
                  >
                    {deleteMsg}
                  </p>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className={`flex items-center gap-2 rounded-xl py-3 px-8 text-xs font-bold uppercase tracking-widest border shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
                      isDarkMode
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/50 shadow-red-500/25 hover:shadow-red-500/45"
                        : "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/50 shadow-red-500/25 hover:shadow-red-500/45"
                    }`}
                  >
                    {deletingAccount ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── SECURITY ── */}
          {activeSection === "security" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`h-1 w-8 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#FE9A00] to-transparent" : "bg-gradient-to-r from-amber-500 to-transparent"}`}
                />
                <h2
                  className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                >
                  Security
                </h2>
              </div>
              <div
                className={`rounded-2xl border p-6 shadow-xl space-y-5 ${
                  isDarkMode
                    ? "border-[#1E3A5F]/60 bg-gradient-to-br from-[#1A2840] to-[#0F172A]"
                    : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50"
                }`}
              >
                <div
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    isDarkMode
                      ? "border-[#1E3A5F]/40 bg-[#0F172A]/30"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Password
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                    >
                      Last changed: recently
                    </p>
                  </div>
                  <Link
                    to="/forget-password"
                    className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 ${
                      isDarkMode
                        ? "border-[#FE9A00]/50 bg-[#FE9A00]/10 text-[#FE9A00] hover:bg-[#FE9A00]/20"
                        : "border-amber-400/50 bg-amber-50 text-amber-600 hover:bg-amber-100"
                    }`}
                  >
                    Change Password
                  </Link>
                </div>
                <div
                  className={`flex items-center justify-between rounded-xl border p-4 ${
                    isDarkMode
                      ? "border-[#1E3A5F]/40 bg-[#0F172A]/30"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Account Status
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}
                    >
                      ● Active
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${isDarkMode ? "border-emerald-500/40 bg-emerald-900/20 text-emerald-400" : "border-emerald-300/50 bg-emerald-50 text-emerald-600"}`}
                  >
                    Verified
                  </span>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
