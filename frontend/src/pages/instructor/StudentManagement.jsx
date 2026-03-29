/**
 * StudentManagement.jsx
 * Instructor-only page to invite students to their assigned courses
 * and view who is enrolled.
 */

import { useEffect, useMemo, useState } from "react";
import { Users, Mail, Plus, Search, CheckCircle2, AlertCircle, X, BookOpen, Send, Ban } from "lucide-react";
import { fetchAllCourses, fetchCourseStudents, inviteStudent, fetchCourseInvitations, resendInvitation, cancelInvitation } from "../../services/rbacService";

export default function StudentManagement() {
  const instructor = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("instructor") || "null"); } catch { return null; }
  }, []);

  const [courses, setCourses]       = useState([]);
  const [selectedCourse, setSel]    = useState(null);
  const [students, setStudents]     = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [toast, setToast]           = useState(null);

  // ── Invite form ──────────────────────────────────────────────────────────
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setEmail]     = useState("");
  const [inviteName, setName]       = useState("");
  const [inviting, setInviting]     = useState(false);
  const [actingInvitationId, setActingInvitationId] = useState(null);

  // ── Load assigned courses ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchAllCourses();
        setCourses(data);
        if (data.length > 0) setSel(data[0]);
      } catch {
        showToast("error", "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Load students when course changes ────────────────────────────────────
  useEffect(() => {
    if (!selectedCourse) return;
    const loadStudents = async () => {
      try {
        const data = await fetchCourseStudents(selectedCourse.id);
        setStudents(data);
      } catch {
        setStudents([]);
      }
    };
    const loadInvitations = async () => {
      setLoadingInvitations(true);
      try {
        const data = await fetchCourseInvitations(selectedCourse.id);
        setInvitations(data);
      } catch {
        setInvitations([]);
      } finally {
        setLoadingInvitations(false);
      }
    };
    loadStudents();
    loadInvitations();
  }, [selectedCourse]);

  const filtered = useMemo(() => {
    const kw = query.trim().toLowerCase();
    if (!kw) return students;
    return students.filter(s =>
      [s.name, s.email].some(v => String(v || "").toLowerCase().includes(kw))
    );
  }, [students, query]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshSelectedCourseData = async () => {
    if (!selectedCourse) return;
    const [studentData, invitationData] = await Promise.all([
      fetchCourseStudents(selectedCourse.id),
      fetchCourseInvitations(selectedCourse.id),
    ]);
    setStudents(studentData);
    setInvitations(invitationData);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !inviteEmail) return;
    setInviting(true);
    try {
      await inviteStudent(selectedCourse.id, inviteEmail.trim(), inviteName.trim());
      await refreshSelectedCourseData();
      setEmail(""); setName("");
      setShowInvite(false);
      showToast("success", `Invitation sent for "${selectedCourse.title}".`);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to invite student.");
    } finally {
      setInviting(false);
    }
  };

  const pendingInvitations = useMemo(
    () => invitations.filter(invitation => invitation.status === "pending"),
    [invitations],
  );

  const handleResendInvitation = async (invitationId) => {
    setActingInvitationId(invitationId);
    try {
      await resendInvitation(invitationId);
      await refreshSelectedCourseData();
      showToast("success", "Invitation resent.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to resend invitation.");
    } finally {
      setActingInvitationId(null);
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    setActingInvitationId(invitationId);
    try {
      await cancelInvitation(invitationId);
      await refreshSelectedCourseData();
      showToast("success", "Invitation cancelled.");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to cancel invitation.");
    } finally {
      setActingInvitationId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium
          ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
          <button onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Student Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Invite students to your courses and manage enrollments.
            </p>
          </div>
          {selectedCourse && (
            <button
              onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} /> Invite Student
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Course Selector */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">My Courses</h2>
            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-slate-400">Loading...</p>
              ) : courses.length === 0 ? (
                <p className="text-xs text-slate-400">No courses assigned.</p>
              ) : (
                courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSel(course)}
                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                      selectedCourse?.id === course.id
                        ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <BookOpen size={14} className="mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{course.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{course.students?.length || 0} enrolled</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Student List */}
          <div className="lg:col-span-3">
            {selectedCourse ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Students in <span className="text-blue-600">{selectedCourse.title}</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {students.length} enrolled
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {pendingInvitations.length} pending invites
                    </span>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input value={query} onChange={e => setQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {filtered.length === 0 ? (
                    <div className="p-10 text-center">
                      <Users size={40} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm text-slate-500">No students enrolled yet.</p>
                      <button onClick={() => setShowInvite(true)}
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Invite the first student →
                      </button>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">#</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Name</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Email</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Courses</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filtered.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-5 py-4 text-sm text-slate-500">{idx + 1}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                                  {s.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-900 text-sm">{s.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <Mail size={14} className="text-slate-400" />
                                {s.email}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {s.enrolledCourses?.length || 0} course{s.enrolledCourses?.length !== 1 ? 's' : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Invitation Queue</h3>
                      <p className="text-xs text-slate-500">Pending and historical invitations for this course.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {invitations.length} total
                    </span>
                  </div>

                  {loadingInvitations ? (
                    <div className="p-6 text-sm text-slate-500">Loading invitations...</div>
                  ) : invitations.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No invitations sent yet.</div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900">{invitation.studentName || invitation.studentEmail}</p>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                invitation.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : invitation.status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                              }`}>
                                {invitation.status}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{invitation.studentEmail}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Sent {new Date(invitation.createdAt).toLocaleDateString()} {invitation.respondedAt ? `• Responded ${new Date(invitation.respondedAt).toLocaleDateString()}` : ''}
                            </p>
                          </div>

                          {invitation.status === 'pending' && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleResendInvitation(invitation.id)}
                                disabled={actingInvitationId === invitation.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                              >
                                <Send size={14} /> {actingInvitationId === invitation.id ? 'Working…' : 'Resend'}
                              </button>
                              <button
                                onClick={() => handleCancelInvitation(invitation.id)}
                                disabled={actingInvitationId === invitation.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                              >
                                <Ban size={14} /> Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
                Select a course to manage students
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Invite Modal ───────────────────────────────────────────────────── */}
      {showInvite && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Invite Student</h2>
              <button onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-500 mb-4">
                Inviting to: <span className="font-semibold text-slate-700">{selectedCourse.title}</span>
              </p>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student Email *</label>
                  <input value={inviteEmail} onChange={e => setEmail(e.target.value)} required
                    type="email" placeholder="student@email.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student Name (optional)</label>
                  <input value={inviteName} onChange={e => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
                  <button type="submit" disabled={inviting}
                    className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {inviting ? "Inviting…" : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
