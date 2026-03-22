import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function LecturerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/lecturer/login', formData);

      // Store token in localStorage
      localStorage.setItem('lecturerToken', response.data.token);
      localStorage.setItem('lecturerData', JSON.stringify(response.data.lecturer));

      setMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/lecturer/dashboard'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-10">
      <main className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
              👨‍🏫
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-blue-600">
              Lecturer Portal
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-800">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your lecturer account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-4 ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="lecturer@cadt.edu.kh"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-4 ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {message && (
              <div className={`rounded-2xl p-4 text-sm ${
                message.includes('successful')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/lecturer/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-700 transition"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Sample lecturer accounts info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Available Lecturer Accounts:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Sarah Johnson:</strong> sarah.johnson@cadt.edu.kh <em>(Network Security)</em></p>
              <p><strong>Michael Chen:</strong> michael.chen@cadt.edu.kh <em>(Web Security)</em></p>
              <p><strong>Lisa Rodriguez:</strong> lisa.rodriguez@cadt.edu.kh <em>(Incident Response)</em></p>
              <p><strong>David Kim:</strong> david.kim@cadt.edu.kh <em>(Introduction to Linux)</em></p>
              <p><strong>Emma Wilson:</strong> emma.wilson@cadt.edu.kh <em>(Introduction to Cybersecurity)</em></p>
              <p className="mt-2 text-blue-600"><em>Password: password123 for all accounts</em></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}