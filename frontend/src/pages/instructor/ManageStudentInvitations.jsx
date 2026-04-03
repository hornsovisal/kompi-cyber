import { useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ManageStudentInvitations({ courseId, courseTitle, isOpen, onClose, onSuccess }) {
  const [emailsInput, setEmailsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleSendInvitations = async () => {
    // Parse emails from textarea - split by newline, comma, or semicolon
    const rawEmails = emailsInput.split(/[,;\n]+/).map((e) => e.trim()).filter((e) => e.length > 0);

    if (rawEmails.length === 0) {
      alert("Please enter at least one email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/invitations/send`,
        {
          courseId,
          studentEmails: rawEmails,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setResult(response.data.data);
      setEmailsInput("");

      // Trigger success callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1000);
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || "Error sending invitations");
      console.error("Invitation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const successCount = result?.successful?.length || 0;
  const failedCount = result?.failed?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Invite Students</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {result ? (
            <div className="space-y-4">
              {successCount > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">{successCount} invitation(s) sent successfully</p>
                      {result.successful && (
                        <ul className="mt-2 text-sm text-green-800">
                          {result.successful.map((item, idx) => (
                            <li key={idx}>✓ {item.email}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {failedCount > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">{failedCount} invitation(s) failed</p>
                      {result.failed && (
                        <ul className="mt-2 text-sm text-red-800">
                          {result.failed.map((item, idx) => (
                            <li key={idx}>✗ {item.email}: {item.reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-4">
                Enter email addresses to invite students to <strong>{courseTitle}</strong>. Separate multiple emails with commas or newlines.
              </p>

              <textarea
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                placeholder="student@example.com
another@example.com
emails can be separated by comma, semicolon or newline"
                className="w-full h-32 resize-none rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={loading}
              />

              <p className="mt-2 text-xs text-slate-500">
                {emailsInput.split(/[,;\n]+/).filter((e) => e.trim()).length} email(s) to send
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
          {result ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvitations}
                disabled={loading || emailsInput.trim().length === 0}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Invitations"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
