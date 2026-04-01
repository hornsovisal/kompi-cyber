import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email },
        { timeout: 10000 } // 10 second timeout
      );
      setMessage(response.data.message);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response?.status === 404) {
        setError('Password reset endpoint not found. Please contact support.');
      } else {
        setError(err.response?.data?.message || err.message || 'An error occurred. Please try again.');
      }
      console.error('Forgot password error:', err);
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
              KOMPI-CYBER
            </p>
            <h1 className="mt-3 text-3xl font-bold text-cadtNavy">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {(message || error) && (
            <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              error
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}>
              {error || message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-cadtNavy"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-cadtLine bg-white px-4 py-3 outline-none transition focus:border-cadtBlue focus:ring-4 focus:ring-blue-100"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cadtBlue px-4 py-3 text-sm font-semibold text-white transition hover:bg-cadtNavy focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-cadtBlue hover:text-cadtNavy"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}