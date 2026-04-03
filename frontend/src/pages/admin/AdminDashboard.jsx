import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, UserPlus, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCoordinators: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      const [usersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/users/admin/all-users`, { headers }),
      ]);

      const users = usersRes.data.data || [];
      const roleMap = {
        1: "students",
        2: "teachers",
        3: "admins",
        4: "coordinators",
      };

      const stats = {
        totalUsers: users.length,
        totalStudents: users.filter((u) => u.role_id === 1).length,
        totalTeachers: users.filter((u) => u.role_id === 2).length,
        totalCoordinators: users.filter((u) => u.role_id === 4).length,
        totalAdmins: users.filter((u) => u.role_id === 3).length,
      };

      setStats(stats);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load statistics");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back! Manage your platform here.</p>
        </div>
        <button
          onClick={() => navigate("/admin/users")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20} />
          Manage Users
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 mt-4">Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
            />
            <StatCard
              title="Students"
              value={stats.totalStudents}
              icon={Users}
              bgColor="bg-gradient-to-br from-green-600 to-green-700"
            />
            <StatCard
              title="Teachers"
              value={stats.totalTeachers}
              icon={Users}
              bgColor="bg-gradient-to-br from-yellow-600 to-yellow-700"
            />
            <StatCard
              title="Coordinators"
              value={stats.totalCoordinators}
              icon={Users}
              bgColor="bg-gradient-to-br from-purple-600 to-purple-700"
            />
            <StatCard
              title="Admins"
              value={stats.totalAdmins}
              icon={Users}
              bgColor="bg-gradient-to-br from-red-600 to-red-700"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
              >
                <Users size={24} className="text-blue-600 mb-2" />
                <p className="font-medium text-slate-900">Manage Users</p>
                <p className="text-sm text-slate-600">View and edit user accounts</p>
              </button>

              <button
                onClick={() => navigate("/admin/users?role=2")}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-yellow-600 hover:bg-yellow-50 transition-all text-left"
              >
                <Users size={24} className="text-yellow-600 mb-2" />
                <p className="font-medium text-slate-900">Create Teacher</p>
                <p className="text-sm text-slate-600">Add new teacher accounts</p>
              </button>

              <button
                onClick={() => navigate("/admin/users?role=4")}
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all text-left"
              >
                <Users size={24} className="text-purple-600 mb-2" />
                <p className="font-medium text-slate-900">Create Coordinator</p>
                <p className="text-sm text-slate-600">Add new coordinator accounts</p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
