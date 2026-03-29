import { useEffect, useMemo, useState } from "react";
import { BookOpen, Layers3, Search, Users } from "lucide-react";
import { useInstructorAPI } from "../../hooks/useInstructorAPI";

export default function ManageCourses() {
  const { fetchInstructorCourses, loading, error, clearError } = useInstructorAPI();
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchInstructorCourses();
        setCourses(data || []);
      } catch (_) {
        // handled by hook
      }
    };

    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return courses;

    return courses.filter((course) =>
      [course.title, course.description, course.category]
        .some((value) => String(value || "").toLowerCase().includes(keyword)),
    );
  }, [courses, query]);

  const totalLessons = useMemo(
    () => courses.reduce((sum, course) => sum + Number(course.lessonCount || 0), 0),
    [courses],
  );

  const totalStudents = useMemo(
    () => courses.reduce((sum, course) => sum + Number(course.enrollmentCount || 0), 0),
    [courses],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Course Management</h1>
          <p className="mt-1 text-sm text-slate-500">View the courses assigned to your instructor account.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Assigned Courses" value={courses.length} icon={BookOpen} />
          <StatCard title="Total Lessons" value={totalLessons} icon={Layers3} />
          <StatCard title="Students Enrolled" value={totalStudents} icon={Users} />
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses"
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredCourses.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm lg:col-span-2">
              {loading ? "Loading courses..." : "No courses available."}
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{course.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">{course.description || "No description available."}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {course.category || "Course"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Lessons" value={course.lessonCount || 0} />
                  <InfoItem label="Students" value={course.enrollmentCount || 0} />
                  <InfoItem label="Level" value={course.level || "-"} />
                  <InfoItem label="Status" value={course.status || "Published"} />
                </div>
              </div>
            ))
          )}
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

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-900">{value}</p>
    </div>
  );
}