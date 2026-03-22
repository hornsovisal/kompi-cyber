import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, BookOpen, BarChart3, Settings } from 'lucide-react';

export default function InstructorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/instructor/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/instructor/dashboard' },
    { label: 'Courses', icon: BookOpen, path: '/instructor/courses' },
    { label: 'Analytics', icon: BarChart3, path: '/instructor/analytics' },
    { label: 'Settings', icon: Settings, path: '/instructor/settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-slate-900 text-white transition-all duration-300 fixed h-screen overflow-y-auto z-40 lg:relative lg:w-64`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold">KC NextGen</h1>
          <p className="text-slate-400 text-xs mt-1">Instructor Portal</p>
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
                    ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
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
