import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logos/logo-blue.svg";

const API_BASE = import.meta.env.VITE_API_URL || "";
const ASSET_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const COURSE_CATEGORIES = [
  { id: "all", name: "All Courses", icon: "🎯" },
  { id: "cybersecurity", name: "Cybersecurity", icon: "🔐" },
  { id: "networking", name: "Networking", icon: "🌐" },
  { id: "linux", name: "Linux & Systems", icon: "🐧" },
  { id: "web", name: "Web Security", icon: "💻" },
  { id: "incident", name: "Incident Response", icon: "🚨" },
];

const COURSE_COVER_FALLBACKS = [
  {
    pattern: /introduction to cybersecurity/i,
    path: "/upload/lesson/intro-to-cyber-course/cover.svg",
  },
  {
    pattern: /network security/i,
    path: "/upload/lesson/network-security/cover.svg",
  },
  {
    pattern: /web application security|web security/i,
    path: "/upload/lesson/web-security/cover.svg",
  },
  {
    pattern: /incident response|forensics/i,
    path: "/upload/lesson/incident-response/cover.svg",
  },
  {
    pattern: /ethical hacking/i,
    path: "/upload/lesson/web-security/cover.svg",
  },
  {
    pattern: /introduction to linux|linux/i,
    path: "/upload/lesson/intro-to-linux-course/cover.svg",
  },
];

