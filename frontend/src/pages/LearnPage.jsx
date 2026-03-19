import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";
const API_TARGET_LABEL = import.meta.env.VITE_API_URL || "Vite /api proxy";

function MarkdownBlock({ content }) {
  const lines = (content || "").split("\n");
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${key}`}
          className="mb-5 list-disc space-y-1 pl-6 text-slate-700"
        >
          {listItems.map((item, idx) => (
            <li key={`li-${key}-${idx}`}>{item}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();

    if (!line) {
      flushList(i);
      return;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList(i);

    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mb-2 mt-6 text-xl font-bold text-slate-900"
        >
          {line.slice(4)}
        </h3>,
      );
      return;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mb-3 mt-7 text-2xl font-bold text-slate-900"
        >
          {line.slice(3)}
        </h2>,
      );
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="mb-4 mt-2 text-3xl font-extrabold text-slate-900"
        >
          {line.slice(2)}
        </h1>,
      );
      return;
    }

    elements.push(
      <p key={`p-${i}`} className="mb-4 text-[19px] leading-9 text-slate-700">
        {line}
      </p>,
    );
  });

  flushList("end");
  return <>{elements}</>;
}

export default function LearnPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  const token = localStorage.getItem("token");

  const groupedModules = useMemo(() => {
    const map = new Map();

    lessons.forEach((lesson) => {
      const moduleId = lesson.module_id;
      if (!map.has(moduleId)) {
        map.set(moduleId, {
          module_id: moduleId,
          module_title:
            lesson.module_title || `Module ${lesson.module_order || ""}`,
          module_order: lesson.module_order || 0,
          lessons: [],
        });
      }
      map.get(moduleId).lessons.push(lesson);
    });

    return [...map.values()].sort((a, b) => a.module_order - b.module_order);
  }, [lessons]);

  const allLessons = useMemo(() => {
    return [...lessons].sort((a, b) => {
      const moduleOrderDiff =
        Number(a.module_order || 0) - Number(b.module_order || 0);
      if (moduleOrderDiff !== 0) return moduleOrderDiff;
      return Number(a.lesson_order || 0) - Number(b.lesson_order || 0);
    });
  }, [lessons]);

  const activeLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return allLessons.findIndex((l) => Number(l.id) === Number(activeLesson.id));
  }, [allLessons, activeLesson]);

  const progressPercent = useMemo(() => {
    if (allLessons.length === 0 || activeLessonIndex < 0) return 0;
    return Math.round(((activeLessonIndex + 1) / allLessons.length) * 100);
  }, [allLessons.length, activeLessonIndex]);

  const activeModule = useMemo(() => {
    if (!activeLesson) return null;
    return groupedModules.find(
      (m) => Number(m.module_id) === Number(activeLesson.module_id),
    );
  }, [groupedModules, activeLesson]);

  const completedLessonIds = useMemo(() => {
    if (activeLessonIndex <= 0) return new Set();
    return new Set(
      allLessons
        .slice(0, activeLessonIndex)
        .map((lesson) => Number(lesson.id)),
    );
  }, [allLessons, activeLessonIndex]);

  const estimateReadMinutes = (markdownContent) => {
    const text = (markdownContent || "").replace(/[#*_`>-]/g, " ").trim();
    const words = text ? text.split(/\s+/).length : 0;
    return Math.max(3, Math.ceil(words / 180));
  };

  useEffect(() => {
    if (groupedModules.length === 0) return;

    setExpandedModules((prev) => {
      const next = { ...prev };

      // Keep first module open by default for discoverability.
      const firstId = Number(groupedModules[0].module_id);
      if (next[firstId] === undefined) next[firstId] = true;

      // Ensure active lesson's module is open.
      if (activeModule?.module_id !== undefined) {
        next[Number(activeModule.module_id)] = true;
      }

      return next;
    });
  }, [groupedModules, activeModule]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const load = async () => {
      setLoading(true);
      setError("");
      setNotEnrolled(false);
      try {
        const courseRes = await axios.get(`/api/courses/${courseId}`, {
          baseURL: API_BASE,
          headers,
        });
        setCourse(courseRes.data.course);

        let lessonsRes;
        try {
          lessonsRes = await axios.get(`/api/courses/${courseId}/lessons`, {
            baseURL: API_BASE,
            headers,
          });
        } catch (err) {
          if (err.response?.status === 403) {
            setNotEnrolled(true);
            setLoading(false);
            return;
          }
          throw err;
        }

        const fetchedLessons = lessonsRes.data.lessons || [];
        setLessons(fetchedLessons);
        if (fetchedLessons.length === 0) {
          setActiveLesson(null);
          setLoading(false);
          return;
        }

        const targetLessonId = Number(lessonId) || fetchedLessons[0].id;
        const lessonRes = await axios.get(`/api/lessons/${targetLessonId}`, {
          baseURL: API_BASE,
          headers,
        });
        setActiveLesson(lessonRes.data.lesson);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        if (!err.response) {
          setError(`Cannot connect to backend API (${API_TARGET_LABEL})`);
          return;
        }

        setError(err.response?.data?.message || "Failed to load learning page");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId, lessonId, navigate, token]);

  const openLesson = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const lessonRes = await axios.get(`/api/lessons/${id}`, {
        baseURL: API_BASE,
        headers,
      });
      setActiveLesson(lessonRes.data.lesson);
      navigate(`/learn/${courseId}/${id}`);
    } catch (err) {
      if (!err.response) {
        setError(`Cannot connect to backend API (${API_TARGET_LABEL})`);
        return;
      }
      setError(err.response?.data?.message || "Failed to load lesson");
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await axios.post(
        "/api/enrollments",
        { course_id: Number(courseId) },
        {
          baseURL: API_BASE,
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotEnrolled(false);
      // reload lessons
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const openLessonByOffset = async (offset) => {
    if (activeLessonIndex < 0) return;
    const target = allLessons[activeLessonIndex + offset];
    if (!target) return;
    await openLesson(target.id);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading learning page...</p>
      </div>
    );
  }

  if (notEnrolled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100">
        <div className="rounded-2xl border border-cadtLine bg-white px-10 py-10 text-center shadow-card">
          <h2 className="mb-2 text-2xl font-bold text-cadtNavy">
            {course?.title || "This Course"}
          </h2>
          <p className="mb-6 text-slate-500">
            You need to enroll in this course before accessing lessons.
          </p>
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="rounded-lg bg-cadtBlue px-8 py-3 font-semibold text-white transition hover:bg-cadtNavy disabled:opacity-60"
          >
            {enrolling ? "Enrolling..." : "Enroll Now"}
          </button>
          <div className="mt-4">
            <Link
              to="/dashboard"
              className="text-sm text-slate-400 hover:underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171717] p-2 md:p-4">
      <div className="mx-auto min-h-[calc(100vh-1rem)] max-w-[1400px] overflow-hidden rounded-2xl bg-[#ECEEF2] shadow-2xl ring-1 ring-black/10 md:min-h-[calc(100vh-2rem)]">
        <header className="flex items-center justify-between bg-[#032A56] px-4 py-3 text-white md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-sm font-bold text-slate-900">
              KC
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Next Gen Engagement</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200">
                Learning Platform
              </p>
            </div>
          </div>

          <div className="hidden rounded-full bg-[#012149] p-1 md:flex">
            <button className="rounded-full bg-amber-400 px-5 py-1.5 text-xs font-semibold text-slate-900">
              Learn
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-xs font-medium text-blue-100 hover:text-white">
              Dashboard
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="rounded-md border border-white/30 px-3 py-1 text-xs font-medium hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-4.5rem)]">
          <aside className="hidden w-[320px] shrink-0 overflow-y-auto bg-[#061632] text-white lg:block">
            <div className="border-b border-white/10 bg-gradient-to-b from-[#0a2851] to-[#061632] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-amber-300">
                Current Course
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-snug">
                {course?.title || "Course"}
              </h2>

              {activeModule && (
                <p className="mt-1 text-xs text-blue-200/90">
                  In progress: {activeModule.module_title}
                </p>
              )}

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[11px] text-blue-100">
                  <span>Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-200">
                  Course Content
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {allLessons.length} lessons across {groupedModules.length} modules
                </p>
              </div>
            </div>

            <div className="px-0 py-2">
              {groupedModules.map((module) => (
                <div key={module.module_id} className="border-b border-white/10">
                  <button
                    onClick={() => toggleModule(Number(module.module_id))}
                    className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-white/5"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-blue-300">
                        Module {module.module_order}
                      </p>
                      <h3 className="text-sm font-semibold text-white">{module.module_title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-300">
                        {
                          module.lessons.filter((lesson) =>
                            completedLessonIds.has(Number(lesson.id)),
                          ).length
                        }
                        /{module.lessons.length}
                      </span>
                      <span className="text-xs text-blue-200">
                        {expandedModules[Number(module.module_id)] ? "-" : "+"}
                      </span>
                    </div>
                  </button>

                  {expandedModules[Number(module.module_id)] && (
                    <div className="pb-2">
                      {[...module.lessons]
                        .sort(
                          (a, b) =>
                            Number(a.lesson_order || 0) - Number(b.lesson_order || 0),
                        )
                        .map((lesson) => {
                      const isActive = Number(activeLesson?.id) === Number(lesson.id);
                      const isCompleted = completedLessonIds.has(Number(lesson.id));
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => openLesson(lesson.id)}
                          className={`w-full border-l-2 px-5 py-3 text-left transition ${
                            isActive
                              ? "border-amber-400 bg-gradient-to-r from-white/12 to-white/5 text-white"
                              : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                                isActive
                                  ? "bg-amber-400 text-slate-900"
                                  : isCompleted
                                    ? "bg-emerald-500/90 text-white"
                                    : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {isCompleted ? "V" : lesson.lesson_order || "-"}
                            </span>
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-medium leading-snug">
                                {lesson.title}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                                <span>{estimateReadMinutes(lesson.content_md)} min</span>
                                <span className="h-1 w-1 rounded-full bg-slate-500" />
                                <span>{isActive ? "Current" : isCompleted ? "Done" : "Pending"}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    </div>
                  )}
                </div>
              ))}

              {groupedModules.length === 0 && (
                <p className="px-5 py-4 text-xs text-slate-300">No lessons available yet.</p>
              )}
            </div>
          </aside>

          <main className="relative flex-1 overflow-y-auto bg-[#ECEEF2]">
            <div className="mx-auto w-full max-w-5xl px-5 pb-28 pt-8 md:px-10">
              <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Home &gt; Module {activeLesson?.module_order || "-"} &gt; Lesson {activeLesson?.lesson_order || "-"}
              </div>

              <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                {activeLesson?.title || "Select a lesson"}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-5 border-b border-slate-300 pb-5 text-sm text-slate-500">
                <span>{estimateReadMinutes(activeLesson?.content_md)} min read</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Beginner Friendly</span>
              </div>

              <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-9">
                {activeLesson?.content_md ? (
                  <MarkdownBlock content={activeLesson.content_md} />
                ) : (
                  <p className="text-slate-500">No lesson selected.</p>
                )}
              </div>
            </div>

            <div className="fixed bottom-6 left-1/2 z-20 w-[min(100%-2rem,1040px)] -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => openLessonByOffset(-1)}
                  disabled={activeLessonIndex <= 0}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="hidden min-w-0 flex-1 px-2 md:block">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Up next</p>
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {allLessons[activeLessonIndex + 1]?.title || "You reached the last lesson"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    allLessons[activeLessonIndex + 1]
                      ? openLessonByOffset(1)
                      : navigate("/dashboard")
                  }
                  className="rounded-lg bg-[#0A4D98] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#083f7c]"
                >
                  {allLessons[activeLessonIndex + 1] ? "Complete and Continue" : "Back to Dashboard"}
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
