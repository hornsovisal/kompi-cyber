import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";

function CreateAccount() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePassword = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "confirm") {
      setShowConfirm(!showConfirm);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirm) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirm) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1a2e] text-gray-200">
      <div className="bg-[#16213e] p-10 rounded-lg shadow-lg w-96 border border-[#0f3460] text-center">
        <i className="fas fa-shield-alt text-5xl text-[#00d4ff] mb-2 block"></i>
        <h1 className="text-2xl font-bold text-[#00d4ff] mb-2">Kompi_Cyber</h1>
        <p className="text-sm text-gray-400 mb-4">Cybersecurity Learning Platform</p>
        <h2 className="text-xl font-semibold mb-2">Create Your Account</h2>
        <p className="text-sm text-gray-400 mb-6">
          Join Kompi_Cyber to master cybersecurity skills
        </p>

        {error && (
          <div className="mb-4 p-2 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="name" className="block text-sm mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full p-2 rounded-md border border-[#0f3460] bg-[#1a1a2e] text-gray-200 focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full p-2 rounded-md border border-[#0f3460] bg-[#1a1a2e] text-gray-200 focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className="w-full p-2 pr-10 rounded-md border border-[#0f3460] bg-[#1a1a2e] text-gray-200 focus:outline-none focus:border-[#00d4ff]"
              />
              <button
                type="button"
                onClick={() => togglePassword("password")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-200 bg-transparent border-0 p-0"
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                id="confirm"
                value={formData.confirm}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full p-2 pr-10 rounded-md border border-[#0f3460] bg-[#1a1a2e] text-gray-200 focus:outline-none focus:border-[#00d4ff]"
              />
              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-200 bg-transparent border-0 p-0"
              >
                <i className={`fas ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[#0f3460] text-white font-semibold hover:bg-[#00d4ff] hover:text-[#16213e] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          ← Already have an account?{' '}
          <Link to="/login" className="text-[#00d4ff] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
