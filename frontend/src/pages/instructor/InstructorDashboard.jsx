import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  Users,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Star,
  TrendingUp,
} from "lucide-react";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    studentsEnrolled: 0,
    totalModules: 0,
    totalStudents: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token") || "test-token";
      // TODO: Remove this after testing. Uncomment line below for production
      // if (!token) {
      //   navigate("/instructor/login");
      //   return;
      // }

      const response = await axios.get("/api/instructor/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const coursesList = response.data.data || [];
      setCourses(coursesList);

      // Calculate stats from courses data
      const totalCourses = coursesList.length;
      const activeCourses = coursesList.filter(
        (c) => c.status === "published",
      ).length;
      const totalModules = coursesList.reduce(
        (sum, c) => sum + (c.moduleCount || 0),
        0,
      );
      const studentsEnrolled = coursesList.reduce(
        (sum, course) => sum + (course.enrollmentCount || 0),
        0,
      );
      const totalStudents = studentsEnrolled; // Total unique students or enrollments
      const totalEarnings = studentsEnrolled * 150; // $150 per student enrollment

      setStats({
        totalCourses,
        activeCourses,
        studentsEnrolled,
        totalModules,
        totalStudents,
        totalEarnings,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/instructor/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm mt-2">
                Welcome to KC NextGen Cybersecurity Platform
              </p>
            </div>
            <button
              onClick={() => navigate("/instructor/courses/create")}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Create Course
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="alert alert-error shadow-lg mb-8">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-bold">Error Loading Dashboard</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Statistics Cards - 2x3 Grid with professional dark theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCardWithAccent
            icon={BookOpen}
            title="Courses Taught"
            value={stats.totalCourses}
          />
          <StatCardWithAccent
            icon={Users}
            title="Active Courses"
            value={stats.activeCourses}
          />
          <StatCardWithAccent
            icon={TrendingUp}
            title="Students Enrolled"
            value={`${(stats.studentsEnrolled / 1000).toFixed(1)}k`}
          />
          <StatCardWithAccent
            icon={BookOpen}
            title="Total Modules"
            value={stats.totalModules}
          />
          <StatCardWithAccent
            icon={Users}
            title="Total Students"
            value={`${(stats.totalStudents / 1000).toFixed(1)}k`}
          />
          <StatCardWithAccent
            icon={BarChart3}
            title="Total Earnings"
            value={`$${(stats.totalEarnings / 1000).toFixed(0)}k+`}
          />
        </div>

        {/* Course Performance Section */}
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <h2 className="card-title text-2xl">
                <BookOpen className="text-orange-600" size={28} />
                Course Performance
              </h2>
              <button
                onClick={() => navigate("/instructor/analytics")}
                className="link link-primary text-orange-600 hover:text-orange-700 font-semibold"
              >
                See All Analytics →
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={48} className="text-orange-400" />
                </div>
                <p className="text-slate-600 text-lg font-semibold mb-2">
                  No courses yet
                </p>
                <p className="text-slate-500 text-sm mb-8">
                  Create your first course to get started with your students
                </p>
                <button
                  onClick={() => navigate("/instructor/courses/create")}
                  className="btn btn-primary bg-orange-600 hover:bg-orange-700 border-none text-white"
                >
                  <Plus size={18} />
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="table table-zebra w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-slate-900 font-bold">Course Name</th>
                      <th className="text-slate-900 font-bold">Enrolled</th>
                      <th className="text-slate-900 font-bold">Rating</th>
                      <th className="text-right text-slate-900 font-bold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr
                        key={course.id}
                        className="hover:bg-orange-50 transition-colors"
                      >
                        <td>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {course.title}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              {course.description?.substring(0, 40)}...
                            </p>
                          </div>
                        </td>
                        <td>
                          <div className="badge badge-lg badge-orange">
                            {course.enrollmentCount || 0}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Star
                              size={16}
                              className="text-yellow-400 fill-yellow-400"
                            />
                            <span className="font-semibold">4.0</span>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(`/instructor/courses/${course.id}`)
                              }
                              className="btn btn-ghost btn-sm btn-circle text-blue-600 hover:bg-blue-100"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/instructor/courses/${course.id}/edit`,
                                )
                              }
                              className="btn btn-ghost btn-sm btn-circle text-green-600 hover:bg-green-100"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="btn btn-ghost btn-sm btn-circle text-red-600 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Professional Stat Card with dark modern theme and hover lift effect
function StatCardWithAccent({ icon, title, value }) {
  const Icon = icon;
  return (
    <div className="relative group overflow-hidden rounded-lg bg-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-600 hover:border-teal-500 transform hover:-translate-y-2 cursor-default">
      {/* Enhanced hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative p-6">
        {/* Header with title and icon */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {title}
            </p>
          </div>
          <div className="bg-teal-600/20 rounded-lg p-3 ml-4">
            <Icon size={22} className="text-teal-400" />
          </div>
        </div>

        {/* Value display */}
        <div>
          <h3 className="text-4xl font-bold text-white leading-tight">
            {value}
          </h3>
        </div>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-teal-500 to-transparent"></div>
      </div>
    </div>
  );
}
