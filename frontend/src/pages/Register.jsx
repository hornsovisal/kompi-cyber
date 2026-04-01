import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { validatePasswordStrength } from "../utils/passwordValidator";
import { API_BASE_URL } from "../config/api";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [resendMessage, setResendMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    level: "Weak",
    errors: [],
    feedback: [],
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time password strength validation
    if (name === "password") {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else {
      // Check password strength
      const strength = validatePasswordStrength(formData.password);
      if (strength.errors.length > 0) {
        newErrors.password = strength.errors[0]; // Show first error
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    setResendMessage("");
    setVerificationLink("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submittedEmail = formData.email.trim();
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        {
          name: formData.name.trim(),
          email: submittedEmail,
          password: formData.password,
        },
        { timeout: 10000 }, // 10 second timeout
      );

      setAlert({
        type: "success",
        message: response.data.message || "Registration successful!",
      });
      setVerificationLink(response.data?.verificationLink || "");
      setRegisteredEmail(submittedEmail);
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });

      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/resend-verification`,
        {
          email: registeredEmail,
        },
        { timeout: 10000 }, // 10 second timeout
      );
      setVerificationLink(response.data?.verificationLink || "");
      setResendMessage(
        response.data?.message ||
          "Verification email sent. Please check your inbox.",
      );
    } catch (error) {
      setResendMessage(
        error.response?.data?.message ||
          "Could not resend verification email. Please try again.",
      );
    } finally {
      setResendLoading(false);
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
              KOMPI-CYBER
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-100">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Join the platform and start your cybersecurity journey.
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

          {registeredEmail && alert?.type === "success" && (
            <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/5 p-6 text-center">
              <p className="mb-4 text-sm text-slate-300">
                Registration successful! Please log in with your credentials to
                continue.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
              >
                Go to Login
              </button>
            </div>
          )}

          {!registeredEmail && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/20"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-rose-300">{errors.name}</p>
                )}
              </div>

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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/20"
                />

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        Password Strength
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          passwordStrength.level === "Strong"
                            ? "text-emerald-400"
                            : passwordStrength.level === "Medium"
                              ? "text-yellow-400"
                              : "text-rose-400"
                        }`}
                      >
                        {passwordStrength.level}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/50">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.level === "Strong"
                            ? "w-full bg-emerald-500"
                            : passwordStrength.level === "Medium"
                              ? "w-2/3 bg-yellow-500"
                              : "w-1/3 bg-rose-500"
                        }`}
                      />
                    </div>

                    {/* Requirements Checklist */}
                    <div className="mt-2 space-y-1">
                      {passwordStrength.feedback.length > 0 && (
                        <div className="text-xs text-slate-400">
                          {passwordStrength.feedback.map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-1 ${
                                passwordStrength.errors.length === 0
                                  ? "text-emerald-400"
                                  : "text-slate-400"
                              }`}
                            >
                              <span>
                                {passwordStrength.errors.length === 0
                                  ? "✓"
                                  : "○"}
                              </span>
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-2 text-sm text-rose-300">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/20"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-rose-300">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}

          {!registeredEmail && (
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Go to Login
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
