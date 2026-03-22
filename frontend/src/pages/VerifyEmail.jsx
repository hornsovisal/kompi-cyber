import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post('/api/auth/verify-email', { token });
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

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
            <h1 className="mt-3 text-3xl font-bold text-slate-100">Email Verification</h1>
          </div>

          <div className="text-center">
            {status === 'verifying' && (
              <div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
                </div>
                <p className="text-slate-400">Verifying your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
                  <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mb-4 font-medium text-emerald-300">{message}</p>
                <p className="text-sm text-slate-400">Redirecting to login page...</p>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10">
                  <svg className="h-6 w-6 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="mb-6 font-medium text-rose-300">{message}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/30"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}