import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarClock,
  FileQuestion,
  TrendingUp,
  Users,
} from "lucide-react";
import { useInstructorAPI } from "../../hooks/useInstructorAPI";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const {
    fetchInstructorCourses,
    fetchMyQuizzes,
    fetchStudentPerformance,
    loading,
    error,
    clearError,
  } = useInstructorAPI();

  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [performance, setPerformance] = useState({ students: [] });

  const instructor = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("instructor") ||
          localStorage.getItem("instructor") ||
          "null",
      );
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [courseData, quizData, performanceData] = await Promise.all([
          fetchInstructorCourses(),
          fetchMyQuizzes(),
          fetchStudentPerformance(),
        ]);

        setCourses(courseData);
        setQuizzes(quizData);
        setPerformance(performanceData || { students: [] });
      } catch (_) {
        const token =
          sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) navigate("/instructor/login");
      }
    };

    loadDashboard();
  }, [navigate]);

  const upcomingQuizzes = useMemo(
    () =>
      [...quizzes]
        .filter(
          (quiz) => new Date(`${quiz.dueDate}T${quiz.dueTime}`) > new Date(),
        )
        .sort(
          (a, b) =>
            new Date(`${a.dueDate}T${a.dueTime}`) -
            new Date(`${b.dueDate}T${b.dueTime}`),
        )
        .slice(0, 6),
    [quizzes],
  );

  const averageScore = useMemo(() => {
    const students = performance.students || [];
    if (!students.length) return 0;
    const total = students.reduce(
      (sum, student) => sum + Number(student.averageScore || 0),
      0,
    );
    return (total / students.length).toFixed(2);
  }, [performance]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Instructor Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of lecturer info, quiz activity, and student performance.
            </p>
          </div>
          <button
            onClick={() => navigate("/instructor/create-quiz")}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create Quiz
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="font-semibold text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Lecturer Information
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoItem label="Name" value={instructor?.name || "Instructor"} />
            <InfoItem
              label="Department"
              value={instructor?.department || "-"}
            />
            <InfoItem
              label="Courses"
              value={
                (instructor?.courses || []).join(", ") ||
                `${courses.length} assigned`
              }
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={performance.students?.length || 0}
            icon={Users}
            color="text-green-600 bg-green-50"
          />
          <StatCard
            title="Average Score"
            value={averageScore}
            icon={TrendingUp}
            color="text-purple-600 bg-purple-50"
          />
          <StatCard
            title="Quizzes Created"
            value={quizzes.length}
            icon={FileQuestion}
            color="text-blue-600 bg-blue-50"
          />
          <StatCard
            title="Courses"
            value={courses.length}
            icon={BookOpen}
            color="text-amber-600 bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Upcoming Quizzes
                </h3>
                <p className="text-sm text-slate-500">
                  Next scheduled quizzes by due date.
                </p>
              </div>
              <button
                onClick={() => navigate("/instructor/quizzes")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Due
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {upcomingQuizzes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-10 text-center text-sm text-slate-500"
                      >
                        {loading ? "Loading..." : "No upcoming quizzes."}
                      </td>
                    </tr>
                  ) : (
                    upcomingQuizzes.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {quiz.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {quiz.course}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {quiz.dueDate} {quiz.dueTime}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                <CalendarClock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick Actions
                </h3>
                <p className="text-sm text-slate-500">
                  Access common instructor tasks.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <QuickAction
                label="Create new quiz"
                onClick={() => navigate("/instructor/create-quiz")}
              />
              <QuickAction
                label="Open quiz management"
                onClick={() => navigate("/instructor/quizzes")}
              />
              <QuickAction
                label="View student performance"
                onClick={() => navigate("/instructor/performance")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
    >
      {label}
    </button>
  );
}
