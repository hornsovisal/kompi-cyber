import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle,
  X,
  AlertCircle,
  BookOpen,
  FileQuestion,
} from "lucide-react";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState(lessonId || "");
  const [questions, setQuestions] = useState([
    {
      question_text: "",
      options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedLesson) {
      fetchExistingQuiz(selectedLesson);
    }
  }, [selectedLesson]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/instructor/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.data || []);
    } catch (err) {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/lessons/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(response.data.lessons || []);
    } catch (err) {
      setError("Failed to load lessons");
    }
  };

  const fetchExistingQuiz = async (lessonId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/quizzes/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data && response.data.data.length > 0) {
        // Transform existing quiz data to our format
        const existingQuestions = response.data.data.map((q) => ({
          question_text: q.question_text,
          options: q.options.map((opt) => ({
            option_text: opt.option_text,
            is_correct: false, // We don't expose correct answers in the API
          })),
        }));
        setQuestions(existingQuestions);
      }
    } catch (err) {
      // No existing quiz, that's fine
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        options: [
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
          { option_text: "", is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex][field] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push({ option_text: "", is_correct: false });
    setQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    if (questions[questionIndex].options.length > 2) {
      const updated = [...questions];
      updated[questionIndex].options = updated[questionIndex].options.filter(
        (_, i) => i !== optionIndex
      );
      setQuestions(updated);
    }
  };

  const validateQuiz = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} cannot be empty`);
        return false;
      }

      const validOptions = q.options.filter((opt) => opt.option_text.trim());
      if (validOptions.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        return false;
      }

      const correctOptions = q.options.filter((opt) => opt.is_correct);
      if (correctOptions.length !== 1) {
        setError(`Question ${i + 1} must have exactly one correct answer`);
        return false;
      }
    }
    return true;
  };

  const saveQuiz = async () => {
    if (!selectedLesson) {
      setError("Please select a lesson first");
      return;
    }

    if (!validateQuiz()) return;

    try {
      setSaving(true);
      setError("");
      const token = localStorage.getItem("token");

      await axios.post(`/api/quizzes/lesson/${selectedLesson}`, {
        lessonId: selectedLesson,
        questions,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Quiz saved successfully!");
      setTimeout(() => {
        navigate("/instructor/manage-quizzes");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/instructor/manage-quizzes")}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Quizzes
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
                <p className="text-gray-600">Build a quiz for your lesson</p>
              </div>
            </div>
            <button
              onClick={saveQuiz}
              disabled={saving || !selectedLesson}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course and Lesson Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Lesson</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedLesson("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                disabled={!selectedCourse}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select a lesson...</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.module_title} - {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        {selectedLesson && (
          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {qIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                    placeholder="Enter your question here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Answer Options
                    </label>
                    <button
                      onClick={() => addOption(qIndex)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Option
                    </button>
                  </div>

                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={option.is_correct}
                        onChange={() => {
                          // Set this option as correct and others as incorrect
                          const updated = [...questions];
                          updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
                            ...opt,
                            is_correct: i === oIndex,
                          }));
                          setQuestions(updated);
                        }}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => updateOption(qIndex, oIndex, "option_text", e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <button
                onClick={addQuestion}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">{success}</span>
          </div>
        )}
      </div>
    </div>
  );
}
