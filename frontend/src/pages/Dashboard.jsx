import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cadtSky via-white to-slate-100">
        <p className="text-cadtBlue">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cadtSky via-white to-slate-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-cadtLine bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cadtBlue text-lg font-bold text-white">
            KC
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cadtBlue">
            Kompi-Cyber
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-cadtNavy">
            Welcome, {user?.fullName || user?.name || "User"}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-cadtNavy">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Continue your cybersecurity learning journey
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="mb-10 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <p className="text-sm text-slate-600">Enrolled Courses</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">
                {summary.enrolledCourses || enrolledIds.size}
              </p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <p className="text-sm text-slate-600">Completed</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">
                {summary.completedCourses}
              </p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              {" "}
              <p className="text-sm text-slate-600">Certificates</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <p className="text-sm text-slate-600">Hours Learned</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">
                {summary.hoursLearned}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-cadtNavy">
              Recent Activity
            </h2>
            <div className="rounded-2xl border border-cadtLine bg-white p-8 shadow-card">
              {summary.recentActivity.length === 0 ? (
                <p className="text-center text-slate-500">
                  No recent activity. Start learning now!
                </p>
              ) : (
                <div className="space-y-4">
                  {summary.recentActivity.map((item, index) => (
                    <div
                      key={`${item.activity_type}-${item.occurred_at}-${index}`}
                      className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        {item.activity_text}
                      </p>
                      <p className="shrink-0 text-xs text-slate-400">
                        {item.occurred_at
                          ? new Date(item.occurred_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Courses */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-cadtNavy">
              Available Courses
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card transition hover:shadow-lg"
                >
                  {getCourseCoverUrl(course) ? (
                    <img
                      src={getCourseCoverUrl(course)}
                      alt={`${course.title} cover`}
                      className="mb-4 h-32 w-full rounded-xl border border-cadtLine object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-cadtBlue to-cadtNavy" />
                  )}
                  <h3 className="font-semibold text-cadtNavy">
                    {course.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {course.description || "No course description available."}
                  </p>
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
                      className="mt-4 w-full rounded-lg bg-cadtBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cadtNavy disabled:opacity-60"
                    >
                      {enrollingId === course.id ? "Enrolling..." : "Enroll"}
                    </button>
                  )}
                </div>
              ))}

              {courses.length === 0 && (
                <div className="rounded-2xl border border-cadtLine bg-white p-6 text-sm text-slate-500">
                  No courses found yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
