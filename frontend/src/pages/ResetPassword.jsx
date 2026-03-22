import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setTokenValid(false);
      setMessage('Invalid reset link');
    } else {
      setTokenValid(true);
    }
  }, [searchParams]);

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const token = searchParams.get('token');
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password: formData.password
      });

      setMessage('Password reset successfully! You can now log in with your new password.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
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
              <h1 className="mt-3 text-3xl font-bold text-slate-100">Reset Password</h1>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 border border-rose-400/30">
                <svg className="h-6 w-6 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="mb-6 text-rose-300 font-medium">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
              >
                Go to Login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            <h1 className="mt-3 text-3xl font-bold text-slate-100">Reset Password</h1>
            <p className="mt-2 text-sm text-slate-400">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-200">
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-4 ${
                  errors.password
                    ? 'border-rose-400/60 focus:border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-700 focus:border-cyan-300 focus:ring-cyan-500/20'
                }`}
                placeholder="Enter new password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-rose-300">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-200">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-2xl border bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-4 ${
                  errors.confirmPassword
                    ? 'border-rose-400/60 focus:border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-700 focus:border-cyan-300 focus:ring-cyan-500/20'
                }`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-rose-300">{errors.confirmPassword}</p>
              )}
            </div>

            {message && (
              <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                message.includes('successfully')
                  ? 'border-emerald-300/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-300/30 bg-rose-500/10 text-rose-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-cyan-400 transition hover:text-cyan-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}