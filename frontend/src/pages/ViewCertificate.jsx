import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  Share2,
  ArrowLeft,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  Zap,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function ViewCertificate() {
  const { certificateHash } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [certificateHash]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch certificate by hash
      const certRes = await fetch(
        `${API_BASE}/api/certificates/view/${certificateHash}`,
        { headers },
      );

      if (!certRes.ok) {
        throw new Error("Certificate not found");
      }

      const certData = await certRes.json();
      setCertificate(certData.certificate);

      // Fetch course details if we have a course_id
      if (certData.certificate?.course_id) {
        try {
          const courseRes = await fetch(
            `${API_BASE}/api/courses/${certData.certificate.course_id}`,
            { headers },
          );
          if (courseRes.ok) {
            const course = await courseRes.json();
            setCourseData(course);
          }
        } catch (err) {
          console.log("Could not fetch course details");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate?.pdf_path) {
      alert("Certificate PDF not available");
      return;
    }

    try {
      setDownloading(true);
      const pdfUrl = certificate.pdf_path;

      // Fetch the PDF
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error("Failed to download certificate");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `KOMPI-Cyber-Certificate-${certificate.certificate_code}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My KOMPI Cyber Certificate",
          text: `I just completed ${certificate?.title} on KOMPI Cyber!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Certificate link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-[#378ADD] border-t-[#0C447C] rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#378ADD] hover:text-[#0C447C] mb-8 font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Certificate Not Found
          </h1>
          <p className="text-gray-600 mt-2">
            {error || "Unable to load certificate"}
          </p>
        </div>
      </div>
    );
  }

  const issueDate = new Date(certificate.issued_at);
  const courseDescription =
    courseData?.description ||
    "A comprehensive cybersecurity course covering essential concepts and practical skills.";

  const skillsLearned = [
    "Cybersecurity fundamentals",
    "Threat identification and mitigation",
    "Security best practices",
    "Risk assessment techniques",
    "Incident response procedures",
  ];

  return (
    <div className="min-h-screen bg-white py-6 px-4">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#378ADD] hover:text-[#0C447C] font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to My Learning
        </button>
      </div>

      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-500 text-sm">📋 Certification</span>
              <span className="text-gray-500 text-sm">✓ Completed</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0C447C]">
              {certificate.title}
            </h1>
            <div className="flex items-center gap-4 mt-4 text-gray-600">
              <span className="flex items-center gap-1">
                <Award size={18} />
                {certificate.certificate_code}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={18} />
                Completed {issueDate.toLocaleDateString()}
              </span>
              <span className="text-sm">
                Duration <strong>4 months</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-70"
            >
              <Download size={18} className="inline mr-2" />
              {downloading ? "Downloading..." : "Download"}
            </button>
            <button
              onClick={handleShare}
              className="bg-[#EF9F27] text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-500 transition-all"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Certificate Preview */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              {/* Certificate Preview Card */}
              <div className="bg-gradient-to-br from-[#0C447C] to-[#1a5ba3] rounded-lg shadow-2xl overflow-hidden transform hover:scale-105 transition-transform">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0C447C] to-[#1a5ba3] p-8 text-center border-b-4 border-[#EF9F27]">
                  <p className="text-[#EF9F27] text-sm uppercase tracking-widest font-bold">
                    🔐 KOMPI CYBER
                  </p>
                  <p className="text-white text-xs mt-1 uppercase tracking-wide">
                    Certificate of Completion
                  </p>
                </div>

                {/* Content */}
                <div className="bg-white p-8 text-center">
                  <p className="text-gray-600 text-sm mb-4">Presented to</p>
                  <h2 className="text-2xl font-bold text-[#0C447C] mb-2">
                    {certificate.full_name || certificate.student_name}
                  </h2>
                  <div className="border-t-2 border-[#378ADD] my-6 pt-4">
                    <p className="text-gray-700 text-sm mb-2">for completing</p>
                    <p className="font-bold text-[#0C447C] text-sm">
                      {certificate.course_name}
                    </p>
                  </div>

                  {/* Certificate Details */}
                  <div className="bg-blue-50 rounded p-4 my-6 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-600">Certificate ID</p>
                        <p className="font-mono font-bold text-[#0C447C]">
                          {certificate.certificate_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Issued</p>
                        <p className="font-bold text-[#0C447C]">
                          {issueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 bg-[#EF9F27] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">★</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      VERIFIED CREDENTIALS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Details & Course Info */}
          <div className="lg:col-span-2">
            {/* Achievement Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-bold text-[#0C447C] mb-4">
                Achievement Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Final Grade</p>
                  <p className="text-3xl font-bold text-[#EF9F27]">
                    {certificate.stats?.averageScore
                      ? Math.round(certificate.stats.averageScore)
                      : "—"}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Duration</p>
                  <p className="text-2xl font-bold text-[#0C447C]">
                    {certificate.stats?.totalLessons || 0} lessons
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Certificate Badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200">
              <h3 className="text-lg font-bold text-green-800 mb-3">
                ✓ Verified Certificates
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                Share your achievement on your resume, LinkedIn, and other
                platforms.
              </p>
              <button className="w-full border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-all">
                ✓ Verify Certificate
              </button>
            </div>

            {/* Add to Profile Section */}
            <div className="flex gap-3 mb-6">
              <button className="flex-1 bg-[#378ADD] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#2966a3] transition-all">
                <Share2 size={18} className="inline mr-2" />
                Add to Profile
              </button>
              <button className="flex-1 border-2 border-[#378ADD] text-[#378ADD] px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all">
                <BookOpen size={18} className="inline mr-2" />
                Add to Resume
              </button>
            </div>

            {/* Instructor Info */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Instructor
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#378ADD] to-[#0C447C] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  MC
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Prof. Michael Chan
                  </p>
                  <p className="text-sm text-gray-600">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Course Info */}
        <div className="mt-12">
          {/* About This Course */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#0C447C] mb-4">
              About This Course
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg border border-gray-200">
              {courseDescription}
            </p>
          </div>

          {/* Skills You Gained */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#0C447C] mb-4">
              Skills You Gained
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Security Principles",
                "Business Continuity",
                "Disaster Recovery",
                "Incident Response",
                "Access Control",
                "Network Security Fundamentals",
                "Security Operations",
                "Threat Intelligence",
              ].map((skill, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border border-[#378ADD] rounded-lg px-4 py-2 text-center"
                >
                  <p className="text-sm font-semibold text-[#0C447C]">
                    {skill}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Course Outline */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#0C447C] mb-4">
              Course Outline
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: "Module 1: Security Principles",
                  lessons: [
                    "✓ Cybersecurity, integrity & availability (CIA)",
                    "✓ Authentication and authorization",
                    "✓ Non-repudiation",
                  ],
                },
                {
                  title: "Module 2: Business Continuity & Disaster Recovery",
                  lessons: [
                    "✓ Business impact analysis",
                    "✓ Recovery strategies",
                    "✓ Testing procedures",
                  ],
                },
                {
                  title: "Module 3: Assess Credentials",
                  lessons: [
                    "✓ Physical access controls",
                    "✓ Identity management",
                    "✓ Access control models",
                  ],
                },
                {
                  title: "Module 4: Network Security",
                  lessons: [
                    "✓ Network design principles",
                    "✓ Firewall configuration",
                    "✓ VPN technologies",
                  ],
                },
              ].map((module, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-[#378ADD] text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    {module.title}
                  </h4>
                  <ul className="space-y-2 ml-8">
                    {module.lessons.map((lesson, i) => (
                      <li key={i} className="text-gray-700 text-sm">
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
