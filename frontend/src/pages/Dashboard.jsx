import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
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
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-cadtNavy">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Continue your cybersecurity learning journey
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-10 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <div className="mb-3 text-3xl">📚</div>
              <p className="text-sm text-slate-600">Courses</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <div className="mb-3 text-3xl">✅</div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <div className="mb-3 text-3xl">🏆</div>
              <p className="text-sm text-slate-600">Certificates</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
            </div>

            <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card">
              <div className="mb-3 text-3xl">⏱️</div>
              <p className="text-sm text-slate-600">Hours Learned</p>
              <p className="mt-2 text-2xl font-bold text-cadtBlue">0</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-10">
            <h2 className="mb-6 text-2xl font-bold text-cadtNavy">
              Recent Activity
            </h2>
            <div className="rounded-2xl border border-cadtLine bg-white p-8 shadow-card">
              <p className="text-center text-slate-500">
                No recent activity. Start learning now!
              </p>
            </div>
          </div>

          {/* Available Courses */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-cadtNavy">
              Available Courses
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card transition hover:shadow-lg">
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-cadtBlue to-cadtNavy"></div>
                <h3 className="font-semibold text-cadtNavy">
                  Introduction to Cybersecurity
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Learn the fundamentals of cybersecurity
                </p>
                <button className="mt-4 w-full rounded-lg bg-cadtBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cadtNavy">
                  Enroll Now
                </button>
              </div>

              <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card transition hover:shadow-lg">
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700"></div>
                <h3 className="font-semibold text-cadtNavy">
                  Network Security
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Master network security concepts
                </p>
                <button className="mt-4 w-full rounded-lg bg-cadtBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cadtNavy">
                  Enroll Now
                </button>
              </div>

              <div className="rounded-2xl border border-cadtLine bg-white p-6 shadow-card transition hover:shadow-lg">
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700"></div>
                <h3 className="font-semibold text-cadtNavy">Ethical Hacking</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Learn penetration testing techniques
                </p>
                <button className="mt-4 w-full rounded-lg bg-cadtBlue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cadtNavy">
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
