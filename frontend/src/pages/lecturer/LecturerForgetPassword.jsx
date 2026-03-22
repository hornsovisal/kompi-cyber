import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function LecturerForgetPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear errors when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
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
      const response = await axios.post('/api/lecturer/forgot-password', { email });
      setMessage('Password reset email sent successfully! Please check your email.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send reset email');
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
              🔐
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-blue-600">
              Lecturer Portal
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-800">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive password reset instructions
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
                value={email}
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

            {message && (
              <div className={`rounded-2xl p-4 text-sm ${
                message.includes('successfully')
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
                  Sending Reset Email...
                </div>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/lecturer/login"
              className="text-sm text-blue-600 hover:text-blue-700 transition"
            >
              ← Back to Login
            </Link>
          </div>

          {/* Sample lecturer accounts info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Available Lecturer Accounts:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Sarah Johnson:</strong> sarah.johnson@cadt.edu.kh</p>
              <p><strong>Michael Chen:</strong> michael.chen@cadt.edu.kh</p>
              <p><strong>Lisa Rodriguez:</strong> lisa.rodriguez@cadt.edu.kh</p>
              <p><strong>David Kim:</strong> david.kim@cadt.edu.kh</p>
              <p><strong>Emma Wilson:</strong> emma.wilson@cadt.edu.kh</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}