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
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch certificate
      const certRes = await fetch(
        `${API_BASE}/api/certificates/course/${courseId}`,
        { headers },
      );

      if (!certRes.ok) {
        throw new Error("Certificate not found");
      }

      const certData = await certRes.json();
      setCertificate(certData.certificate);

      // Fetch course details
      try {
        const courseRes = await fetch(`${API_BASE}/api/courses/${courseId}`, {
          headers,
        });
        if (courseRes.ok) {
          const course = await courseRes.json();
          setCourseData(course);
        }
      } catch (err) {
        console.log("Could not fetch course details");
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
  const courseDescription = courseData?.description || "A comprehensive cybersecurity course covering essential concepts and practical skills.";

  const skillsLearned = [
    "Cybersecurity fundamentals",
    "Threat identification and mitigation",
    "Security best practices",
    "Risk assessment techniques",
    "Incident response procedures",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-8 px-4">
      {/* Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#378ADD] hover:text-[#0C447C] font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Learning
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Certificate Details & Course Info */}
          <div className="lg:col-span-2 flex flex-col">
            {/* KOMPI Logo */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#378ADD] to-[#0C447C] text-white px-4 py-2 rounded-lg font-bold">
                <div className="w-6 h-6 bg-[#EF9F27] rounded flex items-center justify-center text-xs font-black text-[#0C447C]">
                  🔐
                </div>
                KOMPI CYBER
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-[#0C447C] mb-2">
              Completed!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Congratulations on your achievement
            </p>

            {/* Course Title */}
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                {certificate.title}
              </h2>
              <p className="text-gray-600 leading-relaxed bg-white p-6 rounded-lg border border-gray-200">
                {courseDescription}
              </p>
            </div>

            {/* Student & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Student Name */}
              <div className="border-l-4 border-[#EF9F27] pl-4 bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
                  Completed by
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {certificate.full_name}
                </p>
              </div>

              {/* Issue Date */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#378ADD] to-[#0C447C] rounded-lg flex items-center justify-center">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                    Date Completed
                  </p>
                  <p className="font-semibold text-gray-800">
                    {issueDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Certificate Code */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#378ADD] to-[#0C447C] rounded-lg flex items-center justify-center">
                  <Award className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                    Certificate ID
                  </p>
                  <p className="font-mono font-bold text-gray-800 break-all text-sm">
                    {certificate.certificate_code}
                  </p>
                </div>
              </div>

              {/* Course Level */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#EF9F27] to-orange-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                    Level
                  </p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {certificate.level || "Professional"}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills Learned Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-[#378ADD] rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-[#0C447C] mb-4 flex items-center gap-2">
                <Zap size={24} className="text-[#EF9F27]" />
                Skills You Gained
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skillsLearned.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <CheckCircle2
                      size={20}
                      className="text-[#EF9F27] flex-shrink-0"
                    />
                    <span className="font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Info */}
            <div className="bg-blue-50 border border-[#378ADD] rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-[#0C447C]">
                  Credential verified.
                </span>{" "}
                KOMPI Cyber certifies that {certificate.full_name} successfully
                completed all course requirements and earned this certificate.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#378ADD] to-[#0C447C] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                {downloading ? "Downloading..." : "Download Certificate"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 border-2 border-[#378ADD] text-[#378ADD] px-6 py-3 rounded-lg font-semibold hover:bg-[#378ADD] hover:text-white transition-all"
              >
                <Share2 size={20} />
                Share Achievement
              </button>
            </div>
          </div>

          {/* Right Side - Certificate Preview */}
          <div className="flex items-start justify-center lg:sticky lg:top-8">
            <div className="relative w-full max-w-sm">
              {/* Floating shadow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#378ADD] to-[#0C447C] rounded-2xl blur-2xl opacity-20 transform -skew-y-2"></div>

              {/* Certificate Card */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                {/* Certificate Header */}
                <div className="h-20 bg-gradient-to-r from-[#378ADD] to-[#0C447C]"></div>

                {/* Certificate Content */}
                <div className="p-8 pt-6">
                  {/* KOMPI Logo Text */}
                  <div className="text-center mb-8">
                    <p className="font-bold text-[#0C447C] text-lg">
                      🔐 KOMPI CYBER
                    </p>
                    <p className="text-[#378ADD] text-xs uppercase tracking-widest font-semibold">
                      Certificate of Completion
                    </p>
                  </div>

                  {/* Student Name - Large */}
                  <div className="text-center mb-6">
                    <p className="text-[#666] text-xs mb-2">
                      This certificate is proudly presented to
                    </p>
                    <p className="text-2xl font-bold text-[#0C447C] border-b-2 border-[#EF9F27] pb-3 break-words">
                      {certificate.full_name}
                    </p>
                  </div>

                  {/* Course Info */}
                  <div className="text-center mb-8">
                    <p className="text-[#666] text-xs mb-2">
                      FOR SUCCESSFULLY COMPLETING
                    </p>
                    <p className="text-lg font-bold text-gray-800 break-words">
                      {certificate.title}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-6"></div>

                  {/* Badge & Date */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 rounded-full border-4 border-[#EF9F27] flex items-center justify-center bg-[#FFF5E6] flex-shrink-0">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[#666] text-xs">Issued</p>
                      <p className="text-sm font-bold text-gray-800">
                        {issueDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Certificate ID */}
                  <p className="text-center text-[#666] text-xs mt-6 break-all">
                    ID: {certificate.certificate_code}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div className="h-1 bg-gradient-to-r from-[#378ADD] via-[#EF9F27] to-[#0C447C]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
