// INSTRUCTOR DASHBOARD - CODE SNIPPETS & USAGE EXAMPLES
// Copy and adapt these snippets for your specific needs

// ============================================
// 1. BASIC USAGE IN YOUR PAGES
// ============================================

// Example 1: Using the hook to fetch courses
import { useInstructorAPI } from '../hooks/useInstructorAPI';
import { useEffect, useState } from 'react';

function MyComponent() {
  const [courses, setCourses] = useState([]);
  const { fetchInstructorCourses, loading, error } = useInstructorAPI();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchInstructorCourses();
        setCourses(data);
      } catch (err) {
        console.error('Error loading courses:', err);
      }
    };

    loadCourses();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  );
}

// ============================================
// 2. QUIZ CREATION WITH VALIDATION
// ============================================

import { useInstructorAPI } from '../hooks/useInstructorAPI';

function QuizCreationExample() {
  const { createQuiz, loading } = useInstructorAPI();
  const [questions, setQuestions] = useState([
    {
      question_text: 'What is cybersecurity?',
      options: [
        { option_text: 'Protection of computer systems', is_correct: true },
        { option_text: 'Network management', is_correct: false },
        { option_text: 'Data storage', is_correct: false },
        { option_text: 'Password creation', is_correct: false },
      ],
    },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const isValid = questions.every(q => {
      if (!q.question_text.trim()) return false;
      if (q.options.filter(o => o.option_text.trim()).length < 2) return false;
      if (!q.options.some(o => o.is_correct)) return false;
      return true;
    });

    if (!isValid) {
      alert('Please ensure all questions have text, at least 2 options, and 1 correct answer');
      return;
    }

    try {
      await createQuiz(5, questions); // 5 is the lesson ID
      alert('Quiz created successfully!');
    } catch (err) {
      alert('Error creating quiz: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Create Quiz'}
      </button>
    </form>
  );
}

// ============================================
// 3. ANALYTICS FETCHING WITH ERROR HANDLING
// ============================================

import { useInstructorAPI } from '../hooks/useInstructorAPI';

function AnalyticsExample() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const { fetchAnalytics, fetchStudentList, error } = useInstructorAPI();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsData, studentData] = await Promise.all([
          fetchAnalytics(1), // courseId 1
          fetchStudentList(1),
        ]);

        setAnalytics(analyticsData);
        setStudents(studentData);
      } catch (err) {
        console.error('Error loading analytics:', err);
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Analytics</h2>
      <p>Average Score: {analytics?.avg_score}%</p>
      <p>Pass Rate: {analytics?.pass_rate}%</p>
      <p>Total Students: {students.length}</p>
    </div>
  );
}

// ============================================
// 4. ROLE-BASED DASHBOARD ROUTING
// ============================================

import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardRouter() {
  const navigate = useNavigate();
  const { isInstructor, isStudent } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const isInstr = await isInstructor();
      const isStud = await isStudent();

      if (isInstr) {
        navigate('/instructor/dashboard');
      } else if (isStud) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }

      setLoading(false);
    };

    checkRole();
  }, []);

  return loading ? <div>Checking access...</div> : null;
}

// ============================================
// 5. QUIZ FORM COMPONENT USAGE
// ============================================

import QuizForm from '../components/instructor/QuizForm';

function MyPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      {showForm ? (
        <QuizForm
          courseId={1}
          lessons={[
            { id: 1, title: 'Introduction' },
            { id: 2, title: 'Basic Concepts' },
          ]}
          onSuccess={() => {
            setShowForm(false);
            alert('Quiz saved!');
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button onClick={() => setShowForm(true)}>Create Quiz</button>
      )}
    </div>
  );
}

// ============================================
// 6. QUIZ LIST WITH EDITING
// ============================================

import QuizList from '../components/instructor/QuizList';
import { useState } from 'react';

function QuizManagement() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingMode, setEditingMode] = useState(false);

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setEditingMode(true);
  };

  return (
    <div>
      {editingMode ? (
        <QuizForm
          lessonId={selectedQuiz.lesson_id}
          courseId={1}
          lessons={[]}
          onSuccess={() => setEditingMode(false)}
          onCancel={() => setEditingMode(false)}
        />
      ) : (
        <QuizList
          courseId={1}
          lessons={[]}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}

// ============================================
// 7. ANALYTICS PANEL INTEGRATION
// ============================================

import AnalyticsPanel from '../components/instructor/AnalyticsPanel';

function AnalyticsView() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Course Analytics</h1>
      <AnalyticsPanel
        courseId={1}
        lessons={[
          { id: 1, title: 'Lesson 1' },
          { id: 2, title: 'Lesson 2' },
        ]}
      />
    </div>
  );
}

// ============================================
// 8. CUSTOM API CALL PATTERN
// ============================================

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchQuizWithRetry(lessonId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE}/api/quizzes/lesson/${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// ============================================
// 9. FORM STATE MANAGEMENT
// ============================================

function AdvancedQuizForm() {
  const [formState, setFormState] = useState({
    questions: [],
    selectedLesson: null,
    isSubmitting: false,
    errors: {},
  });

  const addQuestion = () => {
    setFormState(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
          ],
        },
      ],
    }));
  };

  const updateQuestion = (index, text) => {
    setFormState(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[index].question_text = text;
      return { ...prev, questions: newQuestions };
    });
  };

  const validateForm = () => {
    const errors = {};

    formState.questions.forEach((q, idx) => {
      if (!q.question_text.trim()) {
        errors[`question_${idx}`] = 'Question text is required';
      }
      if (!q.options.some(o => o.is_correct)) {
        errors[`correct_${idx}`] = 'Select a correct answer';
      }
    });

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormState(prev => ({
        ...prev,
        errors: validateForm(),
      }));
      return;
    }

    // Submit logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.entries(formState.errors).map(([key, error]) => (
        <div key={key} className="text-red-600 text-sm">{error}</div>
      ))}
      <button type="submit" disabled={formState.isSubmitting}>
        Submit
      </button>
    </form>
  );
}

// ============================================
// 10. PERFORMANCE OPTIMIZATION
// ============================================

import { useMemo, useCallback } from 'react';

function OptimizedQuizList({ quizzes, onSelect }) {
  // Memoize filtered results
  const sortedQuizzes = useMemo(() => {
    return [...quizzes].sort((a, b) => b.attempts_count - a.attempts_count);
  }, [quizzes]);

  // Memoize callback to prevent re-renders
  const handleSelect = useCallback(
    (quiz) => {
      onSelect(quiz);
    },
    [onSelect]
  );

  return (
    <div>
      {sortedQuizzes.map(quiz => (
        <div key={quiz.id} onClick={() => handleSelect(quiz)}>
          {quiz.lesson_id}
        </div>
      ))}
    </div>
  );
}

// Export all examples for reference
export {
  MyComponent,
  QuizCreationExample,
  AnalyticsExample,
  DashboardRouter,
  MyPage,
  QuizManagement,
  AnalyticsView,
  fetchQuizWithRetry,
  AdvancedQuizForm,
  OptimizedQuizList,
};
