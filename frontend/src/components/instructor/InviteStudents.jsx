import { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Send, Users, Check, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function InviteStudents({ courseId, courseName }) {
  const [students, setStudents] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [invitedList, setInvitedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("invite");

  // Fetch invited students for this course
  useEffect(() => {
    if (courseId && activeTab === "manage") {
      fetchInvitedStudents();
    }
  }, [courseId, activeTab]);

  const fetchInvitedStudents = async () => {
    try {
      setLoading(true);
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await axios.get(`/api/invitations/course/${courseId}`, {
        baseURL: API_BASE,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setInvitedList(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setMessage({
        type: "error",
        text: "Failed to load invited students",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = () => {
    if (!emailInput.trim()) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setMessage({ type: "error", text: "Invalid email format" });
      return;
    }

    // Check for duplicates
    if (students.some((s) => s.email === emailInput.trim())) {
      setMessage({ type: "warning", text: "This email is already added" });
      return;
    }

    setStudents([...students, { email: emailInput.trim(), id: Date.now() }]);
    setEmailInput("");
    setMessage({ type: "success", text: "Email added" });
  };

  const handleRemoveEmail = (id) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const handleSendInvitations = async () => {
    if (students.length === 0) {
      setMessage({ type: "warning", text: "Please add at least one email" });
      return;
    }

    try {
      setLoading(true);
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      // Send invitations for all emails
      const results = await Promise.allSettled(
        students.map((student) =>
          axios.post(
            "/api/invitations/send",
            {
              courseId,
              studentEmail: student.email,
            },
            {
              baseURL: API_BASE,
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ),
      );

      // Check results
      const failed = results.filter((r) => r.status === "rejected").length;
      const succeeded = students.length - failed;

      if (succeeded > 0) {
        setMessage({
          type: "success",
          text: `Successfully sent ${succeeded} invitation(s)!`,
        });
        setStudents([]);
        fetchInvitedStudents();
      }

      if (failed > 0) {
        setMessage({
          type: "warning",
          text: `${failed} invitation(s) failed to send`,
        });
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to send invitations",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      setLoading(true);
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      await axios.post(
        `/api/invitations/${invitationId}/resend`,
        {},
        {
          baseURL: API_BASE,
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessage({
        type: "success",
        text: "Invitation resent successfully",
      });
      fetchInvitedStudents();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to resend invitation",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to revoke this invitation?"))
      return;

    try {
      setLoading(true);
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      await axios.delete(`/api/invitations/${invitationId}`, {
        baseURL: API_BASE,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({
        type: "success",
        text: "Invitation revoked",
      });
      fetchInvitedStudents();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to revoke invitation",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Users size={28} />
          Invite Students to "{courseName}"
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Send invitations to students to join your instructor-led course
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-4 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : message.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("invite")}
          className={`pb-3 font-medium transition ${
            activeTab === "invite"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Mail size={18} className="mb-1 mr-2 inline" />
          Send Invitations
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`pb-3 font-medium transition ${
            activeTab === "manage"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users size={18} className="mb-1 mr-2 inline" />
          Manage Invitations ({invitedList.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "invite" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
              placeholder="student@example.com"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleAddEmail}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {students.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">
                Emails to invite ({students.length}):
              </h3>
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-2"
                  >
                    <span className="text-sm text-gray-700">
                      {student.email}
                    </span>
                    <button
                      onClick={() => handleRemoveEmail(student.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSendInvitations}
            disabled={loading || students.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            <Send size={20} />
            {loading ? "Sending..." : `Send Invitations (${students.length})`}
          </button>
        </div>
      )}

      {activeTab === "manage" && (
        <div className="space-y-4">
          {loading && !invitedList.length ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : invitedList.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <Users className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-gray-600">No invitations sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitedList.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {invitation.student_email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(invitation.invited_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        invitation.status,
                      )}`}
                    >
                      {invitation.status.charAt(0).toUpperCase() +
                        invitation.status.slice(1)}
                    </span>
                    {invitation.status === "pending" && (
                      <button
                        onClick={() => handleResendInvitation(invitation.id)}
                        className="rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                      >
                        Resend
                      </button>
                    )}
                    <button
                      onClick={() => handleRevokeInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
