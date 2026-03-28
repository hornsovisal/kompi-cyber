import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useInstructorAPI } from '../../hooks/useInstructorAPI';

export default function QuizForm({ lessonId, onSuccess, onCancel, courseId, lessons }) {
  const { createQuiz, updateQuiz, loading, error, clearError } = useInstructorAPI();
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      options: [
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(lessonId || '');

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, newText) => {
    const updated = [...questions];
    updated[index].question_text = newText;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, newText) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].option_text = newText;
    setQuestions(updated);
  };

  const handleCorrectChange = (qIndex, oIndex) => {
    const updated = [...questions];
    // Ensure only one correct answer per question
    updated[qIndex].options.forEach((opt, i) => {
      opt.is_correct = i === oIndex;
    });
    setQuestions(updated);
  };

  const validateForm = () => {
    for (const [qIdx, q] of questions.entries()) {
      if (!q.question_text.trim()) {
        alert(`Question ${qIdx + 1} text is required`);
        return false;
      }

      const filledOptions = q.options.filter(opt => opt.option_text.trim());
      if (filledOptions.length < 2) {
        alert(`Question ${qIdx + 1} must have at least 2 options`);
        return false;
      }

      if (!q.options.some(opt => opt.is_correct)) {
        alert(`Question ${qIdx + 1} must have a correct answer selected`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!selectedLesson) {
      alert('Please select a lesson');
      return;
    }

    setSubmitting(true);
    try {
      const cleanedQuestions = questions.map(q => ({
        question_text: q.question_text.trim(),
        options: q.options
          .filter(opt => opt.option_text.trim())
          .map(opt => ({
            option_text: opt.option_text.trim(),
            is_correct: opt.is_correct,
          })),
      }));

      if (lessonId) {
        await updateQuiz(selectedLesson, cleanedQuestions);
      } else {
        await createQuiz(selectedLesson, cleanedQuestions);
      }

      setSuccess('Quiz saved successfully!');
      setTimeout(() => {
        setSuccess('');
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Error saving quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {lessonId ? 'Edit Quiz' : 'Create Quiz'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700"
        >
          <X size={24} />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="text-red-600 text-sm font-medium mt-2 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-green-900">Success</h3>
            <p className="text-green-700 text-sm mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Lesson Selection */}
      {!lessonId && lessons && lessons.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Select Lesson
          </label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a lesson...</option>
            {lessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8 mb-6">
        {questions.map((question, qIdx) => (
          <div key={qIdx} className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            {/* Question Header */}
            <div className="flex justify-between items-start mb-4">
              <label className="block text-sm font-semibold text-slate-900">
                Question {qIdx + 1}
              </label>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIdx)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {/* Question Text */}
            <textarea
              value={question.question_text}
              onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
              placeholder="Enter question text..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 resize-none"
              rows="3"
            />

            {/* Options */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Answer Options
              </p>
              {question.options.map((option, oIdx) => (
                <div key={oIdx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={option.is_correct}
                    onChange={() => handleCorrectChange(qIdx, oIdx)}
                    className="w-5 h-5 text-green-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                    placeholder={`Option ${oIdx + 1}`}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                    {option.is_correct ? 'Correct' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        type="button"
        onClick={handleAddQuestion}
        className="w-full mb-8 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:text-slate-700 hover:border-slate-400 transition-colors font-medium"
      >
        <Plus size={20} />
        Add Question
      </button>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          <Save size={18} />
          {submitting ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
    </form>
  );
}
