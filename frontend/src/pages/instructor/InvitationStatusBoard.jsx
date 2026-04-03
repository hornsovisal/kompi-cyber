import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function InvitationStatusBoard({
  courseId,
  courseTitle,
  refreshTrigger,
}) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/invitations/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setInvitations(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError(err.response?.data?.message || "Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchInvitations();
    }
  }, [courseId, refreshTrigger]);

  const stats = {
    pending: invitations.filter((inv) => inv.status === "pending").length,
    accepted: invitations.filter((inv) => inv.status === "accepted").length,
    rejected: invitations.filter((inv) => inv.status === "rejected").length,
  };

  const acceptedStudents = invitations.filter(
    (inv) => inv.status === "accepted",
  );

  if (!courseId) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pending Invitations"
          value={stats.pending}
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="Accepted"
          value={stats.accepted}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Declined"
          value={stats.rejected}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Invitations Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Invitation Status
          </h3>
          <button
            onClick={fetchInvitations}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-slate-500">
            Loading invitations...
          </div>
        ) : error ? (
          <div className="px-6 py-8 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        ) : invitations.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500">
            No invitations sent yet. Click "Invite Students" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Sent Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">
                    Response Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((invitation) => (
                  <tr
                    key={invitation.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">{invitation.student_email}</td>
                    <td className="px-6 py-4">
                      {invitation.student_name ? (
                        <span className="font-medium text-slate-900">
                          {invitation.student_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={invitation.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(invitation.invited_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {invitation.responded_at
                        ? new Date(invitation.responded_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accepted Students Summary */}
      {acceptedStudents.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Students Joined
          </h3>
          <div className="space-y-3">
            {acceptedStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {student.student_name || student.student_email}
                  </p>
                  <p className="text-sm text-slate-500">
                    {student.student_email}
                  </p>
                </div>
                <span className="text-sm text-green-700 font-medium">
                  Joined {new Date(student.responded_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = "slate" }) {
  const colorConfig = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-50 text-slate-600",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colorConfig[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      label: "Pending",
      icon: Clock,
    },
    accepted: {
      bg: "bg-green-50",
      text: "text-green-700",
      label: "Accepted",
      icon: CheckCircle,
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      label: "Declined",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}
