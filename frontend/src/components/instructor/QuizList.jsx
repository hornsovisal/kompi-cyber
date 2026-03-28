import { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, AlertCircle, Loader } from 'lucide-react';
import { useInstructorAPI } from '../../hooks/useInstructorAPI';

export default function QuizList({ courseId, onEdit, lessons = [] }) {
  const { fetchCourseQuizzes, deleteQuiz, loading, error } = useInstructorAPI();
  const [quizzes, setQuizzes] = useState([]);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, [courseId]);

  const loadQuizzes = async () => {
    try {
      const data = await fetchCourseQuizzes(courseId);
      setQuizzes(data);
    } catch (err) {
      console.error('Error loading quizzes:', err);
    }
  };

  const getLessonName = (lessonId) => {
    return lessons.find(l => l.id === lessonId)?.title || `Lesson ${lessonId}`;
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    setDeleting(quizId);
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      console.error('Error deleting quiz:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Quizzes</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
        <Eye size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-600 text-lg font-medium">No quizzes yet</p>
        <p className="text-slate-500 text-sm mt-2">
          Create your first quiz to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map(quiz => (
        <div
          key={quiz.id}
          className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Quiz Header */}
          <button
            onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-slate-900">
                {getLessonName(quiz.lesson_id)}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {quiz.question_count || 0} questions
              </p>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {quiz.attempts_count || 0} attempts
              </span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                expandedQuiz === quiz.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {expandedQuiz === quiz.id ? '▼' : '▶'}
              </span>
            </div>
          </button>

          {/* Expanded Content */}
          {expandedQuiz === quiz.id && (
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              {/* Questions Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Questions Preview</h4>
                <div className="space-y-3">
                  {quiz.questions?.slice(0, 3).map((question, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-slate-200">
                      <p className="text-sm font-medium text-slate-900">
                        {idx + 1}. {question.question_text}
                      </p>
                      <div className="mt-2 text-xs text-slate-600">
                        {question.options?.length || 0} options available
                      </div>
                    </div>
                  ))}
                  {quiz.questions?.length > 3 && (
                    <p className="text-sm text-slate-600">
                      +{quiz.questions.length - 3} more questions
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              {quiz.stats && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <p className="text-xs text-slate-600">Avg Score</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {quiz.stats.avg_score?.toFixed(1) || 'N/A'}%
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <p className="text-xs text-slate-600">Completed</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {quiz.stats.completed_count || 0}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200">
                    <p className="text-xs text-slate-600">Pass Rate</p>
                    <p className="text-lg font-bold text-purple-600 mt-1">
                      {quiz.stats.pass_rate?.toFixed(0) || 'N/A'}%
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => onEdit?.(quiz)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  disabled={deleting === quiz.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:bg-red-100 disabled:opacity-50 rounded-lg font-medium transition-colors"
                >
                  <Trash2 size={18} />
                  {deleting === quiz.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
