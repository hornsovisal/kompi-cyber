import { useState, useEffect } from "react";
import { useNavigate, Link, NavLink, useParams } from "react-router-dom";
import axios from "axios";
import { safeGetLocalStorage, safeSetLocalStorage } from "../utils/safeStorage";

const API_BASE = import.meta.env.VITE_API_URL || "";
const API_TARGET_LABEL = import.meta.env.VITE_API_URL || "Vite /api proxy";
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_BUCKET = "upload-lesson";
const ASSET_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

// Legacy fallback map for courses without slug
const COURSE_COVER_MAP = {
  1: "intro-to-cyber-course",
  2: "intro-to-linux-course",
  3: "network-security",
  4: "web-security",
  5: "incident-response",
};

/**
 * Build Supabase public URL for course cover image
 * Follows pattern: https://{SUPABASE_URL}/storage/v1/object/public/{bucket}/lesson/{slug|courseId}/cover.svg
 */
function getCourseCoverUrl(course) {
  // Use course slug if available, otherwise fallback to legacy ID-based mapping
  const courseSlug = course.slug || COURSE_COVER_MAP[Number(course.id)];
  if (!courseSlug) return "";

  const supabaseUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/lesson/${courseSlug}/cover.svg`;
  return supabaseUrl;
}

const COURSE_COVER_FALLBACKS = [
  {
    pattern: /introduction to cybersecurity/i,
    slug: "intro-to-cyber-course",
  },
  {
    pattern: /network security/i,
    slug: "network-security",
  },
  {
    pattern: /web application security|web security/i,
    slug: "web-security",
  },
  {
    pattern: /incident response|forensics/i,
    slug: "incident-response",
  },
  {
    pattern: /ethical hacking/i,
    slug: "intro-to-linux-course",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [summary, setSummary] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
    recentActivity: [],
  });
  const [certificateCount, setCertificateCount] = useState(0);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = safeGetLocalStorage("theme");
    return saved ? saved === "dark" : true;
  });

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    safeSetLocalStorage("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const currentTab =
    tab === "my-courses" || tab === "explore" || tab === "progress"
      ? tab
      : "my-courses";

  const dedupeCoursesByTitle = (courseList) => {
    const seen = new Set();
    return (courseList || []).filter((course) => {
      const key = (course?.title || "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      if (!key) {
        return true;
      }

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  };

  const displayedCourses =
    currentTab === "my-courses"
      ? dedupeCoursesByTitle(
          courses.filter((course) => enrolledIds.has(course.id)),
        )
      : dedupeCoursesByTitle(courses);

  const filteredCourses = displayedCourses.filter((course) => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return true;

    return (
      (course.title || "").toLowerCase().includes(keyword) ||
      (course.description || "").toLowerCase().includes(keyword)
    );
  });

  const getCourseCoverSrc = (course) => {
    const coverImageUrl = course?.cover_image_url;
    if (coverImageUrl) {
      if (/^https?:\/\//i.test(coverImageUrl)) {
        return coverImageUrl;
      }

      return `${API_BASE}${coverImageUrl}`;
    }

    // Build Supabase URL using course slug or fallback
    const courseSlug = course?.slug || COURSE_COVER_MAP[Number(course?.id)];

    // Try to find a fallback slug by course title
    let fallbackSlug = courseSlug;
    if (!fallbackSlug) {
      const fallback = COURSE_COVER_FALLBACKS.find((item) =>
        item.pattern.test(course?.title || ""),
      );
      fallbackSlug = fallback?.slug;
    }

    if (fallbackSlug) {
      return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/lesson/${fallbackSlug}/cover.svg`;
    }

    return null;
  };

  const currentUsername =
    user?.username ||
    user?.fullName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "User";

  const formatActivityTime = (occurredAt) => {
    if (!occurredAt) return "Unknown time";
    const date = new Date(occurredAt);
    if (Number.isNaN(date.getTime())) return "Unknown time";
    return date.toLocaleString();
  };

  useEffect(() => {
    // Get user from sessionStorage and check expiration
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    const sessionExpires = sessionStorage.getItem("sessionExpires");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Error parsing user:", error);
      navigate("/login");
    }

    const loadData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [coursesRes, enrollmentsRes] = await Promise.all([
          axios.get("/api/courses", { baseURL: API_BASE, headers }),
          axios.get("/api/enrollments/my", { baseURL: API_BASE, headers }),
        ]);
        setCourses(coursesRes.data.courses || []);
        const ids = new Set(
          (enrollmentsRes.data.enrollments || []).map((e) => e.course_id),
        );
        setEnrolledIds(ids);

        // Keep dashboard usable even if summary/certificates endpoints fail.
        const [summaryResult, certificatesResult] = await Promise.allSettled([
          axios.get("/api/users/me/dashboard-summary", {
            baseURL: API_BASE,
            headers,
          }),
          axios.get("/api/certificates/my", {
            baseURL: API_BASE,
            headers,
          }),
        ]);

        if (summaryResult.status === "fulfilled") {
          const summaryData = summaryResult.value.data || {};
          setSummary({
            enrolledCourses: Number(summaryData.enrolledCourses || ids.size),
            completedCourses: Number(
              summaryData.completedCourseCount ??
                summaryData.completedCourses ??
                0,
            ),
            hoursLearned: Number(summaryData.hoursLearned || 0),
            recentActivity: summaryData.recentActivity || [],
          });
        } else {
          setSummary((prev) => ({ ...prev, enrolledCourses: ids.size }));
        }

        if (certificatesResult.status === "fulfilled") {
          setCertificateCount(
            Number(certificatesResult.value.data?.certificates?.length || 0),
          );
        } else {
          setCertificateCount(0);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("sessionExpires");
          navigate("/login");
          return;
        }

        if (!err.response) {
          setError(`Cannot connect to backend API (${API_TARGET_LABEL})`);
          return;
        }

        setError(err.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem("token");
    setEnrollingId(courseId);
    try {
      await axios.post(
        "/api/enrollments",
        { course_id: courseId },
        { baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } },
      );
      setEnrolledIds((prev) => new Set([...prev, courseId]));
      navigate(`/learn/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll");
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center transition-all duration-500 ${
          isDarkMode
            ? "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"
            : "bg-gradient-to-br from-white via-gray-50 to-white"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`h-12 w-12 animate-spin rounded-full border-4 transition-colors ${
              isDarkMode
                ? "border-[#FE9A00]/30 border-t-[#FE9A00]"
                : "border-amber-200 border-t-amber-500"
            }`}
          ></div>
          <p
            className={`font-semibold transition-colors ${
              isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
            }`}
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen flex-col transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]"
          : "bg-gradient-to-br from-white via-gray-50 to-white"
      }`}
    >
      {/* Navigation */}
      <nav
        className={`border-b px-6 py-4 shadow-xl backdrop-blur-sm transition-all duration-500 ${
          isDarkMode
            ? "border-[#1E3A5F]/60 bg-gradient-to-r from-[#0F172A] via-[#1A2840] to-[#0F172A]"
            : "border-gray-200/60 bg-gradient-to-r from-white via-gray-50 to-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="group flex items-center gap-3 transition-transform hover:scale-105"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#FE9A00]/60 bg-gradient-to-br from-[#FE9A00]/15 to-[#FF6B35]/10 shadow-lg shadow-[#FE9A00]/20 group-hover:shadow-[#FE9A00]/40 group-hover:border-[#FE9A00] transition-all">
              <span className="text-xl font-bold text-[#FE9A00]">🔐</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <p
                className={`text-lg font-bold uppercase tracking-widest drop-shadow-lg transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                KOMPI
              </p>
              <p
                className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                  isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
                }`}
              >
                CYBER
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div
            className={`hidden md:flex items-center gap-1 rounded-full p-1.5 border backdrop-blur-sm transition-all duration-500 ${
              isDarkMode
                ? "bg-[#1A2840]/40 border-[#1E3A5F]/50"
                : "bg-gray-100/40 border-gray-200/50"
            }`}
          >
            <NavLink
              to="/dashboard/my-courses"
              className={({ isActive }) => {
                const accentColor = isDarkMode ? "#FE9A00" : "#D97706";
                const textColor = isDarkMode ? "#0F172A" : "#FFFFFF";
                const hoverBg = isDarkMode ? "#FE9A00/15" : "#FCD34D/25";
                const shadowColor = isDarkMode ? "#FE9A00/50" : "#D97706/50";
                const inactiveText = isDarkMode
                  ? "text-slate-300"
                  : "text-gray-600";
                return `px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out ${
                  isActive
                    ? `bg-[${accentColor}] text-[${textColor}] shadow-lg shadow-[${shadowColor}] scale-105`
                    : `${inactiveText} hover:text-[${accentColor}] hover:bg-[${hoverBg}] hover:scale-102`
                }`;
              }}
            >
              My Courses
            </NavLink>
            <Link
              to="/explore"
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out ${
                isDarkMode
                  ? "text-slate-300 hover:text-[#FE9A00] hover:bg-[#FE9A00]/15 hover:scale-102"
                  : "text-gray-600 hover:text-amber-600 hover:bg-amber-200/15 hover:scale-102"
              }`}
            >
              Explore
            </Link>
            <NavLink
              to="/dashboard/progress"
              className={({ isActive }) =>
                `px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out ${
                  isActive
                    ? isDarkMode
                      ? "bg-[#FE9A00] text-[#0F172A] shadow-lg shadow-[#FE9A00]/50 scale-105"
                      : "bg-amber-500 text-white shadow-lg shadow-amber-500/50 scale-105"
                    : isDarkMode
                      ? "text-slate-300 hover:text-[#FE9A00] hover:bg-[#FE9A00]/15 hover:scale-102"
                      : "text-gray-600 hover:text-amber-600 hover:bg-amber-200/15 hover:scale-102"
                }`
              }
            >
              Progress
            </NavLink>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/profile"
              className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 ${
                isDarkMode
                  ? "bg-[#1A2840]/40 border-[#1E3A5F]/50 hover:border-[#FE9A00]/50 hover:shadow-lg hover:shadow-[#FE9A00]/20"
                  : "bg-gray-100/40 border-gray-200/50 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/20"
              }`}
            >
              <div
                className={`h-8 w-8 flex items-center justify-center rounded-full border transition-all duration-500 ${
                  isDarkMode
                    ? "bg-[#FE9A00]/15 border-[#FE9A00]/40"
                    : "bg-amber-200/40 border-amber-400/40"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 transition-colors ${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"}`}
                  fill="currentColor"
                >
                  <path d="M12 2C6.45 2 2 6.45 2 12s4.45 10 10 10 10-4.45 10-10S17.55 2 12 2m0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3m0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <span
                className={`text-sm font-semibold uppercase tracking-wide transition-colors ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}
              >
                {currentUsername}
              </span>
            </Link>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-200 flex items-center gap-2 ${
                isDarkMode
                  ? "bg-gradient-to-r from-[#FE9A00]/20 to-[#FF6B35]/20 text-[#FE9A00] border-[#FE9A00]/50 hover:shadow-lg hover:shadow-[#FE9A00]/40 hover:scale-105"
                  : "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border-amber-300 hover:shadow-lg hover:shadow-amber-400/40 hover:scale-105"
              }`}
            >
              {isDarkMode ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2v6m0 4v6M4.22 4.22l4.24 4.24m3.06 3.06l4.24 4.24M2 12h6m4 0h6M4.22 19.78l4.24-4.24m3.06-3.06l4.24-4.24M19.78 19.78l-4.24-4.24m-3.06-3.06l-4.24-4.24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main
        className={`flex-1 px-4 py-12 transition-all duration-500 ${
          isDarkMode
            ? "bg-gradient-to-b from-[#0F172A] via-transparent to-[#0F172A]"
            : "bg-gradient-to-b from-white via-gray-50 to-white"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-12">
            <div
              className={`inline-flex items-center gap-3 mb-4 transition-all duration-500`}
            >
              <div
                className={`h-1 w-12 rounded-full transition-all duration-500 ${
                  isDarkMode
                    ? "bg-gradient-to-r from-[#FE9A00] to-transparent"
                    : "bg-gradient-to-r from-amber-500 to-transparent"
                }`}
              ></div>
              <span
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                  isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
                }`}
              >
                Learning Dashboard
              </span>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <h1
                  className={`text-5xl md:text-6xl font-black uppercase tracking-tighter drop-shadow-lg mb-3 transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {currentTab === "my-courses"
                    ? "My Learning Path"
                    : currentTab === "explore"
                      ? "Discover Courses"
                      : "Your Progress"}
                </h1>
                <p
                  className={`mt-3 text-lg font-medium max-w-2xl leading-relaxed transition-colors ${
                    isDarkMode ? "text-slate-300" : "text-gray-600"
                  }`}
                >
                  {currentTab === "my-courses"
                    ? "Continue where you left off and build your cybersecurity expertise"
                    : currentTab === "explore"
                      ? "Expand your skills with industry-leading cybersecurity courses"
                      : "Monitor your achievements and unlock new learning milestones"}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              className={`mb-8 rounded-xl border-l-4 px-6 py-4 backdrop-blur-sm transition-all duration-500 ${
                isDarkMode
                  ? "border-red-500 bg-red-500/10 text-red-300"
                  : "border-red-400 bg-red-100/40 text-red-700"
              }`}
            >
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          {currentTab === "progress" && (
            <>
              {/* Stats Cards */}
              <div className="mb-10 grid gap-6 md:grid-cols-4">
                <div
                  className={`rounded-2xl border p-6 shadow-lg transition-all duration-500 ${
                    isDarkMode
                      ? "border-[#FE9A00]/30 bg-[#FE9A00]/10 hover:shadow-[#FE9A00]/20 hover:border-[#FE9A00]/60"
                      : "border-amber-200/50 bg-amber-100/20 hover:shadow-amber-200/30 hover:border-amber-300/60"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                      isDarkMode ? "text-[#FE9A00]" : "text-amber-700"
                    }`}
                  >
                    Enrolled Courses
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {summary.enrolledCourses || enrolledIds.size}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-6 shadow-lg transition-all duration-500 ${
                    isDarkMode
                      ? "border-[#1E3A5F]/60 bg-[#1A2840]/40 hover:shadow-[#FE9A00]/15 hover:border-[#FE9A00]/45"
                      : "border-gray-200/50 bg-gray-100/30 hover:shadow-amber-200/15 hover:border-amber-300/30"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
                    }`}
                  >
                    Completed Courses
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold transition-colors ${
                      isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
                    }`}
                  >
                    {summary.completedCourses}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-6 shadow-lg transition-all duration-500 ${
                    isDarkMode
                      ? "border-emerald-500/30 bg-emerald-900/20 hover:shadow-emerald-600/15 hover:border-emerald-400/60"
                      : "border-emerald-200/50 bg-emerald-100/25 hover:shadow-emerald-300/15 hover:border-emerald-300/60"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                      isDarkMode ? "text-emerald-300" : "text-emerald-700"
                    }`}
                  >
                    Certificates
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold transition-colors ${
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    {certificateCount}
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-6 shadow-lg transition-all duration-500 ${
                    isDarkMode
                      ? "border-[#1E3A5F]/60 bg-[#1A2840]/40 hover:shadow-[#FE9A00]/15 hover:border-[#FE9A00]/45"
                      : "border-gray-200/50 bg-gray-100/30 hover:shadow-amber-200/15 hover:border-amber-300/30"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                      isDarkMode ? "text-slate-300" : "text-gray-600"
                    }`}
                  >
                    Hours Learned
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold transition-colors ${
                      isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
                    }`}
                  >
                    {summary.hoursLearned}
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mb-10">
                <h2
                  className={`mb-6 text-2xl font-bold transition-colors ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Recent Activity
                </h2>
                <div
                  className={`rounded-2xl border p-8 shadow-lg transition-all duration-500 ${
                    isDarkMode
                      ? "border-[#1E3A5F]/60 bg-[#1A2840]/20 hover:border-[#FE9A00]/30"
                      : "border-gray-200/50 bg-gray-100/20 hover:border-amber-300/30"
                  }`}
                >
                  {summary.recentActivity.length === 0 ? (
                    <p
                      className={`text-center transition-colors ${
                        isDarkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      No recent activity. Start learning now!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {summary.recentActivity.map((item, index) => (
                        <div
                          key={`${item.activity_type || "activity"}-${item.occurred_at || index}-${index}`}
                          className={`rounded-xl border px-4 py-3 flex items-start justify-between gap-4 ${
                            isDarkMode
                              ? "border-[#1E3A5F]/50 bg-[#0F172A]/40"
                              : "border-gray-200/70 bg-white/70"
                          }`}
                        >
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {item.activity_text || "Activity"}
                            </p>
                            <p
                              className={`mt-1 text-xs uppercase tracking-wide ${
                                isDarkMode
                                  ? "text-[#FE9A00]/80"
                                  : "text-amber-700"
                              }`}
                            >
                              {(item.activity_type || "activity").replace(
                                "_",
                                " ",
                              )}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 text-xs ${
                              isDarkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            {formatActivityTime(item.occurred_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Available Courses */}
          <div>
            <h2
              className={`mb-6 text-2xl font-bold transition-colors ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {currentTab === "my-courses"
                ? "My Learning Courses"
                : "Available Courses"}
            </h2>

            <div className="mb-8">
              <div className="flex w-full max-w-3xl items-center gap-3">
                <div className="relative flex-1 group">
                  <span
                    className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-focus-within:${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"} ${
                      isDarkMode ? "text-[#FE9A00]/60" : "text-amber-500/60"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by course name, topic, or skills..."
                    className={`w-full rounded-xl border py-3 pl-12 pr-4 outline-none transition-all duration-300 ${
                      isDarkMode
                        ? "border-[#1E3A5F]/60 bg-[#1A2840]/50 text-white placeholder:text-slate-500 focus:border-[#FE9A00]/80 focus:bg-[#1A2840] focus:shadow-lg focus:shadow-[#FE9A00]/20 group-focus-within:border-[#FE9A00]/60"
                        : "border-gray-300/60 bg-white/50 text-gray-900 placeholder:text-gray-400 focus:border-amber-500/80 focus:bg-white focus:shadow-lg focus:shadow-amber-400/20 group-focus-within:border-amber-500/60"
                    }`}
                  />
                </div>
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                    isDarkMode
                      ? "border-[#1E3A5F]/60 bg-[#1A2840]/50 text-slate-300 hover:border-[#FE9A00]/80 hover:text-[#FE9A00] hover:bg-[#FE9A00]/15 hover:shadow-lg hover:shadow-[#FE9A00]/20"
                      : "border-gray-300/60 bg-white/50 text-gray-600 hover:border-amber-500/80 hover:text-amber-600 hover:bg-amber-100/15 hover:shadow-lg hover:shadow-amber-400/20"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 10.5V1.5H17v9zm9.5 8c1.93 0 3.5-1.57 3.5-3.5S18.43 11.5 16.5 11.5 13 13.07 13 15s1.57 3.5 3.5 3.5z" />
                  </svg>
                  FILTER
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className={`group rounded-2xl border p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 cursor-pointer backdrop-blur-sm ${
                    isDarkMode
                      ? "border-[#1E3A5F]/40 bg-gradient-to-br from-[#1A2840] to-[#0F172A] hover:shadow-[#FE9A00]/25 hover:border-[#FE9A00]/60"
                      : "border-gray-200/50 bg-gradient-to-br from-white to-gray-50 hover:shadow-amber-300/25 hover:border-amber-400/60"
                  }`}
                >
                  {/* Course Cover */}
                  {getCourseCoverSrc(course) ? (
                    <img
                      src={getCourseCoverSrc(course)}
                      alt={course.title || "Course cover"}
                      className={`mb-4 h-32 w-full rounded-xl object-cover ring-2 transition-all ${
                        isDarkMode
                          ? "ring-[#FE9A00]/20 group-hover:ring-[#FE9A00]/40"
                          : "ring-amber-300/20 group-hover:ring-amber-400/40"
                      }`}
                    />
                  ) : (
                    <div
                      className={`mb-4 h-32 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                        isDarkMode
                          ? "bg-gradient-to-br from-[#FE9A00]/10 to-[#FF6B35]/10 border-[#FE9A00]/20"
                          : "bg-gradient-to-br from-amber-100/30 to-orange-100/20 border-amber-200/40"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-8 w-8 transition-colors ${
                          isDarkMode ? "text-[#FE9A00]/40" : "text-amber-500/40"
                        }`}
                        fill="currentColor"
                      >
                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82M12 3L1 9l11 6.18L23 9 12 3z" />
                      </svg>
                    </div>
                  )}

                  {/* Course Info */}
                  <h3
                    className={`font-bold text-sm line-clamp-2 transition-colors group-hover:${isDarkMode ? "text-[#FE9A00]" : "text-amber-600"} ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {course.title}
                  </h3>
                  <p
                    className={`mt-2 line-clamp-2 text-xs transition-colors group-hover:${isDarkMode ? "text-slate-300" : "text-gray-600"} ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {course.description || "Comprehensive cybersecurity course"}
                  </p>

                  {/* Stats */}
                  <div
                    className={`mt-4 flex items-center gap-3 text-xs border-t pt-3 transition-all duration-500 ${
                      isDarkMode
                        ? "text-slate-400 border-[#1E3A5F]/40"
                        : "text-gray-500 border-gray-200/50"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 transition-colors ${
                          isDarkMode ? "text-[#FE9A00]/60" : "text-amber-500/60"
                        }`}
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      {course.module_count ?? 0} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 transition-colors ${
                          isDarkMode ? "text-[#FE9A00]/60" : "text-amber-500/60"
                        }`}
                        fill="currentColor"
                      >
                        <path d="M11.99 5V1h-1v4H7.58H6v1h.58H8v10c0 .89.39 1.68 1 2.22V19h1v-1.78c.61-.54 1-1.33 1-2.22V6h2.42H18v-1h-1.58V5h-4.01zm1 12H9V7h3.99v10z" />
                      </svg>
                      {course.duration_hrs}h
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-500 ${
                        isDarkMode
                          ? "bg-[#FE9A00]/20 border-[#FE9A00]/40 text-[#FE9A00]"
                          : "bg-amber-100/50 border-amber-300/50 text-amber-700"
                      }`}
                    >
                      {course.level ?? "Beginner"}
                    </span>
                    {/* Course Type Badge */}
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-500 ${
                        course.course_type === "instructor-led"
                          ? isDarkMode
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                            : "bg-blue-100/50 border-blue-300/50 text-blue-700"
                          : course.course_type === "both"
                            ? isDarkMode
                              ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                              : "bg-purple-100/50 border-purple-300/50 text-purple-700"
                            : isDarkMode
                              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                              : "bg-cyan-100/50 border-cyan-300/50 text-cyan-700"
                      }`}
                    >
                      {{
                        "instructor-led": "👨‍🏫 Instructor-Led",
                        both: "🔄 Hybrid",
                        "online-led": "💻 Self-Paced",
                      }[course.course_type] ?? "💻 Self-Paced"}
                    </span>
                    {course.module_count && course.module_count > 10 && (
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-500 ${
                          isDarkMode
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : "bg-emerald-100/50 border-emerald-300/50 text-emerald-700"
                        }`}
                      >
                        ★ Popular
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  {enrolledIds.has(course.id) ? (
                    <button
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className={`mt-5 w-full rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest border shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group ${
                        isDarkMode
                          ? "bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 border-emerald-500/50 text-white shadow-emerald-600/25 hover:shadow-emerald-600/50 hover:scale-105"
                          : "bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 border-emerald-400/50 text-white shadow-emerald-500/25 hover:shadow-emerald-500/50 hover:scale-105"
                      }`}
                    >
                      <span>Continue Learning</span>
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className={`mt-5 w-full rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest border shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 ${
                        isDarkMode
                          ? "bg-gradient-to-r from-[#FE9A00] via-[#FF9C1A] to-[#FF6B35] border-[#FE9A00]/60 text-[#0F172A] shadow-[#FE9A00]/35 hover:shadow-[#FE9A00]/50 hover:scale-105"
                          : "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 border-amber-400/60 text-white shadow-amber-500/35 hover:shadow-amber-500/50 hover:scale-105"
                      }`}
                    >
                      {enrollingId === course.id ? (
                        <>
                          <div
                            className={`h-4 w-4 border-2 rounded-full animate-spin ${
                              isDarkMode
                                ? "border-[#0F172A]/30 border-t-[#0F172A]"
                                : "border-white/30 border-t-white"
                            }`}
                          ></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <span>Unlock Course</span>
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}

              {filteredCourses.length === 0 && (
                <div
                  className={`rounded-2xl border-2 border-dashed p-12 text-center col-span-full transition-all duration-500 ${
                    isDarkMode
                      ? "border-[#FE9A00]/40 bg-gradient-to-br from-[#FE9A00]/5 to-[#FF6B35]/5"
                      : "border-amber-300/40 bg-gradient-to-br from-amber-100/15 to-orange-100/10"
                  }`}
                >
                  <div className="mb-8 flex justify-center">
                    <div
                      className={`h-32 w-32 rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all duration-500 ${
                        isDarkMode
                          ? "border-[#FE9A00]/40 bg-gradient-to-br from-[#FE9A00]/15 to-[#FF6B35]/10 shadow-[#FE9A00]/20"
                          : "border-amber-300/40 bg-gradient-to-br from-amber-100/30 to-orange-100/20 shadow-amber-300/20"
                      }`}
                    >
                      <span className="text-6xl">🔐</span>
                    </div>
                  </div>
                  <h3
                    className={`text-xl font-bold mb-3 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {currentTab === "my-courses"
                      ? "No Courses Yet"
                      : searchQuery.trim()
                        ? "No Results Found"
                        : "No Courses Available"}
                  </h3>
                  <p
                    className={`mb-6 max-w-md mx-auto transition-colors ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    {currentTab === "my-courses"
                      ? "Start your cybersecurity journey by exploring available courses and enrolling today."
                      : searchQuery.trim()
                        ? "Try adjusting your search terms or browse all available courses."
                        : "Check back soon for new courses, or explore other learning paths."}
                  </p>
                  {currentTab === "my-courses" && (
                    <NavLink
                      to="/explore"
                      className={`inline-block px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all duration-300 hover:scale-105 ${
                        isDarkMode
                          ? "bg-gradient-to-r from-[#FE9A00] to-[#FF6B35] text-[#0F172A] shadow-[#FE9A00]/30 hover:shadow-[#FE9A00]/50"
                          : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30 hover:shadow-amber-500/50"
                      }`}
                    >
                      Explore Courses
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`border-t px-6 py-8 shadow-lg backdrop-blur-sm transition-all duration-500 ${
          isDarkMode
            ? "border-[#1E3A5F]/60 bg-gradient-to-r from-[#0F172A] via-[#1A2840]/30 to-[#0F172A]"
            : "border-gray-200/60 bg-gradient-to-r from-white via-gray-50/30 to-white"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 shadow-lg transition-all duration-500 ${
                isDarkMode
                  ? "border-[#FE9A00]/60 bg-gradient-to-br from-[#FE9A00]/15 to-[#FF6B35]/10 shadow-[#FE9A00]/20"
                  : "border-amber-300/60 bg-gradient-to-br from-amber-100/30 to-orange-100/20 shadow-amber-300/20"
              }`}
            >
              <span className="text-lg font-bold text-[#FE9A00]">🔐</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span
                className={`text-sm font-bold uppercase tracking-widest drop-shadow-sm transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                KOMPI
              </span>
              <span
                className={`text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                  isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
                }`}
              >
                CYBER
              </span>
            </div>
            <span
              className={`sm:hidden text-sm font-bold uppercase tracking-wider transition-colors ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              KOMPI-CYBER
            </span>
          </div>
          <p
            className={`text-xs sm:text-sm font-medium transition-colors ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            }`}
          >
            © 2026 KOMPI-CYBER. All rights reserved. | Professional
            Cybersecurity Training
          </p>
        </div>
      </footer>
    </div>
  );
}
