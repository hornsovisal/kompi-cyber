import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../kompi-cyber-logo-slide.svg";
import CertificateSection from "../components/CertificateSection";

const API_BASE = import.meta.env.VITE_API_URL || "";
const API_TARGET_LABEL = import.meta.env.VITE_API_URL || "Vite /api proxy";
const REQUEST_TIMEOUT_MS = 10000;

function MarkdownBlock({ content }) {
  const lines = (content || "").split("\n");
  const elements = [];
  let listItems = [];
  let codeBlock = null;
  let codeLines = [];
  let blockquoteLines = [];
  let tableLines = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${key}`}
          className="mb-5 list-disc space-y-1 pl-6 text-slate-700"
        >
          {listItems.map((item, idx) => (
            <li key={`li-${key}-${idx}`}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  const flushCodeBlock = (key) => {
    if (codeLines.length > 0) {
      const code = codeLines.join("\n");
      elements.push(
        <pre
          key={`code-${key}`}
          className="mb-5 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"
        >
          <code className="font-mono">{code}</code>
        </pre>,
      );
      codeLines = [];
      codeBlock = null;
    }
  };

  const flushBlockquote = (key) => {
    if (blockquoteLines.length > 0) {
      const quote = blockquoteLines.join("\n");
      elements.push(
        <blockquote
          key={`quote-${key}`}
          className="mb-5 border-l-4 border-slate-300 bg-slate-100 py-2 pl-4 pr-4 italic text-slate-700"
        >
          {renderInline(quote)}
        </blockquote>,
      );
      blockquoteLines = [];
    }
  };

  const flushTable = (key) => {
    if (tableLines.length < 2) {
      tableLines = [];
      return;
    }

    // First line is header, second line is separator
    const headerLine = tableLines[0];
    const headers = headerLine
      .split("|")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const rows = tableLines.slice(2).map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0),
    );

    elements.push(
      <div
        key={`table-${key}`}
        className="mb-5 overflow-x-auto rounded-lg border border-slate-200"
      >
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={`th-${idx}`}
                  className="px-4 py-3 text-left font-semibold text-slate-900"
                >
                  {renderInline(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row, rowIdx) => (
              <tr key={`tr-${rowIdx}`}>
                {row.map((cell, cellIdx) => (
                  <td
                    key={`td-${rowIdx}-${cellIdx}`}
                    className="px-4 py-3 text-slate-700"
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    tableLines = [];
  };

  // Enhanced inline rendering for bold, italic, code
  const renderInline = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    // Handle **bold**, __bold__, *italic*, _italic_, `code`
    const regex = /(\*\*[^\*]+\*\*|__[^_]+__|`[^`]+`|\*[^\*]+\*|_[^_]+_)/g;
    let match;
    let lastIndex = 0;

    const matches = [];
    const tempRegex = /(\*\*[^\*]+\*\*|__[^_]+__|`[^`]+`|\*[^\*]+\*|_[^_]+_)/g;
    while ((match = tempRegex.exec(text)) !== null) {
      matches.push({ text: match[0], index: match.index });
    }

    if (matches.length === 0) {
      return text;
    }

    matches.forEach((m) => {
      // Add text before match
      if (m.index > lastIndex) {
        parts.push(text.slice(lastIndex, m.index));
      }

      const matched = m.text;
      if (matched.startsWith("**") && matched.endsWith("**")) {
        parts.push(
          <strong key={`b-${key++}`} className="font-bold text-slate-900">
            {matched.slice(2, -2)}
          </strong>,
        );
      } else if (matched.startsWith("__") && matched.endsWith("__")) {
        parts.push(
          <strong key={`b-${key++}`} className="font-bold text-slate-900">
            {matched.slice(2, -2)}
          </strong>,
        );
      } else if (matched.startsWith("`") && matched.endsWith("`")) {
        parts.push(
          <code
            key={`c-${key++}`}
            className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-sm text-slate-900"
          >
            {matched.slice(1, -1)}
          </code>,
        );
      } else if (matched.startsWith("*") && matched.endsWith("*")) {
        parts.push(
          <em key={`i-${key++}`} className="italic text-slate-800">
            {matched.slice(1, -1)}
          </em>,
        );
      } else if (matched.startsWith("_") && matched.endsWith("_")) {
        parts.push(
          <em key={`i-${key++}`} className="italic text-slate-800">
            {matched.slice(1, -1)}
          </em>,
        );
      }

      lastIndex = m.index + m.text.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  lines.forEach((raw, i) => {
    const line = raw;
    const trimmed = line.trim();

    // Handle code blocks
    if (trimmed.startsWith("```")) {
      if (codeBlock) {
        flushCodeBlock(i);
      } else {
        flushList(i);
        flushBlockquote(i);
        flushTable(i);
        codeBlock = trimmed.slice(3) || "bash";
      }
      return;
    }

    if (codeBlock) {
      codeLines.push(line);
      return;
    }

    // Handle blockquotes
    if (trimmed.startsWith("> ")) {
      blockquoteLines.push(trimmed.slice(2));
      return;
    }

    if (blockquoteLines.length > 0 && !trimmed.startsWith("> ")) {
      flushBlockquote(i);
    }

    // Handle tables - detect pipe character
    if (trimmed.includes("|")) {
      if (tableLines.length === 0) {
        flushList(i);
      }
      tableLines.push(trimmed);
      return;
    }

    // If we were building a table and now there's no pipe, flush it
    if (tableLines.length > 0 && !trimmed.includes("|")) {
      flushTable(i);
    }

    if (!trimmed) {
      flushList(i);
      return;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList(i);

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mb-2 mt-6 text-xl font-bold text-slate-900"
        >
          {renderInline(trimmed.slice(4))}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mb-3 mt-7 text-2xl font-bold text-slate-900"
        >
          {renderInline(trimmed.slice(3))}
        </h2>,
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="mb-4 mt-2 text-3xl font-extrabold text-slate-900"
        >
          {renderInline(trimmed.slice(2))}
        </h1>,
      );
      return;
    }

    elements.push(
      <p key={`p-${i}`} className="mb-4 text-[19px] leading-9 text-slate-700">
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList("end");
  flushBlockquote("end");
  flushTable("end");
  flushCodeBlock("end");
  return <>{elements}</>;
}

