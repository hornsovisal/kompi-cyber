import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, BookOpen } from "lucide-react";
import axios from "axios";
import InvitationStatusBoard from "./InvitationStatusBoard";
import ManageStudentInvitations from "./ManageStudentInvitations";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationModal, setInvitationModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCourse(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err.response?.data?.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading course details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
          <button
            onClick={() => navigate("/instructor/courses")}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-slate-600">Course not found</div>
          <button
            onClick={() => navigate("/instructor/courses")}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/instructor/courses")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="text-blue-600" size={24} />
                <h1 className="text-3xl font-bold text-slate-900">
                  {course.title}
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {course.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-slate-200">
          <button className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
            Student Invitations
          </button>
        </div>

        {/* Invite Button */}
        <div className="mb-6">
          <button
            onClick={() => setInvitationModal(true)}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            + Invite More Students
          </button>
        </div>

        {/* Invitation Status Board */}
        <InvitationStatusBoard
          courseId={courseId}
          courseTitle={course.title}
          refreshTrigger={refreshTrigger}
        />

        {/* Invitation Modal */}
        <ManageStudentInvitations
          isOpen={invitationModal}
          courseId={courseId}
          courseTitle={course.title}
          onClose={() => setInvitationModal(false)}
          onSuccess={() => {
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      </div>
    </div>
  );
}
