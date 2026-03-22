import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Home,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";

export default function InstructorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/instructor/login");
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", icon: Home, path: "/instructor/dashboard" },
    { label: "Courses", icon: BookOpen, path: "/instructor/courses" },
    { label: "Analytics", icon: BarChart3, path: "/instructor/analytics" },
    { label: "Settings", icon: Settings, path: "/instructor/settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar - DataCamp Style */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white transition-all duration-300 fixed h-screen overflow-y-auto z-40 lg:relative lg:w-72 shadow-xl`}
      >
        {/* Header with gradient background */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-8 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">KC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">KC NextGen</h1>
              <p className="text-orange-100 text-xs mt-0.5">Instructor</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 py-8 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-4 mb-4">
            Menu
          </div>
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
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-4 font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                }`}
              >
                <Icon size={22} className="flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 text-slate-300 hover:text-white px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-all duration-200 font-medium"
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg z-30"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
