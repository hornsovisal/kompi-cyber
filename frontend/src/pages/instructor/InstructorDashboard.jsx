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
      const activeCourses = coursesList.filter((c) => c.status === "published").length;
      const totalModules = coursesList.reduce((sum, c) => sum + (c.moduleCount || 0), 0);
      const studentsEnrolled = coursesList.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">
                Welcome to KC NextGen Cybersecurity Platform
              </p>
            </div>
            <button
              onClick={() => navigate("/instructor/courses/create")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus size={20} />
              Create Course
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Statistics Cards - 2x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Courses Taught"
            value={`${stats.totalCourses}+`}
            color="blue"
          />
          <StatCard
            icon={Users}
            title="Active Courses"
            value={`${stats.activeCourses}+`}
            color="yellow"
          />
          <StatCard
            icon={BarChart3}
            title="Students Enrolled"
            value={`${(stats.studentsEnrolled / 1000).toFixed(1)}k`}
            color="cyan"
          />
          <StatCard
            icon={BookOpen}
            title="Total Modules"
            value={`${stats.totalModules}+`}
            color="purple"
          />
          <StatCard
            icon={Users}
            title="Total Students"
            value={`${(stats.totalStudents / 1000).toFixed(1)}k`}
            color="pink"
          />
          <StatCard
            icon={BarChart3}
            title="Total Earnings"
            value={`$${(stats.totalEarnings / 1000).toFixed(0)}k+`}
            color="indigo"
          />
        </div>

        {/* Course Performance Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Course Performance
              </h2>
              <button
                onClick={() => navigate("/instructor/analytics")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                See All →
              </button>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 text-lg">No courses yet</p>
              <p className="text-slate-500 text-sm mt-2">
                Create your first course to get started
              </p>
              <button
                onClick={() => navigate("/instructor/courses/create")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create Course
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Course Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Enrolled Students
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, idx) => (
                    <tr
                      key={course.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {course.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {course.description?.substring(0, 50)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {course.enrollmentCount || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star
                            size={16}
                            className="text-yellow-400 fill-yellow-400"
                          />
                          <span className="text-slate-700 font-medium">
                            4.0
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/instructor/courses/${course.id}`)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/instructor/courses/${course.id}/edit`)
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit course"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete course"
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
  );
}

// Stat Card Component
function StatCard({ icon: Icon, title, value, color }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    yellow: "bg-amber-100 text-amber-700 border-amber-300",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
    pink: "bg-pink-100 text-pink-700 border-pink-300",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
  };

  return (
    <div className={`border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium opacity-75">{title}</h3>
        <Icon size={24} />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
