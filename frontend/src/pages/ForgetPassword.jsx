import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgetPassword() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
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
      const response = await axios.post("/api/auth/forgot-password", {
        email: formData.email.trim(),
      });

      setAlert({
        type: "success",
        message: response.data.message || "Password reset email sent!",
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send reset email. Please try again.";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cadtSky via-white to-slate-100 px-4 py-10">
      <main className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-cadtLine bg-white p-8 shadow-card">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cadtBlue text-2xl font-bold text-white shadow-lg">
              KC
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-cadtBlue">
              Kompi-Cyber
            </p>
            <h1 className="mt-3 text-3xl font-bold text-cadtNavy">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email to receive a password reset link
            </p>
          </div>

          {alert && (
            <div
              className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                alert.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {alert.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-xl border px-3 py-2 shadow-sm focus:border-cadtBlue focus:outline-none focus:ring-1 focus:ring-cadtBlue ${
                  errors.email ? "border-red-300" : "border-slate-300"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cadtBlue px-4 py-2 text-white shadow-sm hover:bg-cadtBlue/90 focus:outline-none focus:ring-2 focus:ring-cadtBlue focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-cadtBlue hover:text-cadtBlue/80"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}