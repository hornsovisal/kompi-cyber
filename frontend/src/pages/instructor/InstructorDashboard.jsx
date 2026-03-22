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
  Clock,
  TrendingUp,
} from "lucide-react";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/instructor/login");
        return;
      }

      const response = await axios.get("/api/instructor/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const coursesList = response.data.data || [];
      setCourses(coursesList);

      // Calculate stats
      const totalStudents = coursesList.reduce(
        (sum, course) => sum + (course.enrollmentCount || 0),
        0,
      );
      const totalQuizzes = coursesList.reduce(
        (sum, course) => sum + (course.quizCount || 0),
        0,
      );

      setStats({
        totalCourses: coursesList.length,
        totalStudents,
        totalQuizzes,
        completionRate: Math.round(Math.random() * 100), // Replace with real data
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
              <h1 className="text-3xl font-bold text-slate-900">
                Instructor Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Welcome back! Manage your courses and track student progress
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Total Courses"
            value={stats.totalCourses}
            color="blue"
          />
          <StatCard
            icon={Users}
            title="Total Students"
            value={stats.totalStudents}
            color="green"
          />
          <StatCard
            icon={BarChart3}
            title="Total Quizzes"
            value={stats.totalQuizzes}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Avg Completion"
            value={`${stats.completionRate}%`}
            color="orange"
          />
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <BookOpen className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Your Courses</h2>
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
            <div className="divide-y divide-slate-200">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{course.enrollmentCount || 0} students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 size={16} />
                          <span>{course.quizCount || 0} quizzes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{course.moduleCount || 0} modules</span>
                        </div>
                        <div>
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {course.status || "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="View Student Responses"
            description="Check quiz responses and student progress"
            icon={BarChart3}
            onClick={() => navigate("/instructor/responses")}
            color="blue"
          />
          <QuickActionCard
            title="Manage Quizzes"
            description="Create, edit, or delete quizzes"
            icon={BookOpen}
            onClick={() => navigate("/instructor/quizzes")}
            color="purple"
          />
          <QuickActionCard
            title="View Analytics"
            description="View course statistics and insights"
            icon={TrendingUp}
            onClick={() => navigate("/instructor/analytics")}
            color="green"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, title, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
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

// Quick Action Card
function QuickActionCard({ title, description, icon: Icon, onClick, color }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 hover:border-blue-300",
    green: "bg-green-50 border-green-200 hover:border-green-300",
    purple: "bg-purple-50 border-purple-200 hover:border-purple-300",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <button
      onClick={onClick}
      className={`border-2 rounded-lg p-6 text-left transition-all hover:shadow-md ${colorClasses[color]}`}
    >
      <Icon className={`${iconColorClasses[color]} mb-3`} size={28} />
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </button>
  );
}
