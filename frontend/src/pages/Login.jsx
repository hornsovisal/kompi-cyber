import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword(!showPassword);
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
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1a2e] text-gray-200">
      <div className="bg-[#16213e] p-10 rounded-lg shadow-lg w-96 border border-[#0f3460]">
        <i className="fas fa-shield-alt text-5xl text-[#00d4ff] mb-2 block text-center"></i>
        <h1 className="text-2xl font-bold text-[#00d4ff] text-center mb-2">Kompi_Cyber</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Cybersecurity Learning Platform</p>

        {error && (
          <div className="mb-4 p-2 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form autoComplete="off" onSubmit={handleSubmit} className="space-y-4">
          {/* hidden inputs to trick autofill */}
          <input type="text" name="fakeusernameremembered" style={{display: 'none'}} />
          <input type="password" name="fakepasswordremembered" style={{display: 'none'}} />
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              Email / Student ID
            </label>
            <input
              type="text"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full p-2 rounded-md border border-[#0f3460] bg-[#1a1a2e] text-gray-200 focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="off"
                className="w-full p-2 pr-10 rounded-md border border-[#0f3460] bg-[#1a1a2e] text-gray-200 focus:outline-none focus:border-[#00d4ff]"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-200 bg-transparent border-0 p-0"
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm mb-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <a href="#" className="text-[#00d4ff] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-[#0f3460] text-white font-semibold hover:bg-[#00d4ff] hover:text-[#16213e] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center text-gray-400 text-sm my-4">or continue with</div>

          <button
            type="button"
            className="w-full py-2 rounded-md border border-[#0f3460] bg-[#1a1a2e] text-gray-200 flex items-center justify-center hover:border-[#00d4ff] transition"
          >
            <i className="fab fa-microsoft mr-2"></i> Sign in with Microsoft 365
          </button>

          <div className="text-center text-sm mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00d4ff] hover:underline">
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
