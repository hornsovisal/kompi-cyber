import { useEffect, useMemo, useState } from "react";
import { BarChart3, Filter, Users } from "lucide-react";
import { useInstructorAPI } from "../../hooks/useInstructorAPI";

export default function StudentPerformance() {
  const { fetchStudentPerformance, loading, error, clearError } = useInstructorAPI();
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({ totalStudents: 0, averageScore: 0, selectedCourse: null });
  const [selectedCourse, setSelectedCourse] = useState("");

  const instructor = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("instructor") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchStudentPerformance(selectedCourse || undefined);
        setStudents(data.students || []);
        setSummary({
          totalStudents: data.totalStudents || 0,
          averageScore: data.averageScore || 0,
          selectedCourse: data.selectedCourse || null,
        });
      } catch (_) {
        // error handled by hook
      }
    };

    loadData();
  }, [selectedCourse]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Student Performance</h1>
          <p className="mt-1 text-sm text-slate-500">View students in your courses with quiz averages and results.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Total Students" value={summary.totalStudents} icon={Users} />
          <StatCard title="Average Score" value={summary.averageScore} icon={BarChart3} />
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Filter size={16} /> Filter by course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All courses</option>
              {(instructor?.courses || []).map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
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
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Course</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Average Score</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Quiz Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-500">
                    {loading ? "Loading student performance..." : "No student data available."}
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="align-top hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{student.course}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{student.averageScore}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="space-y-2">
                        {(student.scores || []).map((result) => (
                          <div key={`${student.id}-${result.quizId}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            Quiz #{result.quizId}: <span className="font-semibold">{result.score}</span>
                          </div>
                        ))}
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