export default function LearnPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("learn");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [practiceView, setPracticeView] = useState("list");
  const [practiceItems, setPracticeItems] = useState([]);
  const [practiceListLoading, setPracticeListLoading] = useState(false);
  const [practiceListError, setPracticeListError] = useState("");

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
    return allLessons.findIndex(
      (l) => Number(l.id) === Number(activeLesson.id),
    );
  }, [allLessons, activeLesson]);

  // Calculate progress based on completed quizzes (quiz attempts), not lesson navigation
  const completedLessonIds = useMemo(() => {
    const completedIds = new Set(
      practiceHistory.map((item) => Number(item.lessonId)),
    );
    return completedIds;
  }, [practiceHistory]);

  const progressPercent = useMemo(() => {
    if (allLessons.length === 0) return 0;
    // Progress = (lessons with quiz attempts / total lessons) * 100
    return Math.round((completedLessonIds.size / allLessons.length) * 100);
  }, [allLessons.length, completedLessonIds]);

  const activeModule = useMemo(() => {
    if (!activeLesson) return null;
    return groupedModules.find(
      (m) => Number(m.module_id) === Number(activeLesson.module_id),
    );
  }, [groupedModules, activeLesson]);

  const estimateReadMinutes = (markdownContent) => {
    const text = (markdownContent || "").replace(/[#*_`>-]/g, " ").trim();
    const words = text ? text.split(/\s+/).length : 0;
    return Math.max(3, Math.ceil(words / 180));
  };

  useEffect(() => {
    if (groupedModules.length === 0) return;

    setExpandedModules((prev) => {
      const next = { ...prev };

      // Open all modules by default so every lesson in the course is visible.
      groupedModules.forEach((module) => {
        const id = Number(module.module_id);
        if (next[id] === undefined) next[id] = true;
      });

      return next;
    });
  }, [groupedModules]);

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

        const parsedLessonId = Number(lessonId);
        const hasRouteLessonInCourse = fetchedLessons.some(
          (lesson) => Number(lesson.id) === parsedLessonId,
        );
        const targetLessonId = hasRouteLessonInCourse
          ? parsedLessonId
          : Number(fetchedLessons[0].id);

        try {
          const lessonRes = await axios.get(`/api/lessons/${targetLessonId}`, {
            baseURL: API_BASE,
            headers,
          });
          setActiveLesson(lessonRes.data.lesson);
        } catch (lessonErr) {
          // If route lesson is stale or not accessible, load first lesson for this course.
          const fallbackId = Number(fetchedLessons[0].id);
          const fallbackRes = await axios.get(`/api/lessons/${fallbackId}`, {
            baseURL: API_BASE,
            headers,
          });
          setActiveLesson(fallbackRes.data.lesson);
          navigate(`/learn/${courseId}/${fallbackId}`, { replace: true });
        }
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
    setError("");
    try {
      const enrollRes = await axios.post(
        "/api/enrollments",
        { course_id: Number(courseId) },
        {
          baseURL: API_BASE,
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (enrollRes.data?.enrolled) {
        setNotEnrolled(false);

        // Retry loading lessons after enrollment with a small delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        const headers = { Authorization: `Bearer ${token}` };
        try {
          const lessonsRes = await axios.get(
            `/api/courses/${courseId}/lessons`,
            {
              baseURL: API_BASE,
              headers,
            },
          );

          const fetchedLessons = lessonsRes.data.lessons || [];
          if (fetchedLessons.length > 0) {
            setLessons(fetchedLessons);

            // Load the first lesson
            const firstLessonId = Number(fetchedLessons[0].id);
            const lessonRes = await axios.get(`/api/lessons/${firstLessonId}`, {
              baseURL: API_BASE,
              headers,
            });
            setActiveLesson(lessonRes.data.lesson);
            navigate(`/learn/${courseId}/${firstLessonId}`, { replace: true });
          }
        } catch (lessonErr) {
          console.error("Failed to load lessons after enrollment:", lessonErr);
          // Fall back to page reload if manual reload fails
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setError(
        err.response?.data?.message ||
          (err.message === "Request failed with status code 401"
            ? "Your session expired. Please log in again."
            : "Failed to enroll in course. Please try again."),
      );
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

  const handleAnswerChange = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitPractice = async () => {
    if (!activeLesson?.id || !token || quizQuestions.length === 0) return;

    const unanswered = quizQuestions.some((q) => !selectedAnswers[q.id]);
    if (unanswered) {
      setQuizError("Please answer all questions before submitting.");
      return;
    }

    setSubmittingQuiz(true);
    setQuizError("");
    try {
      const payload = {
        answers: quizQuestions.map((q) => ({
          question_id: q.id,
          selected_option_id: Number(selectedAnswers[q.id]),
        })),
      };

      const res = await axios.post(
        `/api/submissions/lesson/${activeLesson.id}`,
        payload,
        {
          baseURL: API_BASE,
          headers: { Authorization: `Bearer ${token}` },
          timeout: REQUEST_TIMEOUT_MS,
        },
      );

      setQuizResult({
        score: Number(res.data?.score || 0),
        totalQuestions: Number(
          res.data?.totalQuestions || quizQuestions.length,
        ),
        correctCount: Number(res.data?.correctCount || 0),
        attemptNo: Number(res.data?.attemptNo || 1),
      });
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        setQuizError(
          "Request timed out. Please check backend/database and try again.",
        );
      } else if (!err.response) {
        setQuizError(`Cannot connect to backend API (${API_TARGET_LABEL})`);
      } else {
        setQuizError(
          err.response?.data?.message || "Failed to submit practice",
        );
      }
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const averagePracticeScore = useMemo(() => {
    if (practiceHistory.length === 0) return 0;
    const total = practiceHistory.reduce((sum, row) => sum + row.score, 0);
    return Math.round(total / practiceHistory.length);
  }, [practiceHistory]);

  const highestPracticeScore = useMemo(() => {
    if (practiceHistory.length === 0) return 0;
    return Math.max(...practiceHistory.map((row) => row.score));
  }, [practiceHistory]);

  const practiceStats = useMemo(() => {
    const available = practiceItems.filter((item) => !item.attempt).length;
    const completed = practiceItems.filter((item) => item.attempt).length;
    const totalQuestions = practiceItems.reduce(
      (sum, item) => sum + Number(item.questionCount || 0),
      0,
    );

    return {
      available,
      completed,
      upcoming: Math.max(0, practiceItems.length - completed),
      totalQuestions,
    };
  }, [practiceItems]);

  useEffect(() => {
    if (activeTab !== "practice") return;
    if (!token || allLessons.length === 0) {
      setPracticeItems([]);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const loadPracticeList = async () => {
      setPracticeListLoading(true);
      setPracticeListError("");
      try {
        const rows = await Promise.all(
          allLessons.map(async (lesson) => {
            try {
              const quizRes = await axios.get(
                `/api/quizzes/lesson/${lesson.id}`,
                {
                  baseURL: API_BASE,
                  headers,
                  timeout: REQUEST_TIMEOUT_MS,
                },
              );

              const questions = quizRes.data?.data || [];
              if (questions.length === 0) return null;

              let attempt = null;
              try {
                const attemptRes = await axios.get(
                  `/api/quizzes/lesson/${lesson.id}/attempt`,
                  {
                    baseURL: API_BASE,
                    headers,
                    timeout: REQUEST_TIMEOUT_MS,
                  },
                );
                attempt = attemptRes.data?.data || null;
              } catch (attemptErr) {
                if (attemptErr.response?.status !== 404) {
                  throw attemptErr;
                }
              }

              return {
                lessonId: Number(lesson.id),
                lessonTitle: lesson.title,
                moduleOrder: Number(lesson.module_order || 0),
                moduleTitle: lesson.module_title,
                lessonOrder: Number(lesson.lesson_order || 0),
                questionCount: questions.length,
                durationMin: Math.max(10, questions.length * 3),
                attempt,
              };
            } catch (quizErr) {
              if (quizErr.response?.status === 404) return null;
              throw quizErr;
            }
          }),
        );

        const filtered = rows.filter(Boolean).sort((a, b) => {
          const moduleDiff = a.moduleOrder - b.moduleOrder;
          if (moduleDiff !== 0) return moduleDiff;
          return a.lessonOrder - b.lessonOrder;
        });

        setPracticeItems(filtered);

        if (
          filtered.length > 0 &&
          (!activeLesson ||
            !filtered.some((item) => item.lessonId === Number(activeLesson.id)))
        ) {
          const firstPending =
            filtered.find((item) => !item.attempt) || filtered[0];
          const lessonRes = await axios.get(
            `/api/lessons/${firstPending.lessonId}`,
            {
              baseURL: API_BASE,
              headers,
            },
          );
          setActiveLesson(lessonRes.data.lesson);
        }
      } catch (err) {
        if (err.code === "ECONNABORTED") {
          setPracticeListError(
            "Request timed out. Please check backend/database and try again.",
          );
        } else if (!err.response) {
          setPracticeListError(
            `Cannot connect to backend API (${API_TARGET_LABEL})`,
          );
        } else {
          setPracticeListError(
            err.response?.data?.message ||
              "Failed to load practice assessments",
          );
        }
      } finally {
        setPracticeListLoading(false);
      }
    };

    loadPracticeList();
  }, [activeTab, allLessons, token]);

  useEffect(() => {
    if (activeTab !== "practice") return;
    if (practiceView !== "quiz") return;
    if (!activeLesson?.id || !token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const loadPractice = async () => {
      setQuizLoading(true);
      setQuizError("");
      setQuizQuestions([]);
      setSelectedAnswers({});
      setQuizResult(null);
      try {
        const quizRes = await axios.get(
          `/api/quizzes/lesson/${activeLesson.id}`,
          {
            baseURL: API_BASE,
            headers,
            timeout: REQUEST_TIMEOUT_MS,
          },
        );
        const questions = quizRes.data?.data || [];
        setQuizQuestions(questions);

        try {
          const attemptRes = await axios.get(
            `/api/quizzes/lesson/${activeLesson.id}/attempt`,
            {
              baseURL: API_BASE,
              headers,
              timeout: REQUEST_TIMEOUT_MS,
            },
          );
          const latest = attemptRes.data?.data;
          if (latest) {
            const answerMap = {};
            (latest.answers || []).forEach((item) => {
              answerMap[item.question_id] = item.selected_option_id;
            });
            setSelectedAnswers(answerMap);
            setQuizResult({
              score: latest.score,
              totalQuestions: questions.length,
              correctCount: Math.round(
                (Number(latest.score || 0) * questions.length) / 100,
              ),
              attemptNo: latest.attemptNo,
            });
          }
        } catch (attemptErr) {
          if (attemptErr.response?.status !== 404) {
            throw attemptErr;
          }
        }
      } catch (err) {
        if (err.code === "ECONNABORTED") {
          setQuizError(
            "Request timed out. Please check backend/database and try again.",
          );
        } else if (err.response?.status === 404) {
          setQuizError("No practice questions for this lesson yet.");
        } else if (!err.response) {
          setQuizError(`Cannot connect to backend API (${API_TARGET_LABEL})`);
        } else {
          setQuizError(
            err.response?.data?.message || "Failed to load practice",
          );
        }
      } finally {
        setQuizLoading(false);
      }
    };

    loadPractice();
  }, [activeTab, practiceView, activeLesson?.id, token]);

  // Function to load all progress (shared by multiple useEffects)
  const loadProgressData = async (headers) => {
    setProgressLoading(true);
    setProgressError("");
    try {
      const requests = allLessons.map((lesson) =>
        axios
          .get(`/api/quizzes/lesson/${lesson.id}/attempt`, {
            baseURL: API_BASE,
            headers,
            timeout: REQUEST_TIMEOUT_MS,
          })
          .then((res) => ({ lesson, attempt: res.data?.data || null }))
          .catch((err) => {
            if (err.response?.status === 404) {
              return { lesson, attempt: null };
            }
            throw err;
          }),
      );

      const results = await Promise.all(requests);
      const rows = results
        .filter((item) => item.attempt)
        .map((item) => ({
          lessonId: item.lesson.id,
          lessonTitle: item.lesson.title,
          moduleTitle: item.lesson.module_title,
          score: Number(item.attempt.score || 0),
          attemptNo: item.attempt.attemptNo,
          submittedAt: item.attempt.submittedAt,
        }))
        .sort(
          (a, b) =>
            new Date(b.submittedAt || 0).getTime() -
            new Date(a.submittedAt || 0).getTime(),
        );

      setPracticeHistory(rows);
    } catch (err) {
      if (err.code === "ECONNABORTED") {
        setProgressError(
          "Request timed out. Please check backend/database and try again.",
        );
      } else if (!err.response) {
        setProgressError(`Cannot connect to backend API (${API_TARGET_LABEL})`);
      } else {
        setProgressError(
          err.response?.data?.message || "Failed to load progress",
        );
      }
    } finally {
      setProgressLoading(false);
    }
  };

  // Load progress when progress tab is active
  useEffect(() => {
    if (activeTab !== "progress") return;
    if (!token || allLessons.length === 0) {
      setPracticeHistory([]);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    loadProgressData(headers);
  }, [activeTab, allLessons, token]);

  // Reload progress when a quiz is submitted to update the progress bar
  useEffect(() => {
    if (!quizResult || !token || allLessons.length === 0) return;

    const headers = { Authorization: `Bearer ${token}` };
    loadProgressData(headers);
  }, [quizResult, token, allLessons]);

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
    <div className="min-h-screen bg-[#171717] p-0">
      <div className="min-h-screen overflow-hidden bg-[#ECEEF2] shadow-2xl ring-1 ring-black/10">
        <header className="flex items-center justify-between bg-[#032A56] px-4 py-3 text-white md:px-6">
          <Link to="/dashboard" className="flex items-center hover:opacity-80 transition">
            <img src={logo} alt="Kompi-Cyber" className="h-10" />
          </Link>

          <div className="rounded-full bg-[#012149] p-1">
            {["learn", "practice", "progress"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "practice") {
                      setPracticeView("list");
                    }
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition md:px-5 ${
                    isActive
                      ? "bg-amber-400 text-slate-900"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-xs font-medium text-blue-100 hover:text-white"
            >
              Dashboard
            </Link>
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
                  {allLessons.length} lessons across {groupedModules.length}{" "}
                  modules
                </p>
              </div>
            </div>

            <div className="px-0 py-2">
              {groupedModules.map((module) => (
                <div
                  key={module.module_id}
                  className="border-b border-white/10"
                >
                  <button
                    onClick={() => toggleModule(Number(module.module_id))}
                    className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-white/5"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-blue-300">
                        Module {module.module_order}
                      </p>
                      <h3 className="text-sm font-semibold text-white">
                        {module.module_title}
                      </h3>
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
                            Number(a.lesson_order || 0) -
                            Number(b.lesson_order || 0),
                        )
                        .map((lesson) => {
                          const isActive =
                            Number(activeLesson?.id) === Number(lesson.id);
                          const isCompleted = completedLessonIds.has(
                            Number(lesson.id),
                          );
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
                                  {isCompleted
                                    ? "V"
                                    : lesson.lesson_order || "-"}
                                </span>
                                <div className="min-w-0">
                                  <p className="line-clamp-2 text-sm font-medium leading-snug">
                                    {lesson.title}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                                    <span>
                                      {estimateReadMinutes(lesson.content_md)}{" "}
                                      min
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-slate-500" />
                                    <span>
                                      {isActive
                                        ? "Current"
                                        : isCompleted
                                          ? "Done"
                                          : "Pending"}
                                    </span>
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
                <p className="px-5 py-4 text-xs text-slate-300">
                  No lessons available yet.
                </p>
              )}
            </div>
          </aside>

          <main className="relative flex-1 overflow-y-auto bg-[#ECEEF2]">
            <div className="w-full px-5 pb-28 pt-8 md:px-10">
              <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                  Modules
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {groupedModules.length} modules • {allLessons.length} lessons
                </p>

                <div className="mt-3 space-y-2">
                  {groupedModules.map((module) => {
                    const moduleId = Number(module.module_id);
                    const isOpen = expandedModules[moduleId];

                    return (
                      <div
                        key={module.module_id}
                        className="overflow-hidden rounded-lg border border-slate-200"
                      >
                        <button
                          onClick={() => toggleModule(moduleId)}
                          className="flex w-full items-center justify-between bg-slate-50 px-3 py-2 text-left"
                        >
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                              Module {module.module_order}
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {module.module_title}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            {isOpen ? "Hide" : "Show"}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="divide-y divide-slate-100 bg-white">
                            {[...module.lessons]
                              .sort(
                                (a, b) =>
                                  Number(a.lesson_order || 0) -
                                  Number(b.lesson_order || 0),
                              )
                              .map((lesson) => {
                                const isActive =
                                  Number(activeLesson?.id) ===
                                  Number(lesson.id);
                                return (
                                  <button
                                    key={lesson.id}
                                    onClick={() => openLesson(lesson.id)}
                                    className={`w-full px-3 py-2 text-left text-sm transition ${
                                      isActive
                                        ? "bg-blue-50 font-semibold text-blue-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    Lesson {lesson.lesson_order || "-"}:{" "}
                                    {lesson.title}
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {groupedModules.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No modules available.
                    </p>
                  )}
                </div>
              </section>

              <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                {activeTab === "learn" && (
                  <>
                    Home &gt; Module {activeLesson?.module_order || "-"} &gt;
                    Lesson {activeLesson?.lesson_order || "-"}
                  </>
                )}
                {activeTab === "practice" && (
                  <>
                    Home &gt; Practice &gt; Lesson{" "}
                    {activeLesson?.lesson_order || "-"}
                  </>
                )}
                {activeTab === "progress" && <>Home &gt; Practice Progress</>}
              </div>

              {activeTab === "learn" && (
                <>
                  <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">
                        All Modules
                      </h2>
                      <p className="text-xs text-slate-500">
                        {groupedModules.length} modules • {allLessons.length}{" "}
                        lessons
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {groupedModules.map((module) => {
                        const moduleId = Number(module.module_id);
                        const isCurrent =
                          Number(activeLesson?.module_id) === moduleId;
                        const doneCount = module.lessons.filter((lesson) =>
                          completedLessonIds.has(Number(lesson.id)),
                        ).length;

                        return (
                          <button
                            key={module.module_id}
                            onClick={() => {
                              toggleModule(moduleId);
                              const firstLesson = [...module.lessons].sort(
                                (a, b) =>
                                  Number(a.lesson_order || 0) -
                                  Number(b.lesson_order || 0),
                              )[0];
                              if (firstLesson) openLesson(firstLesson.id);
                            }}
                            className={`rounded-xl border px-4 py-3 text-left transition ${
                              isCurrent
                                ? "border-blue-200 bg-blue-50"
                                : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                            }`}
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                              Module {module.module_order}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {module.module_title}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              {module.lessons.length} lessons • {doneCount}{" "}
                              completed
                            </p>
                          </button>
                        );
                      })}

                      {groupedModules.length === 0 && (
                        <p className="text-sm text-slate-500">
                          No modules available for this course.
                        </p>
                      )}
                    </div>
                  </section>

                  <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                    {activeLesson?.title || "Select a lesson"}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center gap-5 border-b border-slate-300 pb-5 text-sm text-slate-500">
                    <span>
                      {estimateReadMinutes(activeLesson?.content_md)} min read
                    </span>
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
                </>
              )}

              {activeTab === "practice" && (
                <>
                  {practiceView === "list" ? (
                    <>
                      <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                        Practice &amp; Assessments
                      </h1>

                      <div className="mt-2 text-sm text-slate-500">
                        Access quizzes and tests for each course module.
                      </div>

                      <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-xs text-slate-500">
                            Available Now
                          </p>
                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            {practiceStats.available}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-amber-50 px-4 py-4">
                          <p className="text-xs text-slate-500">Upcoming Due</p>
                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            {practiceStats.upcoming}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-emerald-50 px-4 py-4">
                          <p className="text-xs text-slate-500">Completed</p>
                          <p className="mt-1 text-2xl font-bold text-slate-900">
                            {practiceStats.completed}/{practiceItems.length}
                          </p>
                        </div>
                      </div>

                      {practiceListLoading && (
                        <div className="mt-8 rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
                          Loading practice assessments...
                        </div>
                      )}

                      {practiceListError && (
                        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                          {practiceListError}
                        </div>
                      )}

                      {!practiceListLoading && !practiceListError && (
                        <div className="mt-6 space-y-3">
                          {practiceItems.map((item) => {
                            const score = Number(item.attempt?.score || 0);
                            const isDone = !!item.attempt;

                            return (
                              <div
                                key={item.lessonId}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                              >
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                    Module {item.moduleOrder}
                                  </p>
                                  <h3 className="text-base font-bold text-slate-900">
                                    Quiz: {item.lessonTitle}
                                  </h3>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {item.durationMin} min •{" "}
                                    {item.questionCount} questions
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  {isDone && (
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-slate-900">
                                        {score}%
                                      </p>
                                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                        Score
                                      </p>
                                    </div>
                                  )}

                                  <button
                                    onClick={async () => {
                                      await openLesson(item.lessonId);
                                      setPracticeView("quiz");
                                    }}
                                    className="rounded-lg bg-[#0A4D98] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#083f7c]"
                                  >
                                    {isDone ? "Review" : "Start Now"}
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {practiceItems.length === 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
                              No practice quizzes available for this course yet.
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <button
                          onClick={() => setPracticeView("list")}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Back to Assessments
                        </button>
                      </div>

                      <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                        Practice: {activeLesson?.title || "Select a lesson"}
                      </h1>

                      <div className="mt-4 border-b border-slate-300 pb-5 text-sm text-slate-500">
                        Answer all questions, then submit to record your score
                        in Progress.
                      </div>

                      {quizResult && (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
                          Latest score:{" "}
                          <span className="font-bold">{quizResult.score}%</span>{" "}
                          ({quizResult.correctCount}/{quizResult.totalQuestions}{" "}
                          correct), attempt #{quizResult.attemptNo}
                        </div>
                      )}

                      {quizLoading && (
                        <div className="mt-8 rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
                          Loading practice questions...
                        </div>
                      )}

                      {quizError && (
                        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                          {quizError}
                        </div>
                      )}

                      {!quizLoading && !quizError && (
                        <div className="mt-8 space-y-5">
                          {quizQuestions.map((question, index) => (
                            <div
                              key={question.id}
                              className="rounded-2xl bg-white p-6 shadow-sm"
                            >
                              <h2 className="text-lg font-bold text-slate-900">
                                Q{index + 1}. {question.question_text}
                              </h2>
                              <div className="mt-4 space-y-3">
                                {(question.options || []).map((option) => (
                                  <label
                                    key={option.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                                      Number(selectedAnswers[question.id]) ===
                                      Number(option.id)
                                        ? "border-cadtBlue bg-blue-50 text-cadtNavy"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      checked={
                                        Number(selectedAnswers[question.id]) ===
                                        Number(option.id)
                                      }
                                      onChange={() =>
                                        handleAnswerChange(
                                          question.id,
                                          option.id,
                                        )
                                      }
                                      className="h-4 w-4"
                                    />
                                    <span>{option.option_text}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}

                          {quizQuestions.length > 0 && (
                            <button
                              onClick={handleSubmitPractice}
                              disabled={submittingQuiz}
                              className="rounded-lg bg-[#0A4D98] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#083f7c] disabled:opacity-60"
                            >
                              {submittingQuiz
                                ? "Submitting..."
                                : "Submit Practice"}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {activeTab === "progress" && (
                <>
                  <h1 className="max-w-4xl text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
                    Practice Progress
                  </h1>

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-cadtLine bg-white p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Attempts
                      </p>
                      <p className="mt-2 text-3xl font-bold text-cadtNavy">
                        {practiceHistory.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-cadtLine bg-white p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Average Score
                      </p>
                      <p className="mt-2 text-3xl font-bold text-cadtNavy">
                        {averagePracticeScore}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-cadtLine bg-white p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Best Score
                      </p>
                      <p className="mt-2 text-3xl font-bold text-cadtNavy">
                        {highestPracticeScore}%
                      </p>
                    </div>
                  </div>

                  {progressLoading && (
                    <div className="mt-8 rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
                      Loading practice history...
                    </div>
                  )}

                  {progressError && (
                    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                      {progressError}
                    </div>
                  )}

                  {!progressLoading && !progressError && (
                    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Lesson
                              </th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Module
                              </th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Attempt
                              </th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Score
                              </th>
                              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                                Submitted
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {practiceHistory.map((row) => (
                              <tr key={row.lessonId}>
                                <td className="px-4 py-3 font-medium text-slate-800">
                                  {row.lessonTitle}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  {row.moduleTitle || "-"}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                  #{row.attemptNo}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="rounded-md bg-blue-50 px-2 py-1 font-semibold text-cadtBlue">
                                    {row.score}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                  {row.submittedAt
                                    ? new Date(row.submittedAt).toLocaleString()
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {practiceHistory.length === 0 && (
                        <p className="px-4 py-6 text-center text-slate-500">
                          No practice records yet. Complete a practice quiz to
                          see progress here.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-8">
                    <CertificateSection
                      courseId={courseId}
                      courseName={course?.title}
                      token={token}
                    />
                  </div>
                </>
              )}
            </div>

            {activeTab === "learn" && (
              <div className="fixed bottom-6 left-1/2 z-20 w-[calc(100%-2rem)] max-w-none -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur lg:w-[calc(100%-22rem)]">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => openLessonByOffset(-1)}
                    disabled={activeLessonIndex <= 0}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="hidden min-w-0 flex-1 px-2 md:block">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Up next
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-700">
                      {allLessons[activeLessonIndex + 1]?.title ||
                        "You reached the last lesson"}
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
                    {allLessons[activeLessonIndex + 1]
                      ? "Complete and Continue"
                      : "Back to Dashboard"}
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
