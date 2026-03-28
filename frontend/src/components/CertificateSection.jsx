import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Award, Download, CheckCircle, Eye } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function CertificateSection({ courseId, courseName, token }) {
  const navigate = useNavigate();
  const [completionStatus, setCompletionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    if (!token || !courseId) return;

    const loadStatus = async () => {
      setLoading(true);
      setError("");
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Get completion status
        const statusRes = await axios.get(
          `/api/certificates/status/${courseId}`,
          {
            baseURL: API_BASE,
            headers,
          },
        );

        setCompletionStatus(statusRes.data);

        // If completed, check if certificate exists
        if (statusRes.data.completed) {
          try {
            const certRes = await axios.get(
              `/api/certificates/course/${courseId}`,
              {
                baseURL: API_BASE,
                headers,
              },
            );
            setCertificate(certRes.data.certificate);
          } catch (certErr) {
            if (certErr.response?.status !== 404) {
              console.error("Error fetching certificate:", certErr);
            }
          }
        }
      } catch (err) {
        console.error("Error loading completion status:", err);
        setError("Failed to load completion status");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [courseId, token]);

  const handleGenerateCertificate = async () => {
    if (!token || !courseId) return;

    setGenerating(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        `/api/certificates/generate/${courseId}`,
        {},
        {
          baseURL: API_BASE,
          headers,
        },
      );

      setCertificate(res.data.certificate);
      setCompletionStatus((prev) => ({
        ...prev,
        hasCertificate: true,
      }));
    } catch (err) {
      console.error("Error generating certificate:", err);
      setError(err.response?.data?.message || "Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (certificate?.pdf_path) {
      const downloadUrl = `${API_BASE}${certificate.pdf_path}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `certificate-${certificate.certificate_code}.pdf`;
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    }
  };

  const handleViewCertificate = () => {
    if (!certificate) {
      setError("Certificate not available");
      return;
    }
    
    const hash = certificate.certificate_hash;
    if (hash) {
      navigate(`/certificate/${hash}`);
    } else {
      console.error("Certificate hash not available. Full certificate object:", certificate);
      setError("Certificate hash is missing. Please generate the certificate again.");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">Loading certificate status...</p>
      </div>
    );
  }

  const completionPercentage = completionStatus
    ? ((completionStatus.stats?.completedLessons || 0) /
        (completionStatus.stats?.totalLessons || 1)) *
      100
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-amber-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Course Completion & Certificate
          </h3>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Completion Stats */}
      {completionStatus && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 hover:shadow-md transition">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Lessons Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {completionStatus.stats?.completedLessons || 0}/
                {completionStatus.stats?.totalLessons || 0}
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 hover:shadow-md transition">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Average Score
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-700">
                {completionStatus.stats?.averageScore || 0}%
              </p>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 hover:shadow-md transition">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                Best Score
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {completionStatus.stats?.highestScore || 0}%
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4 hover:shadow-md transition">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Status
              </p>
              <p className="mt-2 flex items-center gap-2">
                {completionStatus.completed ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-lg font-bold text-emerald-700">
                      Completed
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-amber-700">
                    In Progress
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Completion Progress
              </span>
              <span className="text-sm font-bold text-slate-900">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Certificate Section */}
      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-6 w-6 text-amber-600" />
              <h4 className="text-xl font-bold text-amber-900">
                {completionStatus?.completed
                  ? "🎓 Course Completed!"
                  : "🏆 Earn Your Certificate"}
              </h4>
            </div>
            <p className="text-sm text-amber-800">
              {completionStatus?.completed
                ? "Congratulations! You've successfully completed this course. Generate your certificate to showcase your achievement."
                : "Complete all lessons and quizzes to unlock your certificate."}
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            {certificate ? (
              <>
                <button
                  onClick={handleViewCertificate}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#378ADD] to-[#0C447C] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-95"
                >
                  <Eye className="h-4 w-4" />
                  View Certificate
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  className="flex items-center gap-2 rounded-lg bg-[#EF9F27] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 hover:shadow-xl active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </>
            ) : (
              <button
                onClick={handleGenerateCertificate}
                disabled={generating || !completionStatus?.completed}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#378ADD] to-[#0C447C] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Award className="h-4 w-4" />
                {generating ? "Generating..." : "Get Certificate"}
              </button>
            )}
          </div>
        </div>

        {certificate && (
          <div className="mt-6 border-t-2 border-amber-200 pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase">
                  Certificate ID
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-amber-900">
                  {certificate.certificate_code}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase">
                  Issued Date
                </p>
                <p className="mt-1 text-sm font-bold text-amber-900">
                  {new Date(certificate.issued_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase">
                  Status
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  Valid & Active
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
