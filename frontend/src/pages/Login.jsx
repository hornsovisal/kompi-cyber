import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      setAlert({ type: "success", message: "Login successful!" });

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080d1a] px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <main className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-400/15 shadow-lg shadow-cyan-500/20">
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9 text-cyan-200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2L4 5.5V11.5C4 16.3 7.3 20.7 12 22C16.7 20.7 20 16.3 20 11.5V5.5L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M9.2 11.9L11.1 13.8L14.8 10.1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6.9V8.2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Kompi-Cyber
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-100">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to continue your cybersecurity journey
            </p>
          </div>

          {alert && (
            <div
              className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                alert.type === "success"
                  ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-300/30 bg-rose-500/10 text-rose-200"
              }`}
            >
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/20"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-rose-300">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/20"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-rose-300">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
