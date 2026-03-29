import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, FileQuestion, Trophy, Users } from "lucide-react";
import { useInstructorAPI } from "../../hooks/useInstructorAPI";

export default function Analytics() {
  const { fetchInstructorCourses, fetchMyQuizzes, fetchStudentPerformance, loading, error, clearError } = useInstructorAPI();
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [performance, setPerformance] = useState({ students: [], averageScore: 0, totalStudents: 0 });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [courseData, quizData, performanceData] = await Promise.all([
          fetchInstructorCourses(),
          fetchMyQuizzes(),
          fetchStudentPerformance(),
        ]);

        setCourses(courseData || []);
        setQuizzes(quizData || []);
        setPerformance(performanceData || { students: [], averageScore: 0, totalStudents: 0 });
      } catch (_) {
        // handled by hook
      }
    };

    loadAnalytics();
  }, []);

  const publishedCourses = useMemo(
    () => courses.filter((course) => String(course.status || "published").toLowerCase() === "published").length,
    [courses],
  );

  const scheduledQuizzes = useMemo(
    () => quizzes.filter((quiz) => new Date(`${quiz.dueDate}T${quiz.dueTime}`) > new Date()).length,
    [quizzes],
  );

  const topStudents = useMemo(
    () => [...(performance.students || [])].sort((a, b) => Number(b.averageScore || 0) - Number(a.averageScore || 0)).slice(0, 5),
    [performance],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">High-level insights for your teaching activity.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <button onClick={clearError} className="font-semibold text-red-800">Dismiss</button>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Courses" value={courses.length} icon={BookOpen} />
          <StatCard title="Published Courses" value={publishedCourses} icon={BarChart3} />
          <StatCard title="Scheduled Quizzes" value={scheduledQuizzes} icon={FileQuestion} />
          <StatCard title="Average Score" value={performance.averageScore || 0} icon={Users} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Course summary</h2>
            <div className="mt-5 space-y-4">
              {courses.length === 0 ? (
                <p className="text-sm text-slate-500">{loading ? "Loading analytics..." : "No course analytics available."}</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{course.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{course.category || "Course"}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {course.enrollmentCount || 0} students
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-50 p-3 text-amber-600">
                <Trophy size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Top students</h2>
                <p className="text-sm text-slate-500">Best performers across your courses.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {topStudents.length === 0 ? (
                <p className="text-sm text-slate-500">No student performance data available.</p>
              ) : (
                topStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">#{index + 1} {student.name}</p>
                      <p className="text-sm text-slate-500">{student.course}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {student.averageScore}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
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