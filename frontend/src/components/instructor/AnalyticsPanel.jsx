import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  AlertCircle,
  Loader,
  Download,
} from 'lucide-react';
import { useInstructorAPI } from '../../hooks/useInstructorAPI';

export default function AnalyticsPanel({ courseId, lessons = [] }) {
  const {
    fetchAnalytics,
    fetchStudentList,
    fetchQuizScores,
    loading,
    error,
  } = useInstructorAPI();

  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizScores, setQuizScores] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [courseId]);

  useEffect(() => {
    if (selectedQuiz) {
      loadQuizScores(selectedQuiz);
    }
  }, [selectedQuiz]);

  const loadAnalytics = async () => {
    try {
      const data = await fetchAnalytics(courseId);
      setAnalytics(data);

      const studentsList = await fetchStudentList(courseId);
      setStudents(studentsList);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const loadQuizScores = async (quizId) => {
    try {
      const scores = await fetchQuizScores(quizId);
      setQuizScores(scores);
    } catch (err) {
      console.error('Error loading quiz scores:', err);
    }
  };

  const getLessonName = (lessonId) => {
    return lessons.find(l => l.id === lessonId)?.title || `Lesson ${lessonId}`;
  };

  const downloadReport = () => {
    if (!analytics) return;

    const reportData = {
      timestamp: new Date().toLocaleString(),
      course: analytics.course_name,
      students,
      quizzes: analytics.quizzes || [],
    };

    const csv = generateCSV(reportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${courseId}-${Date.now()}.csv`;
    a.click();
  };

  const generateCSV = (data) => {
    let csv = 'Student Analytics Report\n';
    csv += `Generated: ${data.timestamp}\n`;
    csv += `Course: ${data.course}\n\n`;

    csv += 'Student Performance\n';
    csv += 'Name,Email,Completion Rate,Average Score\n';

    data.students.forEach(student => {
      csv += `"${student.name}","${student.email}",${student.completion_rate || 0}%,${student.avg_score || 0}%\n`;
    });

    return csv;
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
        <button
          onClick={downloadReport}
          disabled={!analytics}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {['overview', 'students', 'quizzes'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              title="Total Students"
              value={analytics.total_students || 0}
              color="blue"
            />
            <StatCard
              icon={BarChart3}
              title="Total Quizzes"
              value={analytics.total_quizzes || 0}
              color="purple"
            />
            <StatCard
              icon={Award}
              title="Avg Quiz Score"
              value={`${(analytics.avg_score || 0).toFixed(1)}%`}
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              title="Pass Rate"
              value={`${(analytics.pass_rate || 0).toFixed(0)}%`}
              color="orange"
            />
          </div>

          {/* Performance Trend */}
          {analytics.trend && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Performance Trend
              </h3>
              <div className="space-y-3">
                {analytics.trend.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 w-20">
                      Week {point.week}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${point.score || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                      {point.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Avg Score
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Completion
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No students enrolled in this course yet.
                    </td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{student.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 text-sm">{student.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {(student.avg_score || 0).toFixed(1)}%
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{
                                width: `${student.completion_rate || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">
                            {student.completion_rate || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            student.completion_rate >= 80
                              ? 'bg-green-100 text-green-800'
                              : student.completion_rate >= 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {student.completion_rate >= 80
                            ? 'On Track'
                            : student.completion_rate >= 50
                            ? 'In Progress'
                            : 'At Risk'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Quiz Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Select Quiz to View Scores
            </label>
            <select
              value={selectedQuiz || ''}
              onChange={(e) => setSelectedQuiz(Number(e.target.value) || null)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a quiz...</option>
              {analytics?.quizzes?.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {getLessonName(quiz.lesson_id)} - {quiz.question_count} questions
                </option>
              ))}
            </select>
          </div>

          {/* Quiz Scores */}
          {selectedQuiz && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Correct Answers
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Completion Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {quizScores.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                          No quiz attempts yet.
                        </td>
                      </tr>
                    ) : (
                      quizScores.map(score => (
                        <tr key={score.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{score.student_name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-bold text-lg ${
                                score.score >= 70
                                  ? 'text-green-600'
                                  : score.score >= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {score.score}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-600">
                              {score.correct_answers}/{score.total_questions}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-slate-600 text-sm">
                              {score.time_spent ? `${Math.round(score.time_spent / 60)}m` : 'N/A'}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`${colors[color]} p-4 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
