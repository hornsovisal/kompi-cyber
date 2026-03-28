import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, Plus, Search, Pencil, Trash2, CalendarClock, BookOpen } from "lucide-react";
import { useInstructorAPI } from "../../hooks/useInstructorAPI";

export default function ManageQuizzes() {
  const navigate = useNavigate();
  const { fetchMyQuizzes, deleteQuiz, loading, error, clearError } = useInstructorAPI();
  const [quizzes, setQuizzes] = useState([]);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadQuizzes = async () => {
    try {
      const data = await fetchMyQuizzes();
      setQuizzes(data);
    } catch (_) {
      // error handled by hook
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const filteredQuizzes = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return quizzes;
    return quizzes.filter((quiz) =>
      [quiz.title, quiz.description, quiz.course].some((value) =>
        String(value || "").toLowerCase().includes(keyword),
      ),
    );
  }, [quizzes, query]);

  const handleDelete = async (quizId) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      setDeletingId(quizId);
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
    } catch (_) {
      // error handled by hook
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quiz Management</h1>
            <p className="mt-1 text-sm text-slate-500">Create, edit, and delete instructor quizzes.</p>
          </div>
          <button
            onClick={() => navigate("/instructor/create-quiz")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            New Quiz
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Total Quizzes" value={quizzes.length} icon={FileQuestion} />
          <StatCard title="Upcoming" value={quizzes.filter((quiz) => new Date(`${quiz.dueDate}T${quiz.dueTime}`) > new Date()).length} icon={CalendarClock} />
          <StatCard title="Courses Used" value={new Set(quizzes.map((quiz) => quiz.course)).size} icon={BookOpen} />
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, description, or course"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <button onClick={clearError} className="font-semibold text-red-800">Dismiss</button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Course</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Due</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    {loading ? "Loading quizzes..." : "No quizzes found."}
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{quiz.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{quiz.description || "No description"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{quiz.course}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{quiz.dueDate} {quiz.dueTime}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/instructor/quizzes/${quiz.id}/edit`)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          disabled={deletingId === quiz.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          <Trash2 size={16} /> {deletingId === quiz.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="rounded-full bg-blue-50 p-3 text-blue-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}