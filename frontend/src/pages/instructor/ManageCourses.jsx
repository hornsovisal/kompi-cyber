/**
 * ManageCourses.jsx — Role-based course management.
 * COORDINATOR: Create courses, assign instructors, view all.
 * INSTRUCTOR:  View only their assigned courses.
 */
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Plus, Search, Users, ShieldCheck, X, CheckCircle2, AlertCircle, Pencil, Trash2 } from "lucide-react";
import {
  fetchAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  assignInstructor,
  fetchInstructors,
} from "../../services/rbacService";

export default function ManageCourses() {
  const instructor = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("instructor") || sessionStorage.getItem("instructor") || "null"); } catch { return null; }
  }, []);
  const isCoordinator = instructor?.role === "coordinator";

  const [courses, setCourses]           = useState([]);
  const [instructors, setInstructors]   = useState([]);
  const [query, setQuery]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);

  const [showCreate, setShowCreate]     = useState(false);
  const [newTitle, setNewTitle]         = useState("");
  const [newDesc, setNewDesc]           = useState("");
  const [creating, setCreating]         = useState(false);

  const [editingCourse, setEditingCourse] = useState(null);
  const [editTitle, setEditTitle]         = useState("");
  const [editDesc, setEditDesc]           = useState("");
  const [savingEdit, setSavingEdit]       = useState(false);

  const [deletingCourse, setDeletingCourse] = useState(null);
  const [deleting, setDeleting]             = useState(false);

  const [assignCourse, setAssignCourse] = useState(null);
  const [assignEmpId, setAssignEmpId]   = useState("");
  const [assigning, setAssigning]       = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [c, i] = await Promise.all([
          fetchAllCourses(),
          isCoordinator ? fetchInstructors() : Promise.resolve([]),
        ]);
        setCourses(c);
        setInstructors(i);
      } catch {
        showToast("error", "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isCoordinator]);

  const filtered = useMemo(() => {
    const kw = query.trim().toLowerCase();
    if (!kw) return courses;
    return courses.filter(c =>
      [c.title, c.description].some(v => String(v || "").toLowerCase().includes(kw))
    );
  }, [courses, query]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!isCoordinator) {
      showToast("error", "Only coordinators can create courses.");
      return;
    }
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const course = await createCourse({ title: newTitle.trim(), description: newDesc.trim() });
      setCourses(prev => [course, ...prev]);
      setShowCreate(false);
      setNewTitle(""); setNewDesc("");
      showToast("success", `Course "${course.title}" created!`);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to create course.");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (course) => {
    if (!isCoordinator) return;
    setEditingCourse(course);
    setEditTitle(course.title || "");
    setEditDesc(course.description || "");
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!isCoordinator || !editingCourse) {
      showToast("error", "Only coordinators can update courses.");
      return;
    }
    if (!editTitle.trim()) return;

    setSavingEdit(true);
    try {
      const updated = await updateCourse(editingCourse.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });
      setCourses(prev => prev.map(course => course.id === updated.id ? { ...course, ...updated } : course));
      setEditingCourse(null);
      setEditTitle("");
      setEditDesc("");
      showToast("success", `Course "${updated.title}" updated.`);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to update course.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!isCoordinator || !deletingCourse) {
      showToast("error", "Only coordinators can delete courses.");
      return;
    }

    setDeleting(true);
    try {
      await deleteCourse(deletingCourse.id);
      setCourses(prev => prev.filter(course => course.id !== deletingCourse.id));
      showToast("success", `Course "${deletingCourse.title}" deleted.`);
      setDeletingCourse(null);
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  };

  const handleAssignInstructor = async (e) => {
    e.preventDefault();
    if (!isCoordinator) {
      showToast("error", "Only coordinators can assign instructors.");
      return;
    }
    if (!assignEmpId) return;
    setAssigning(true);
    try {
      await assignInstructor(assignCourse.id, assignEmpId);
      const c = await fetchAllCourses();
      setCourses(c);
      setAssignCourse(null); setAssignEmpId("");
      showToast("success", "Instructor assigned successfully!");
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to assign instructor.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium
          ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
          <button onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isCoordinator ? "Course Management" : "My Courses"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isCoordinator ? "Create and manage all courses, assign instructors." : "Courses you are assigned to teach."}
            </p>
          </div>
          {isCoordinator && (
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus size={18} /> New Course
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title={isCoordinator ? "Total Courses" : "My Courses"} value={courses.length} icon={BookOpen} color="blue" />
          <StatCard title="Total Students" value={courses.reduce((sum, c) => sum + (c.students?.length || 0), 0)} icon={Users} color="green" />
          {isCoordinator && <StatCard title="Instructors" value={instructors.length} icon={ShieldCheck} color="purple" />}
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <p className="text-sm text-slate-500 py-10 text-center lg:col-span-2">Loading courses...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center lg:col-span-2">
              <BookOpen size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 text-sm">
                {isCoordinator ? "No courses yet. Create your first course!" : "You have no assigned courses yet."}
              </p>
            </div>
          ) : (
            filtered.map(course => (
              <div key={course.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900 truncate">{course.title}</h2>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{course.description || "No description."}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {course.students?.length || 0} students
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(course.instructors || []).length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No instructor assigned</span>
                  ) : (
                    (course.instructors || []).map(empId => {
                      const inst = instructors.find(i => i.employeeId === empId)
                        || (course.instructorDetails || []).find(i => i.employeeId === empId);
                      return (
                        <span key={empId} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                          <ShieldCheck size={12} className="text-blue-500" />
                          {inst ? inst.name : empId}
                        </span>
                      );
                    })
                  )}
                </div>

                {isCoordinator && (
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                    <button onClick={() => openEditModal(course)}
                      className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => { setAssignCourse(course); setAssignEmpId(""); }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Plus size={14} /> Assign Instructor
                    </button>
                    <button onClick={() => setDeletingCourse(course)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showCreate && (
        <Modal title="Create New Course" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course Title *</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} required
                placeholder="e.g. Advanced Web Security"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3}
                placeholder="Brief course description..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
              <button type="submit" disabled={creating}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {creating ? "Creating…" : "Create Course"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {assignCourse && (
        <Modal title={`Assign Instructor — ${assignCourse.title}`} onClose={() => setAssignCourse(null)}>
          <form onSubmit={handleAssignInstructor} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Instructor *</label>
              <select value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)} required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">-- Choose an instructor --</option>
                {instructors.map(i => (
                  <option key={i.employeeId} value={i.employeeId}>{i.name} ({i.department})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAssignCourse(null)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
              <button type="submit" disabled={assigning}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {assigning ? "Assigning…" : "Assign"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingCourse && (
        <Modal title={`Edit Course — ${editingCourse.title}`} onClose={() => setEditingCourse(null)}>
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Course Title *</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
              <button type="submit" disabled={savingEdit}
                className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
                {savingEdit ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingCourse && (
        <Modal title="Delete Course" onClose={() => setDeletingCourse(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deletingCourse.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setDeletingCourse(null)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
              <button type="button" onClick={handleDeleteCourse} disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete Course"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const colors = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", purple: "bg-purple-50 text-purple-600" };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${colors[color]}`}><Icon size={20} /></div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}