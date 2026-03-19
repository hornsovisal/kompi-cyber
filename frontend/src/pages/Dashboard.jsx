import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
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
        setEnrolledCourses(enrollmentsRes.data.enrollments || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!err.response) {
          setError("Cannot connect to backend API (http://localhost:5000)");
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
      // Add to enrolled courses
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setEnrolledCourses(prev => [...prev, { ...course, enrolled_at: new Date() }]);
      }
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

  // Calculate progress (placeholder - in real app, this would come from backend)
  const getProgress = (courseId) => {
    // Placeholder: random progress for demo
    return Math.floor(Math.random() * 100);
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
            Welcome, {user?.name || "User"}
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
        <div className="mx-auto max-w-7xl">
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
                {enrolledCourses.length}
              </p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <p className="text-sm text-slate-600">Completed</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">
                {enrolledCourses.filter(c => getProgress(c.id) === 100).length}
              </p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <p className="text-sm text-slate-600">Certificates</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <p className="text-sm text-slate-600">Hours Learned</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">
                {enrolledCourses.reduce((acc, c) => acc + Math.floor((getProgress(c.id) / 100) * (c.duration_hrs || 10)), 0)}
              </p>
            </div>
          </div>

          {/* My Courses */}
          {enrolledCourses.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 text-2xl font-bold text-cadtNavy">
                My Courses
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => {
                  const progress = getProgress(course.id);
                  return (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card transition hover:shadow-lg"
                    >
                      <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-cadtBlue to-cadtNavy"></div>
                      <h3 className="font-semibold text-cadtNavy">
                        {course.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {course.description || "No course description available."}
                      </p>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-cadtBlue h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/learn/${course.id}`)}
                        className="mt-4 w-full rounded-lg bg-cadtBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cadtNavy"
                      >
                        {progress === 100 ? "Review Course" : "Continue Learning"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explore Courses */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-cadtNavy">
              Explore Courses
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses
                .filter(course => !enrolledCourses.some(ec => ec.id === course.id))
                .map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card transition hover:shadow-lg"
                  >
                    <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-cadtBlue to-cadtNavy"></div>
                    <h3 className="font-semibold text-cadtNavy">
                      {course.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                      {course.description || "No course description available."}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level}
                      </span>
                      <span className="text-sm text-slate-500">
                        {course.duration_hrs} hrs
                      </span>
                    </div>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className="mt-4 w-full rounded-lg bg-cadtBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cadtNavy disabled:opacity-60"
                    >
                      {enrollingId === course.id ? "Enrolling..." : "Enroll Now"}
                    </button>
                  </div>
                ))}

              {courses.filter(course => !enrolledCourses.some(ec => ec.id === course.id)).length === 0 && (
                <div className="col-span-full rounded-2xl border border-cadtLine bg-white p-8 text-center shadow-card">
                  <p className="text-slate-500">
                    You've enrolled in all available courses! Check back later for new content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
