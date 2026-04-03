import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Home,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const instructor = sessionStorage.getItem("instructor");
    const sessionExpires = sessionStorage.getItem("sessionExpires");

    if (!token || !instructor) {
      navigate("/instructor/login", { replace: true });
    } else {
      const instructorData = JSON.parse(instructor);
      if (instructorData.roleId !== 3) {
        // Not admin, redirect to appropriate portal
        const redirectMap = {
          2: "/instructor/dashboard",
          4: "/coordinator/dashboard",
        };
        navigate(redirectMap[instructorData.roleId] || "/instructor/login", { replace: true });
      }
    }

    if (
      sessionExpires &&
      parseInt(sessionExpires, 10) <= new Date().getTime()
    ) {
      // Session expired
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("instructor");
      sessionStorage.removeItem("sessionExpires");
      navigate("/instructor/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("instructor");
    sessionStorage.removeItem("sessionExpires");
    navigate("/instructor/login");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { label: "Manage Users", icon: Users, path: "/admin/users" },
    { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto z-40 lg:relative lg:w-64`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold">KOMPI-CYBER</h1>
          <p className="text-slate-400 text-xs mt-1">Admin Portal</p>
        </div>

        <nav className="mt-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full px-6 py-3 flex items-center gap-3 transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-l-4 border-blue-400"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? (
              <X size={24} className="text-slate-700" />
            ) : (
              <Menu size={24} className="text-slate-700" />
            )}
          </button>
          <div className="text-slate-700 text-sm">Admin Dashboard</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
