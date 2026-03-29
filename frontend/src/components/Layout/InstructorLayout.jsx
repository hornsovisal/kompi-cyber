import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Home,
  BookOpen,
  BarChart3,
  Settings,
  FileQuestion,
  Users,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

export default function InstructorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const getStored = (key) =>
    localStorage.getItem(key) || sessionStorage.getItem(key);

  // Read instructor and role from sessionStorage
  let instructor = null;
  try {
    instructor = JSON.parse(getStored("instructor") || "null");
  } catch {
    instructor = null;
  }

  const role = instructor?.role || "instructor"; // 'instructor' | 'coordinator'
  const isCoordinator = role === "coordinator";

  useEffect(() => {
    const token = getStored("token");
    const instructor = getStored("instructor");
    const sessionExpires = getStored("sessionExpires");

    if (!token || !instructor) {
      navigate("/", { replace: true });
    } else if (
      sessionExpires &&
      parseInt(sessionExpires, 10) <= new Date().getTime()
    ) {
      // Session expired
      ["token", "user", "instructor", "sessionExpires"].forEach((key) => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    ["token", "user", "instructor", "sessionExpires"].forEach((key) => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // ── Coordinator Nav ──────────────────────────────────────────────────────
  const coordinatorNav = [
    { label: 'Dashboard',       icon: Home,        path: '/coordinator/dashboard' },
    { label: 'Manage Courses',  icon: BookOpen,    path: '/coordinator/courses' },
    { label: 'Assign Instructors', icon: ShieldCheck, path: '/coordinator/courses' },
    { label: 'Analytics',       icon: BarChart3,   path: '/coordinator/analytics' },
    { label: 'Settings',        icon: Settings,    path: '/coordinator/settings' },
  ];

  // ── Instructor Nav ───────────────────────────────────────────────────────
  const instructorNav = [
    { label: 'Dashboard',       icon: Home,        path: '/instructor/dashboard' },
    { label: 'My Courses',      icon: BookOpen,    path: '/instructor/courses' },
    { label: 'My Quizzes',      icon: FileQuestion,path: '/instructor/quizzes' },
    { label: 'Students',        icon: Users,       path: '/instructor/students' },
    { label: 'Performance',     icon: BarChart3,   path: '/instructor/performance' },
    { label: 'Settings',        icon: Settings,    path: '/instructor/settings' },
  ];

  const navItems = isCoordinator ? coordinatorNav : instructorNav;

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
          <p className="text-slate-400 text-xs mt-1">
            {isCoordinator ? '🎓 Program Coordinator' : '👨‍🏫 Instructor Portal'}
          </p>
        </div>

        {/* Role badge */}
        <div className="mx-4 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isCoordinator
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
          }`}>
            <ShieldCheck size={12} />
            {isCoordinator ? 'Coordinator' : 'Instructor'}
          </span>
        </div>

        <nav className="mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
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
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Coordinator-only: Create Course shortcut */}
          {isCoordinator && (
            <button
              onClick={() => { navigate('/coordinator/create-course'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className="w-full px-6 py-3 flex items-center gap-3 text-emerald-400 hover:bg-slate-800 transition-colors mt-2 border-t border-slate-700"
            >
              <PlusCircle size={20} />
              <span className="font-medium">+ New Course</span>
            </button>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          {instructor && (
            <div className="mb-3 px-2">
              <p className="text-sm font-semibold text-white truncate">{instructor.name}</p>
              <p className="text-xs text-slate-400 truncate">{instructor.department}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-30"
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
