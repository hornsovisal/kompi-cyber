import { useState, useEffect } from "react";
import { Check, X, AlertCircle, Mail, BookOpen, User } from "lucide-react";
import { fetchMyInvitations, acceptCourseInvitation, rejectCourseInvitation } from "../services/rbacService";

const StudentInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [respondingId, setRespondingId] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchMyInvitations();
      setInvitations(data);
    } catch (err) {
      setError("Error loading invitations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    try {
      setRespondingId(invitationId);
      setError("");
      await acceptCourseInvitation(invitationId);
      setSuccess("Course invitation accepted! You are now enrolled.");
      await fetchInvitations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error accepting invitation");
      console.error(err);
    } finally {
      setRespondingId(null);
    }
  };

  const handleReject = async (invitationId) => {
    if (!window.confirm("Are you sure you want to reject this invitation?"))
      return;

    try {
      setRespondingId(invitationId);
      setError("");
      await rejectCourseInvitation(invitationId);
      setSuccess("Invitation rejected");
      await fetchInvitations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error rejecting invitation");
      console.error(err);
    } finally {
      setRespondingId(null);
    }
  };

  const pendingInvitations = invitations.filter((i) => i.status === "pending");
  const acceptedInvitations = invitations.filter(
    (i) => i.status === "accepted",
  );
  const rejectedInvitations = invitations.filter(
    (i) => i.status === "rejected",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Course Invitations
          </h1>
          <p className="text-slate-300">
            Manage your course invitations from instructors
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-100">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-slate-300">Loading invitations...</div>
          </div>
        ) : invitations.length === 0 ? (
          <div className="bg-slate-800 rounded-xl shadow-xl p-12 border border-slate-700 text-center">
            <Mail className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-2">
              No Invitations Yet
            </h2>
            <p className="text-slate-300">
              You haven't received any course invitations yet. Check back soon
              or contact your instructor!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Pending ({pendingInvitations.length})
                </h2>

                <div className="grid gap-4">
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 border border-slate-600 hover:border-blue-500 transition-all"
                    >
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Course Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                              <BookOpen className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-1">
                                {invitation.courseTitle}
                              </h3>
                              <p className="text-slate-300 text-sm mb-3">
                                {invitation.courseDescription}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <User className="w-4 h-4" />
                                <span>
                                  From:{" "}
                                  <span className="text-slate-200 font-medium">
                                    {invitation.invitedByName}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 justify-center md:justify-start">
                          <button
                            onClick={() => handleAccept(invitation.id)}
                            disabled={respondingId === invitation.id}
                            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" />
                            {respondingId === invitation.id
                              ? "Accepting..."
                              : "Accept"}
                          </button>
                          <button
                            onClick={() => handleReject(invitation.id)}
                            disabled={respondingId === invitation.id}
                            className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 disabled:bg-slate-600 text-red-300 hover:text-red-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border border-red-600/30"
                          >
                            <X className="w-5 h-5" />
                            {respondingId === invitation.id
                              ? "Rejecting..."
                              : "Reject"}
                          </button>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <p className="text-xs text-slate-400">
                          Invited on{" "}
                          {new Date(invitation.createdAt).toLocaleDateString()} {" "}
                          at{" "}
                          {new Date(invitation.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Invitations */}
            {acceptedInvitations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Check className="w-6 h-6 text-green-400" />
                  Accepted ({acceptedInvitations.length})
                </h2>

                <div className="grid gap-4">
                  {acceptedInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 border border-green-500/30 bg-green-500/5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                          <BookOpen className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {invitation.courseTitle}
                          </h3>
                          <p className="text-slate-300 text-sm mb-2">
                            {invitation.courseDescription}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>
                              From:{" "}
                              <span className="text-slate-200">
                                {invitation.invitedByName}
                              </span>
                            </span>
                            <span>
                              Accepted on{" "}
                              {new Date(invitation.respondedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                          ✓ Enrolled
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Invitations */}
            {rejectedInvitations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-400 mb-4 flex items-center gap-2">
                  <X className="w-6 h-6 text-slate-500" />
                  Rejected ({rejectedInvitations.length})
                </h2>

                <div className="grid gap-4">
                  {rejectedInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-lg p-6 border border-slate-600 opacity-60"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-600 rounded-lg">
                          <BookOpen className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-300 mb-1">
                            {invitation.courseTitle}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            Rejected on{" "}
                            {new Date(invitation.respondedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInvitations;
