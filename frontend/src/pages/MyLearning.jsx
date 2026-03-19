import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MarkdownBlock({ content }) {
  const lines = (content || "").split("\n");
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="mb-5 list-disc space-y-1 pl-6 text-slate-700">
          {listItems.map((item, idx) => (
            <li key={`li-${key}-${idx}`}>{item}</li>
          ))}
        </ul>
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
    if (line.startsWith("### ")) elements.push(<h3 key={`h3-${i}`} className="mb-2 mt-6 text-xl font-bold text-slate-900">{line.slice(4)}</h3>);
    else if (line.startsWith("## ")) elements.push(<h2 key={`h2-${i}`} className="mb-3 mt-7 text-2xl font-bold text-slate-900">{line.slice(3)}</h2>);
    else if (line.startsWith("# ")) elements.push(<h1 key={`h1-${i}`} className="mb-4 mt-2 text-3xl font-extrabold text-slate-900">{line.slice(2)}</h1>);
    else elements.push(<p key={`p-${i}`} className="mb-4 text-[19px] leading-9 text-slate-700">{line}</p>);
  });

  flushList("end");
  return <>{elements}</>;
}

export default function LearnPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  // group lessons by module
  const groupedModules = useMemo(() => {
    const map = new Map();
    lessons.forEach((lesson) => {
      if (!map.has(lesson.module_id)) map.set(lesson.module_id, { module_id: lesson.module_id, module_title: lesson.module_title, module_order: lesson.module_order, lessons: [] });
      map.get(lesson.module_id).lessons.push(lesson);
    });
    return [...map.values()].sort((a, b) => a.module_order - b.module_order);
  }, [lessons]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const loadCourse = async () => {
      setLoading(true);
      setError("");
      setNotEnrolled(false);

      try {
        // check enrollment first
        const checkRes = await axios.get(`/api/enrollments/${courseId}`, { baseURL: API_BASE, headers });
        if (!checkRes.data.enrolled) {
          setNotEnrolled(true);
          setLoading(false);
          return;
        }

        // fetch course
        const courseRes = await axios.get(`/api/courses/${courseId}`, { baseURL: API_BASE, headers });
        setCourse(courseRes.data.course);

        // fetch lessons
        const lessonsRes = await axios.get(`/api/courses/${courseId}/lessons`, { baseURL: API_BASE, headers });
        const fetchedLessons = lessonsRes.data.lessons || [];
        setLessons(fetchedLessons);

        if (fetchedLessons.length > 0) {
          const targetLessonId = Number(lessonId) || fetchedLessons[0].id;
          const lessonRes = await axios.get(`/api/lessons/${targetLessonId}`, { baseURL: API_BASE, headers });
          setActiveLesson(lessonRes.data.lesson);
        }
      } catch (err) {
        if (!err.response) setError("Cannot connect to backend API");
        else if (err.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else if (err.response.status === 403) {
          setNotEnrolled(true);
        } else setError(err.response.data.message || "Failed to load learning page");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, lessonId, navigate, token]);

  const openLesson = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const lessonRes = await axios.get(`/api/lessons/${id}`, { baseURL: API_BASE, headers });
      setActiveLesson(lessonRes.data.lesson);
      navigate(`/learn/${courseId}/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lesson");
    }
  };

  const handleEnroll = async () => {
    if (!courseId) return alert("Invalid course ID");
    setEnrolling(true);
    try {
      const res = await axios.post("/api/enrollments", { course_id: Number(courseId) }, { baseURL: API_BASE, headers: { Authorization: `Bearer ${token}` } });
      if (res.data.enrolled) {
        setNotEnrolled(false);
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  if (notEnrolled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-100">
        <div className="rounded-2xl border bg-white px-10 py-10 text-center shadow">
          <h2 className="mb-2 text-2xl font-bold">{course?.title || "This Course"}</h2>
          <p className="mb-6 text-slate-500">You need to enroll in this course before accessing lessons.</p>
          <button onClick={handleEnroll} disabled={enrolling} className="rounded-lg bg-blue-600 px-8 py-3 text-white">{enrolling ? "Enrolling..." : "Enroll Now"}</button>
          <div className="mt-4">
            <Link to="/dashboard" className="text-sm text-slate-400 hover:underline">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-[#032B59] px-6 py-3 text-white shadow">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold">CADT</div>
          <p className="text-xs uppercase tracking-wider text-blue-200">Academy Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-slate-900">Learn</Link>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }} className="rounded-lg border border-white/30 px-3 py-1 text-sm">Logout</button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="h-[calc(100vh-56px)] w-[320px] overflow-y-auto bg-[#061936] text-white">
          <div className="border-b border-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Current Course</p>
            <h2 className="mt-2 text-lg font-semibold">{course?.title || "Course"}</h2>
            <p className="mt-2 text-xs text-slate-300">{course?.description || "Learning content from database"}</p>
          </div>
          <div className="p-3">
            {groupedModules.map((module) => (
              <div key={module.module_id} className="mb-5">
                <p className="mb-2 text-xs uppercase tracking-widest text-blue-300">Module {module.module_order}</p>
                <h3 className="mb-2 text-sm font-semibold text-white">{module.module_title}</h3>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <button key={lesson.id} onClick={() => openLesson(lesson.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${activeLesson?.id === lesson.id ? "bg-blue-900/80 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>{lesson.title}</button>
                  ))}
                </div>
              </div>
            ))}
            {groupedModules.length === 0 && <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">No lessons available.</p>}
          </div>
        </aside>

        <main className="h-[calc(100vh-56px)] flex-1 overflow-y-auto bg-[#F2F4F7] px-10 py-8">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 shadow-sm">
            <div className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Home {'>'} Course {'>'} Lesson</div>
            <h1 className="mb-2 text-5xl font-extrabold leading-tight text-slate-900">{activeLesson?.title || "Select a lesson"}</h1>
            {activeLesson && <div className="mb-8 flex items-center gap-4 text-sm text-slate-500"><span>📘 Module {activeLesson.module_order || "-"}</span>•<span>Lesson {activeLesson.lesson_order || "-"}</span></div>}
            <div className="border-t pt-6">{activeLesson ? <MarkdownBlock content={activeLesson.content_md} /> : <p className="text-slate-500">No lesson selected.</p>}</div>
          </div>
        </main>
      </div>
    </div>
  );
}