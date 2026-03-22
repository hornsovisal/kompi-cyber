import { useState, useEffect } from "react";
import { useNavigate, Link, NavLink, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";
const API_TARGET_LABEL = import.meta.env.VITE_API_URL || "Vite /api proxy";
const ASSET_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const COURSE_COVER_MAP = {
  1: "/upload/lesson/intro-to-cyber-course/cover.svg",
  2: "/upload/lesson/intro-to-linux-course/cover.svg",
  3: "/upload/lesson/network-security/cover.svg",
  4: "/upload/lesson/web-security/cover.svg",
  5: "/upload/lesson/incident-response/cover.svg",
};

function getCourseCoverUrl(course) {
  const raw = COURSE_COVER_MAP[Number(course.id)] || "";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `${ASSET_BASE}${raw}`;
}

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
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const currentTab =
    tab === "my-courses" || tab === "explore" || tab === "progress"
      ? tab
      : "my-courses";

  const displayedCourses =
    currentTab === "my-courses"
      ? courses.filter((course) => enrolledIds.has(course.id))
      : courses;

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

    const fallback = COURSE_COVER_FALLBACKS.find((item) =>
      item.pattern.test(course?.title || ""),
    );

    if (fallback) {
      return `${API_BASE}${fallback.path}`;
    }

    return null;
  };

  const currentUsername =
    user?.username ||
    user?.fullName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "User";

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

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

        // Keep dashboard usable even if summary endpoint fails.
        try {
          const summaryRes = await axios.get("/api/users/me/dashboard-summary", {
            baseURL: API_BASE,
            headers,
          });
          setSummary({
            enrolledCourses: Number(summaryRes.data?.enrolledCourses || ids.size),
            completedCourses: Number(summaryRes.data?.completedCourses || 0),
            hoursLearned: Number(summaryRes.data?.hoursLearned || 0),
            recentActivity: summaryRes.data?.recentActivity || [],
          });
        } catch (_summaryError) {
          setSummary((prev) => ({ ...prev, enrolledCourses: ids.size }));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
        <p className="text-cadtBlue">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Navbar */}
      <nav className="flex items-center border-b border-slate-700 bg-[#0F172A] px-6 py-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FE9A00]/50 bg-[#FE9A00]/15 text-[#FE9A00] shadow-lg shadow-[#FE9A00]/25">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 2L4 5.5V11.5C4 16.3 7.3 20.7 12 22C16.7 20.7 20 16.3 20 11.5V5.5L12 2Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M9.2 11.9L11.1 13.8L14.8 10.1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6.9V8.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-2xl font-semibold uppercase tracking-wider text-white">
            Kompi Cyber
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <NavLink
            to="/dashboard/my-courses"
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${
                isActive
                  ? "bg-[#FE9A00] text-slate-900"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            My Courses
          </NavLink>
          <NavLink
            to="/dashboard/explore"
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${
                isActive
                  ? "bg-[#FE9A00] text-slate-900"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/dashboard/progress"
            className={({ isActive }) =>
              `rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${
                isActive
                  ? "bg-[#FE9A00] text-slate-900"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            Progress
          </NavLink>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <span className="text-sm font-medium text-slate-200">
            {currentUsername}
          </span>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-500/70 bg-slate-800/80 text-slate-200"
            aria-label="Profile"
            title="Profile"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M5 20C5.8 16.8 8.5 15 12 15C15.5 15 18.2 16.8 19 20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              {currentTab === "my-courses"
                ? "My Courses"
                : currentTab === "explore"
                  ? "Explore Courses"
                  : "Learning Progress"}
            </h1>
            <p className="mt-2 text-slate-400">
              {currentTab === "my-courses"
                ? "Continue your enrolled cybersecurity courses"
                : currentTab === "explore"
                  ? "Discover and enroll in new cybersecurity courses"
                  : "Track your cybersecurity learning journey"}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {currentTab === "progress" && (
            <>
              {/* Stats Cards */}
              <div className="mb-10 grid gap-6 md:grid-cols-4">
                <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
                  <p className="text-sm text-slate-600">Enrolled Courses</p>
                  <p className="mt-2 text-2xl font-bold text-cadtBlue">
                    {enrolledIds.size}
                  </p>
                </div>

                <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
                </div>

                <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
                  <p className="text-sm text-slate-600">Certificates</p>
                  <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
                </div>

                <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
                  <p className="text-sm text-slate-600">Hours Learned</p>
                  <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mb-10">
                <h2 className="mb-6 text-2xl font-bold text-white">
                  Recent Activity
                </h2>
                <div className="rounded-2xl border border-cadtLine bg-white p-8 shadow-card">
                  <p className="text-center text-slate-500">
                    No recent activity. Start learning now!
                  </p>https://github.com/hornsovisal/kompi-cyber/pull/14/conflict?name=frontend%252Fsrc%252Fpages%252FDashboard.jsx&ancestor_oid=70278f7b86bff6904aec2c8a6ca24c9505dba41a&base_oid=255b54699691e12de5a790d63fde95817a71ae81&head_oid=29a866e13e7e757e1076cf1f7d633e8324a89a75
                </div>
              </div>
            </>
          )}

          {/* Available Courses */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">
              {currentTab === "my-courses" ? "My Courses" : "Available Courses"}
            </h2>

            <div className="mb-6">
              <div className="flex w-full max-w-2xl items-center gap-3">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#62748E]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M11 4C14.866 4 18 7.13401 18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11C4 7.13401 7.13401 4 11 4Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M20 20L16.65 16.65"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Courses..."
                    className="w-full rounded-xl border border-slate-600 bg-[#334155] py-3 pl-12 pr-4 text-[#62748E] placeholder:text-[#62748E] outline-none transition focus:border-[#62748E]"
                  />
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-[#334155] px-4 py-3 text-sm font-semibold uppercase tracking-wider text-[#62748E] transition hover:border-[#62748E] hover:text-slate-200"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 7H20"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 12H17"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 17H14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  FILTER
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl bg-[#0F172A] p-6 shadow-card transition hover:shadow-lg"
                >
                  {getCourseCoverSrc(course) ? (
                    <img
                      src={getCourseCoverSrc(course)}
                      alt={course.title || "Course cover"}
                      className="mb-4 h-32 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-cadtBlue to-cadtNavy"></div>
                  )}
                  <h3 className="font-semibold text-white">
                    {course.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                    {course.description || "No course description available."}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                    {/* Modules */}
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M4 6H20M4 10H20M4 14H14M4 18H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      {course.module_count ?? 0} Modules
                    </span>
                    {/* Duration */}
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {course.duration_hrs ?? 0} hrs
                    </span>
                    {/* Level */}
                    <span className="flex items-center gap-1 capitalize">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M4 20V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M9 20V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M14 20V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M19 20V2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      {course.level ?? "Beginner"}
                    </span>
                  </div>
                  {enrolledIds.has(course.id) ? (
                    <button
                      onClick={() => navigate(`/learn/${course.id}`)}
                      className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className="mt-4 w-full rounded-lg bg-[#FE9A00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e08800] disabled:opacity-60"
                    >
                      {enrollingId === course.id ? "Enrolling..." : "Enroll"}
                    </button>
                  )}
                </div>
              ))}

              {filteredCourses.length === 0 && (
                <div className="rounded-2xl border border-cadtLine bg-white p-6 text-sm text-slate-500">
                  {currentTab === "my-courses"
                    ? "You have not enrolled in any course yet."
                    : searchQuery.trim()
                      ? "No courses match your search."
                      : "No courses found yet."}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-[#0F172A] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FE9A00]/50 bg-[#FE9A00]/15 text-[#FE9A00]">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2L4 5.5V11.5C4 16.3 7.3 20.7 12 22C16.7 20.7 20 16.3 20 11.5V5.5L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M9.2 11.9L11.1 13.8L14.8 10.1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-white">
              Kompi Cyber
            </span>
          </div>
          <p className="text-sm text-slate-400">
            © 2026 CADT. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
