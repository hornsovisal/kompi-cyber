import { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Check, X, Calendar } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function StudentInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/invitations", {
        baseURL: API_BASE,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setInvitations(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
      setMessage({
        type: "error",
        text: "Failed to load invitations",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      setRespondingTo(invitationId);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/invitations/${invitationId}/accept`,
        {},
        {
          baseURL: API_BASE,
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "✓ You have accepted the invitation and joined the course!",
        });
        // Remove from list
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to accept invitation",
      });
    } finally {
      setRespondingTo(null);
    }
  };

  const handleReject = async (invitationId) => {
    if (!window.confirm("Are you sure you want to reject this invitation?"))
      return;

    try {
      setRespondingTo(invitationId);
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/invitations/${invitationId}/reject`,
        {},
        {
          baseURL: API_BASE,
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMessage({
        type: "info",
        text: "You have rejected this invitation",
      });
      setInvitations(invitations.filter((inv) => inv.id !== invitationId));
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      setMessage({
        type: "error",
        text: "Failed to reject invitation",
      });
    } finally {
      setRespondingTo(null);
    }
  };

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending",
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Mail size={28} />
          Course Invitations
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Accept or decline instructor invitations to join courses
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-4 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : message.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-600">Loading invitations...</div>
        </div>
      ) : pendingInvitations.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <Mail className="mx-auto mb-3 text-gray-400" size={48} />
          <p className="text-gray-600">No pending invitations</p>
          <p className="mt-1 text-sm text-gray-500">
            Invitations from instructors will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex flex-col gap-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-6 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {invitation.course_title}
                </h3>
                <p className="mt-1 text-sm text-gray-700">
                  {invitation.course_description || "No description available"}
                </p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">
                      From: {invitation.teacher_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    {new Date(invitation.invited_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 sm:flex-col">
                <button
                  onClick={() => handleAccept(invitation.id)}
                  disabled={respondingTo === invitation.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400 sm:flex-initial"
                >
                  <Check size={18} />
                  Accept
                </button>
                <button
                  onClick={() => handleReject(invitation.id)}
                  disabled={respondingTo === invitation.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-red-300 bg-white px-4 py-2 font-semibold text-red-600 hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 sm:flex-initial"
                >
                  <X size={18} />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show accepted/rejected invitations if any */}
      {invitations.filter((inv) => inv.status !== "pending").length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="mb-4 font-semibold text-gray-700">
            Previous Responses
          </h3>
          <div className="space-y-2">
            {invitations
              .filter((inv) => inv.status !== "pending")
              .map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {invitation.course_title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {invitation.teacher_name}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      invitation.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {invitation.status.charAt(0).toUpperCase() +
                      invitation.status.slice(1)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
