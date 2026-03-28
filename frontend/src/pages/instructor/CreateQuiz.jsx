import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useInstructorAPI } from "../../hooks/useInstructorAPI";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { id, lessonId } = useParams();
  const quizId = id || lessonId;
  const { fetchInstructorCourses, fetchQuizById, createQuiz, updateQuiz, loading, error, clearError } = useInstructorAPI();

  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    dueTime: "",
  });

  const isEditMode = useMemo(() => Boolean(quizId), [quizId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseData = await fetchInstructorCourses();
        setCourses(courseData);

        if (!quizId && courseData[0]) {
          setForm((prev) => ({ ...prev, course: prev.course || courseData[0].title || String(courseData[0].id) }));
        }

        if (quizId) {
          const quiz = await fetchQuizById(quizId);
          if (quiz) {
            setForm({
              title: quiz.title || "",
              description: quiz.description || "",
              course: quiz.course || "",
              dueDate: quiz.dueDate || "",
              dueTime: quiz.dueTime || "",
            });
          }
        }
      } catch (_) {
        // error handled by hook
      }
    };

    loadData();
  }, [quizId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (isEditMode) {
        await updateQuiz(quizId, form);
      } else {
        await createQuiz(form);
      }
      navigate("/instructor/quizzes");
    } catch (_) {
      // error handled by hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{isEditMode ? "Edit Quiz" : "Create Quiz"}</h1>
            <p className="mt-1 text-sm text-slate-500">Manage quiz details for your instructor dashboard.</p>
          </div>
          <button
            onClick={() => navigate("/instructor/quizzes")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="flex items-center justify-between gap-4">
                <span>{error}</span>
                <button type="button" onClick={clearError} className="font-semibold text-red-800">Dismiss</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Title">
              <input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </Field>

            <Field label="Course">
              <select name="course" value={form.course} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">Select course</option>
                {courses.map((course) => {
                  const value = course.title || String(course.id);
                  return <option key={course.id} value={value}>{value}</option>;
                })}
              </select>
            </Field>

            <Field label="Due Date">
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </Field>

            <Field label="Due Time">
              <input type="time" name="dueTime" value={form.dueTime} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Description">
              <textarea name="description" value={form.description} onChange={handleChange} rows={5} className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </Field>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : isEditMode ? "Update Quiz" : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
