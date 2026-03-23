import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
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
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-cyan-200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2L4 5.5V11.5C4 16.3 7.3 20.7 12 22C16.7 20.7 20 16.3 20 11.5V5.5L12 2Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9.2 11.9L11.1 13.8L14.8 10.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Kompi-Cyber</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-100">Forgot Password</h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {(message || error) && (
            <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
              error
                ? 'border-rose-300/30 bg-rose-500/10 text-rose-200'
                : 'border-emerald-300/30 bg-emerald-500/10 text-emerald-200'
            }`}>
              {error || message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/20"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}