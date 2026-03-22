import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Course information mapping
  const courseDetails = {
    'network-security': {
      title: 'Network Security',
      description: 'Learn about network layers, firewalls, and hardening techniques',
      modules: 4,
      icon: '🌐',
      color: 'blue'
    },
    'web-security': {
      title: 'Web Security',
      description: 'Master web architecture, OWASP, secure coding, and prevent SQL/XSS attacks',
      modules: 4,
      icon: '💻',
      color: 'green'
    },
    'incident-response': {
      title: 'Incident Response',
      description: 'Learn preparation, containment, evidence collection, and response tools',
      modules: 4,
      icon: '🚨',
      color: 'red'
    },
    'intro-to-linux-course': {
      title: 'Introduction to Linux',
      description: 'Master Linux fundamentals, file systems, users, and basic security',
      modules: 3,
      icon: '🐧',
      color: 'orange'
    },
    'intro-to-cyber-course': {
      title: 'Introduction to Cybersecurity',
      description: 'Foundation of cybersecurity, threats, CIA triad, and cyber hygiene',
      modules: 5,
      icon: '🛡️',
      color: 'purple'
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('lecturerToken');
    if (!token) {
      navigate('/lecturer/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/lecturer/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLecturer(response.data.lecturer);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        localStorage.removeItem('lecturerToken');
        localStorage.removeItem('lecturerData');
        navigate('/lecturer/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('lecturerToken');
    localStorage.removeItem('lecturerData');
    navigate('/lecturer/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-2 text-blue-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!lecturer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                👨‍🏫
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-slate-800">Lecturer Portal</h1>
                <p className="text-sm text-slate-600">Welcome back, {lecturer.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lecturer Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Lecturer Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
              <p className="text-lg font-semibold text-slate-800">{lecturer.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <p className="text-lg font-semibold text-slate-800">{lecturer.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
              <p className="text-lg font-semibold text-slate-800">{lecturer.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Employee ID</label>
              <p className="text-lg font-semibold text-slate-800">{lecturer.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email Verified</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                lecturer.isVerified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {lecturer.isVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Courses Managed */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Courses You Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lecturer.courses && lecturer.courses.map(courseId => {
              const course = courseDetails[courseId];
              if (!course) return null;

              return (
                <div key={courseId} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${course.color}-100`}>
                      {course.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-800">{course.title}</h3>
                      <p className="text-sm text-slate-600">{course.modules} modules</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{course.description}</p>
                  <div className="flex space-x-2">
                    <button className={`flex-1 bg-${course.color}-600 text-white py-2 px-4 rounded-lg hover:bg-${course.color}-700 transition text-sm font-medium`}>
                      Manage Course
                    </button>
                    <button className="px-3 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm">
                      📊
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Course Content</h3>
            <p className="text-slate-600 text-sm mb-4">Update lessons and materials</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
              Edit Content
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Student Progress</h3>
            <p className="text-slate-600 text-sm mb-4">Track enrollment and completion</p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
              View Reports
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Assignments</h3>
            <p className="text-slate-600 text-sm mb-4">Create and grade assignments</p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition">
              Manage Assignments
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Announcements</h3>
            <p className="text-slate-600 text-sm mb-4">Post updates for students</p>
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition">
              Create Announcement
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Lecturer Portal!</h2>
          <p className="text-blue-100 mb-6">
            Manage your courses, track student progress, and create engaging learning experiences.
            Use the tools above to access your teaching resources and student management features.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-semibold">Department:</span> {lecturer.department}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-semibold">Courses:</span> {lecturer.courses?.length || 0}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-semibold">Employee ID:</span> {lecturer.employeeId}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}