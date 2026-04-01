import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

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
        const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { token });
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
              Email Verification
            </h1>
          </div>

          <div className="text-center">
            {status === 'verifying' && (
              <div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
                <p className="text-gray-600">Verifying your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mb-4 text-green-600 font-medium">{message}</p>
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="mb-4 text-red-600 font-medium">{message}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-2xl bg-cadtBlue px-4 py-3 text-sm font-semibold text-white transition hover:bg-cadtNavy focus:outline-none focus:ring-4 focus:ring-blue-200"
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