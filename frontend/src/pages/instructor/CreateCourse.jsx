import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Users, Send, X, Check, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

const CreateCourse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create"); // 'create' or 'manage'
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "beginner",
    duration: "4 weeks",
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitations, setInvitations] = useState({});
  const [inviteLoading, setInviteLoading] = useState({});

  // Fetch teacher's courses on mount
  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  // Fetch invitations when course is selected
  useEffect(() => {
    if (selectedCourse && activeTab === "manage") {
      fetchCourseInvitations(selectedCourse.id);
    }
  }, [selectedCourse, activeTab]);

  const fetchTeacherCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/instructor/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (err) {
      setError("Failed to load courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseInvitations = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/invitations/course/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setInvitations((prev) => ({
          ...prev,
          [courseId]: data.data || [],
        }));
      }
    } catch (err) {
      console.error("Failed to load invitations:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/instructor/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Course created successfully!");
        setFormData({
          title: "",
          description: "",
          level: "beginner",
          duration: "4 weeks",
        });
        await fetchTeacherCourses();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to create course");
      }
    } catch (err) {
      setError("Error creating course");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !inviteEmail) {
      setError("Please select a course and enter an email");
      return;
    }

    try {
      setInviteLoading((prev) => ({ ...prev, [inviteEmail]: true }));
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/invitations/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          studentEmail: inviteEmail,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        await fetchCourseInvitations(selectedCourse.id);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to send invitation");
      }
    } catch (err) {
      setError("Error sending invitation");
      console.error(err);
    } finally {
      setInviteLoading((prev) => ({ ...prev, [inviteEmail]: false }));
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/invitations/${invitationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (data.success) {
        setSuccess("Invitation cancelled");
        await fetchCourseInvitations(selectedCourse.id);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to cancel invitation");
      }
    } catch (err) {
      setError("Error cancelling invitation");
      console.error(err);
    }
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/invitations/${invitationId}/resend`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json();
      if (data.success) {
        setSuccess("Invitation resent");
        await fetchCourseInvitations(selectedCourse.id);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to resend invitation");
      }
    } catch (err) {
      setError("Error resending invitation");
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <Check className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-slate-300">
            Create courses and manage student invitations
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

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "create"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Create Course
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "manage"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            <Users className="w-5 h-5" />
            Manage Invitations
          </button>
        </div>

        {/* Create Course Tab */}
        {activeTab === "create" && (
          <div className="bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              Create New Course
            </h2>

            <form onSubmit={handleCreateCourse} className="space-y-6">
              {/* Course Title */}
              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  Course Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Advanced Network Security"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-slate-200 font-medium mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what students will learn in this course..."
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Level and Duration */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-200 font-medium mb-2">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-200 font-medium mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 4 weeks"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                >
                  {loading ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>

            {/* Recent Courses */}
            {courses.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">
                  Your Courses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 bg-slate-700 border border-slate-600 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveTab("manage");
                      }}
                    >
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {course.title}
                      </h4>
                      <p className="text-sm text-slate-300 mb-3">
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span className="capitalize px-2 py-1 bg-slate-600 rounded">
                          {course.level}
                        </span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manage Invitations Tab */}
        {activeTab === "manage" && (
          <div className="space-y-8">
            {/* Course Selection */}
            <div className="bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">
                Your Courses
              </h2>

              {loading ? (
                <p className="text-slate-300">Loading courses...</p>
              ) : courses.length === 0 ? (
                <p className="text-slate-400">
                  No courses yet. Create one first!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedCourse?.id === course.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-600 bg-slate-700 hover:border-blue-400"
                      }`}
                    >
                      <h3 className="font-bold text-white mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {course.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send Invitation */}
            {selectedCourse && (
              <div className="bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  Send Invitation
                </h2>

                <p className="text-slate-300 mb-6">
                  Invite students to{" "}
                  <span className="font-semibold text-blue-400">
                    {selectedCourse.title}
                  </span>
                </p>

                <form onSubmit={handleSendInvitation} className="flex gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    disabled={inviteLoading[inviteEmail] || !inviteEmail}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {inviteLoading[inviteEmail] ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            )}

            {/* Invitations List */}
            {selectedCourse && (
              <div className="bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Invitations for {selectedCourse.title}
                </h2>

                {!invitations[selectedCourse.id] ? (
                  <p className="text-slate-300">Loading invitations...</p>
                ) : invitations[selectedCourse.id].length === 0 ? (
                  <p className="text-slate-400">No invitations sent yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                            Invited
                          </th>
                          <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations[selectedCourse.id].map((invite) => (
                          <tr
                            key={invite.id}
                            className="border-b border-slate-700 hover:bg-slate-700/50"
                          >
                            <td className="px-4 py-3 text-white">
                              {invite.student_email}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {invite.student_name}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(invite.status)}`}
                              >
                                {getStatusIcon(invite.status)}
                                {invite.status.charAt(0).toUpperCase() +
                                  invite.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-400">
                              {new Date(invite.invited_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {invite.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleResendInvitation(invite.id)
                                      }
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
                                    >
                                      Resend
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleCancelInvitation(invite.id)
                                      }
                                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCourse;
