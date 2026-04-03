import { useEffect, useState } from "react";
import axios from "axios";
import { Users, BookOpen, BarChart3 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(`${API_BASE}/api/instructor/stats`, {
        headers,
      });

      if (response.data.data) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={40} className="opacity-50" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Coordinator Dashboard
        </h1>
        <p className="text-slate-600 mt-2">
          Manage programs and oversee student progress
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 mt-4">Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Courses Managed"
              value={stats.totalCourses}
              icon={BookOpen}
              bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              bgColor="bg-gradient-to-br from-green-600 to-green-700"
            />
            <StatCard
              title="Quizzes Created"
              value={stats.totalQuizzes}
              icon={BarChart3}
              bgColor="bg-gradient-to-br from-purple-600 to-purple-700"
            />
          </div>

          {/* Welcome Message */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-slate-600">
              As a coordinator, you can manage programs, track student progress,
              and oversee course delivery. Use the navigation menu on the left
              to access different sections.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
