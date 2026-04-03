import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Layers3,
  Search,
  Users,
  Edit2,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import CourseModules from "./CourseModules";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function CoordinatorCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseForModules, setSelectedCourseForModules] =
    useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "beginner",
    duration: 0,
    domain_id: 1,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(`${API_BASE}/api/instructor/courses`, {
        headers,
      });
      setCourses(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Course title is required");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        `${API_BASE}/api/instructor/courses`,
        {
          title: formData.title,
          description: formData.description,
          level: formData.level,
          duration: Number(formData.duration),
          domain_id: Number(formData.domain_id),
        },
        { headers },
      );

      setCourses([...courses, response.data.data]);
      setFormData({
        title: "",
        description: "",
        level: "beginner",
        duration: 0,
        domain_id: 1,
      });
      setShowCreateForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse || !formData.title.trim()) {
      setError("Course title is required");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.put(
        `${API_BASE}/api/instructor/courses/${editingCourse.id}`,
        {
          title: formData.title,
          description: formData.description,
          level: formData.level,
          duration: Number(formData.duration),
          domain_id: Number(formData.domain_id),
        },
        { headers },
      );

      setCourses(
        courses.map((course) =>
          course.id === editingCourse.id ? response.data.data : course,
        ),
      );
      setEditingCourse(null);
      setFormData({
        title: "",
        description: "",
        level: "beginner",
        duration: 0,
        domain_id: 1,
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      await axios.delete(`${API_BASE}/api/instructor/courses/${courseId}`, {
        headers,
      });

      setCourses(courses.filter((course) => course.id !== courseId));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      level: course.level || "beginner",
      duration: course.duration || 0,
      domain_id: course.domain_id || 1,
    });
    setShowCreateForm(false);
  };

  const filteredCourses = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return courses;

    return courses.filter((course) =>
      [course.title, course.description].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [courses, query]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Courses</h1>
          <p className="text-slate-600 mt-2">
            Create and manage courses for your programs
          </p>
        </div>
        {!editingCourse && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            New Course
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingCourse) && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingCourse ? "Edit Course" : "Create New Course"}
          </h2>
          <form
            onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Course Title *"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="md:col-span-2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              required
            />
            <textarea
              placeholder="Course Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="md:col-span-2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 h-24"
            />
            <select
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <input
              type="number"
              placeholder="Duration (hours)"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                {editingCourse ? "Update Course" : "Create Course"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCourse(null);
                  setFormData({
                    title: "",
                    description: "",
                    level: "beginner",
                    duration: 0,
                    domain_id: 1,
                  });
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      {!showCreateForm && !editingCourse && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600">
              {courses.length === 0
                ? "No courses yet. Create your first course!"
                : "No courses match your search"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="border border-slate-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  console.log("Course card clicked:", course.id, course.title);
                  navigate(`/coordinator/courses/${course.id}`);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Level:{" "}
                      <span className="font-medium capitalize">
                        {course.level}
                      </span>
                    </p>
                  </div>
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setSelectedCourseForModules(course)}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                      title="Manage modules"
                    >
                      <Layers3 size={16} />
                    </button>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                      title="Edit course"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      title="Delete course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {course.description || "No description"}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-3">
                  <div className="flex items-center gap-1">
                    <Layers3 size={14} />
                    <span>{course.moduleCount || 0} modules</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{course.enrollmentCount || 0} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Modules Modal */}
      {selectedCourseForModules && (
        <CourseModules
          courseId={selectedCourseForModules.id}
          onClose={() => setSelectedCourseForModules(null)}
        />
      )}
    </div>
  );
}