export default function ExploreCourses() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [enrollingId, setEnrollingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getCourseCoverSrc = (course) => {
    const coverImageUrl = course?.cover_image_url;
    if (coverImageUrl) {
      if (/^https?:\/\//i.test(coverImageUrl)) {
        return coverImageUrl;
      }
      return `${API_BASE}${coverImageUrl}`;
    }

    const fallback = COURSE_COVER_FALLBACKS.find((item) =>
      item.pattern.test(course?.title || ""),
    );
    if (fallback) {
      return `${API_BASE}${fallback.path}`;
    }
    return null;
  };

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");

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
      } catch (err) {
        if (err.response?.status === 401) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("sessionExpires");
          navigate("/login");
          return;
        }
        setError(err.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const getCourseCategory = (title) => {
    const titleLower = (title || "").toLowerCase();
    if (titleLower.includes("cybersecurity") || titleLower.includes("cyber"))
      return "cybersecurity";
    if (titleLower.includes("network")) return "networking";
    if (titleLower.includes("linux")) return "linux";
    if (titleLower.includes("web")) return "web";
    if (titleLower.includes("incident") || titleLower.includes("forensic"))
      return "incident";
    return "cybersecurity";
  };

  const filteredAndSortedCourses = courses
    .filter((course) => {
      // Category filter
      if (selectedCategory !== "all") {
        const category = getCourseCategory(course.title);
        if (category !== selectedCategory) return false;
      }

      // Search filter
      const keyword = searchQuery.trim().toLowerCase();
      if (keyword) {
        return (
          (course.title || "").toLowerCase().includes(keyword) ||
          (course.description || "").toLowerCase().includes(keyword)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return (b.module_count || 0) - (a.module_count || 0);
      } else if (sortBy === "newest") {
        return (b.id || 0) - (a.id || 0);
      } else if (sortBy === "duration") {
        return (a.duration_hrs || 0) - (b.duration_hrs || 0);
      }
      return 0;
    });

  const handleEnroll = async (courseId) => {
    const token = sessionStorage.getItem("token");
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

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("sessionExpires");
    navigate("/");
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
            Loading courses...
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
        className={`border-b px-6 py-4 transition-all duration-500 ${
          isDarkMode
            ? "border-[#1E3A5F]/40 bg-[#0F172A]"
            : "border-gray-200/40 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 font-bold uppercase tracking-widest transition-colors hover:${
              isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
            } ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            <span className="text-xl">🔐</span>
            KOMPI CYBER
          </Link>

          {/* Center Title */}
          <div className="flex-1 flex justify-center">
            <h1
              className={`text-lg font-bold uppercase tracking-wider transition-colors ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Explore Courses
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                isDarkMode
                  ? "border-[#FE9A00]/50 text-[#FE9A00] hover:bg-[#FE9A00]/10"
                  : "border-amber-500/50 text-amber-600 hover:bg-amber-100/40"
              }`}
            >
              My Learning
            </Link>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                isDarkMode
                  ? "border-[#FE9A00]/50 text-[#FE9A00] hover:bg-[#FE9A00]/10"
                  : "border-amber-500/50 text-amber-600 hover:bg-amber-100/40"
              }`}
            >
              {isDarkMode ? "☀️ Light" : "🌙 Dark"}
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
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              {/* Search */}
              <div className="mb-8">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode
                      ? "border-[#1E3A5F]/40 bg-[#1A2840]/50 text-white placeholder:text-slate-500 focus:border-[#FE9A00] focus:bg-[#1A2840]"
                      : "border-gray-300/40 bg-white text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:bg-white"
                  }`}
                />
              </div>

              {/* Sort */}
              <div className="mb-8">
                <label
                  className={`block text-xs font-bold uppercase tracking-widest mb-3 ${
                    isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
                  }`}
                >
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none transition-all ${
                    isDarkMode
                      ? "border-[#1E3A5F]/40 bg-[#1A2840]/50 text-white focus:border-[#FE9A00]"
                      : "border-gray-300/40 bg-white text-gray-900 focus:border-amber-500"
                  }`}
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="duration">Shortest Duration</option>
                </select>
              </div>

              {/* Categories */}
              <div>
                <h3
                  className={`text-xs font-bold uppercase tracking-widest mb-4 ${
                    isDarkMode ? "text-[#FE9A00]" : "text-amber-600"
                  }`}
                >
                  Subjects
                </h3>
                <div className="space-y-2">
                  {COURSE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat.id
                          ? isDarkMode
                            ? "bg-[#FE9A00] text-[#0F172A]"
                            : "bg-amber-500 text-white"
                          : isDarkMode
                            ? "text-slate-300 border border-[#1E3A5F]/40 hover:border-[#FE9A00]/60 hover:bg-[#1A2840]/40"
                            : "text-gray-700 border border-gray-200/40 hover:border-amber-400/60 hover:bg-gray-100/40"
                      }`}
                    >
                      <span className="mr-2">{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {error && (
                <div
                  className={`mb-8 rounded-lg border-l-4 px-4 py-3 text-sm ${
                    isDarkMode
                      ? "border-red-500 bg-red-500/10 text-red-300"
                      : "border-red-400 bg-red-100/40 text-red-700"
                  }`}
                >
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div className="mb-8">
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedCategory === "all"
                    ? "All Courses"
                    : COURSE_CATEGORIES.find((c) => c.id === selectedCategory)
                        ?.name}
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  {filteredAndSortedCourses.length} courses available
                </p>
              </div>

              {/* Course Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`rounded-lg border transition-all duration-200 hover:border-[#FE9A00]/60 hover:shadow-lg ${
                      isDarkMode
                        ? "border-[#1E3A5F]/40 bg-[#1A2840]/40"
                        : "border-gray-200/60 bg-white/60"
                    }`}
                  >
                    {/* Course Cover */}
                    {getCourseCoverSrc(course) ? (
                      <img
                        src={getCourseCoverSrc(course)}
                        alt={course.title || "Course cover"}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div
                        className={`w-full h-40 rounded-t-lg border-b flex items-center justify-center ${
                          isDarkMode
                            ? "bg-[#0F172A]/40 border-[#1E3A5F]/40"
                            : "bg-gray-100/60 border-gray-200/40"
                        }`}
                      >
                        <span className="text-5xl">📚</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      {/* Course Info */}
                      <h3
                        className={`font-semibold text-sm line-clamp-2 mb-2 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {course.title}
                      </h3>
                      <p
                        className={`line-clamp-2 text-xs mb-3 ${
                          isDarkMode ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        {course.description ||
                          "Comprehensive cybersecurity course"}
                      </p>

                      {/* Stats */}
                      <div
                        className={`flex items-center gap-4 text-xs mb-3 pb-3 border-b ${
                          isDarkMode
                            ? "text-slate-400 border-[#1E3A5F]/40"
                            : "text-gray-500 border-gray-200/40"
                        }`}
                      >
                        <span>📖 {course.module_count ?? 0} Modules</span>
                        <span>⏱️ {course.duration_hrs ?? 0}h</span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            isDarkMode
                              ? "bg-[#FE9A00]/20 text-[#FE9A00]"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {course.level ?? "Beginner"}
                        </span>
                        {/* Course Type Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            course.course_type === "instructor-led"
                              ? isDarkMode
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-blue-100 text-blue-700"
                              : course.course_type === "both"
                                ? isDarkMode
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-purple-100 text-purple-700"
                                : isDarkMode
                                  ? "bg-cyan-500/20 text-cyan-300"
                                  : "bg-cyan-100 text-cyan-700"
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
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              isDarkMode
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            ⭐ Popular
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      {enrolledIds.has(course.id) ? (
                        <button
                          onClick={() => navigate(`/learn/${course.id}`)}
                          className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                            isDarkMode
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-emerald-500 text-white hover:bg-emerald-600"
                          }`}
                        >
                          Continue Learning
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingId === course.id}
                          className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDarkMode
                              ? "bg-[#FE9A00] text-[#0F172A] hover:bg-[#FF9C1A]"
                              : "bg-amber-500 text-white hover:bg-amber-600"
                          }`}
                        >
                          {enrollingId === course.id
                            ? "Enrolling..."
                            : "Enroll Now"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredAndSortedCourses.length === 0 && (
                <div
                  className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-500 ${
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
                      <svg
                        className={`h-20 w-20 transition-colors ${
                          isDarkMode ? "text-[#FE9A00]/40" : "text-amber-500/40"
                        }`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82M12 3L1 9l11 6.18L23 9 12 3z" />
                      </svg>
                    </div>
                  </div>
                  <h3
                    className={`text-xl font-bold mb-3 transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No Courses Found
                  </h3>
                  <p
                    className={`mb-6 max-w-md mx-auto transition-colors ${
                      isDarkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    Try adjusting your search or category filters to find
                    courses that match your interests.
                  </p>
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
              <img
                src={logo}
                alt="KOMPI-CYBER"
                className="h-8 w-8 object-contain"
              />
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
