import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers3,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  BookOpen,
  Users,
  Clock,
} from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function CoordinatorCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: "",
  });

  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    level: "beginner",
    duration: 0,
  });
  const [editingCourse, setEditingCourse] = useState(false);

  useEffect(() => {
    console.log("CoordinatorCourseDetail mounted with courseId:", courseId);
    fetchCourseAndModules();
  }, [courseId]);

  const fetchCourseAndModules = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      console.log("Fetching course detail for:", courseId);
      console.log("API_BASE:", API_BASE);
      console.log("Full URL:", `${API_BASE}/api/instructor/courses/${courseId}`);

      const [courseRes, modulesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/instructor/courses/${courseId}`, {
          headers,
        }),
        axios.get(`${API_BASE}/api/courses/${courseId}/modules`, { headers }),
      ]);

      console.log("Course response:", courseRes.data);
      console.log("Modules response:", modulesRes.data);

      const courseData = courseRes.data.data;
      setCourse(courseData);
      setCourseFormData({
        title: courseData.title || "",
        description: courseData.description || "",
        level: courseData.level || "beginner",
        duration: courseData.duration || 0,
      });

      setModules(modulesRes.data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching course details:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!courseFormData.title.trim()) {
      setError("Course title is required");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/instructor/courses/${courseId}`,
        courseFormData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setCourse(response.data.data);
      setEditingCourse(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course");
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!moduleFormData.title.trim()) {
      setError("Module title is required");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/courses/${courseId}/modules`,
        moduleFormData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setModules([...modules, response.data.data]);
      setModuleFormData({ title: "", description: "" });
      setShowModuleForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create module");
    }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    if (!editingModule || !moduleFormData.title.trim()) {
      setError("Module title is required");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/courses/${courseId}/modules/${editingModule.id}`,
        moduleFormData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setModules(
        modules.map((m) =>
          m.id === editingModule.id ? response.data.data : m,
        ),
      );
      setEditingModule(null);
      setModuleFormData({ title: "", description: "" });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update module");
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Delete this module and all its lessons?")) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(
        `${API_BASE}/api/courses/${courseId}/modules/${moduleId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setModules(modules.filter((m) => m.id !== moduleId));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete module");
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setModuleFormData({
      title: module.title || "",
      description: module.description || "",
    });
    setShowModuleForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 mt-4">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle size={48} className="text-red-600 mb-4" />
        <p className="text-slate-600 mb-4">Course not found</p>
        <button
          onClick={() => navigate("/coordinator/courses")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/coordinator/courses")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              {editingCourse ? (
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      title: e.target.value,
                    })
                  }
                  className="text-3xl font-bold text-slate-900 px-3 py-1 border border-slate-300 rounded w-full"
                />
              ) : (
                <h1 className="text-3xl font-bold text-slate-900">
                  {course.title}
                </h1>
              )}
            </div>
            <button
              onClick={() => setEditingCourse(!editingCourse)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit2 size={18} />
              {editingCourse ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">Level</p>
              <p className="font-bold text-slate-900 capitalize">
                {course.level}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <Clock size={14} /> Duration
              </p>
              <p className="font-bold text-slate-900">{course.duration} hrs</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <Layers3 size={14} /> Modules
              </p>
              <p className="font-bold text-slate-900">{modules.length}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <Users size={14} /> Students
              </p>
              <p className="font-bold text-slate-900">
                {course.enrollmentCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "text-blue-600 border-blue-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "modules"
                ? "text-blue-600 border-blue-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            <Layers3 size={18} /> Modules ({modules.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            {editingCourse ? (
              <form onSubmit={handleUpdateCourse} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={courseFormData.description}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        description: e.target.value,
                      })
                    }
                    rows="6"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Level
                    </label>
                    <select
                      value={courseFormData.level}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          level: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={courseFormData.duration}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          duration: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    Description
                  </h3>
                  <p className="text-slate-900">
                    {course.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Level</p>
                    <p className="font-bold text-slate-900 capitalize">
                      {course.level}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Duration</p>
                    <p className="font-bold text-slate-900">
                      {course.duration} hours
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <p className="font-bold text-slate-900">
                      {course.status ? "Published" : "Draft"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="space-y-6">
            {/* Add Module Button/Form */}
            {!showModuleForm && !editingModule && (
              <button
                onClick={() => setShowModuleForm(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-lg"
              >
                <Plus size={24} />
                Add New Module
              </button>
            )}

            {/* Module Form */}
            {(showModuleForm || editingModule) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  {editingModule ? "Edit Module" : "Create New Module"}
                </h3>
                <form
                  onSubmit={
                    editingModule ? handleUpdateModule : handleCreateModule
                  }
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Module Title *
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., Module 1: Introduction to React"
                      value={moduleFormData.title}
                      onChange={(e) =>
                        setModuleFormData({
                          ...moduleFormData,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="What will students learn in this module?"
                      value={moduleFormData.description}
                      onChange={(e) =>
                        setModuleFormData({
                          ...moduleFormData,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium"
                    >
                      {editingModule ? "Update Module" : "Create Module"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModuleForm(false);
                        setEditingModule(null);
                        setModuleFormData({ title: "", description: "" });
                      }}
                      className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 py-2 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modules List */}
            {modules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 mb-4">No modules yet</p>
                <p className="text-sm text-slate-500">
                  Click "Add New Module" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((module, idx) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                            {idx + 1}
                          </span>
                          <h4 className="text-lg font-bold text-slate-900">
                            {module.title}
                          </h4>
                        </div>
                        {module.description && (
                          <p className="text-slate-600 ml-11">
                            {module.description}
                          </p>
                        )}
                        <p className="text-sm text-slate-500 mt-2 ml-11">
                          {module.lessonCount || 0} lessons
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditModule(module)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                          title="Edit module"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Delete module"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
