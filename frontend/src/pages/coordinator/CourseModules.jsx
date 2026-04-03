import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, AlertCircle, ChevronDown } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function CourseModules({ courseId, onClose }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/courses/${courseId}/modules`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setModules(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Module title is required");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/courses/${courseId}/modules`,
        {
          title: formData.title,
          description: formData.description || "",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setModules([...modules, response.data.data]);
      setFormData({ title: "", description: "" });
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create module");
    }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    if (!editingModule || !formData.title.trim()) {
      setError("Module title is required");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/api/courses/${courseId}/modules/${editingModule.id}`,
        {
          title: formData.title,
          description: formData.description || "",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setModules(
        modules.map((m) =>
          m.id === editingModule.id ? response.data.data : m,
        ),
      );
      setEditingModule(null);
      setFormData({ title: "", description: "" });
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
    setFormData({
      title: module.title || "",
      description: module.description || "",
    });
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Manage Modules</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
          {(showForm || editingModule) && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">
                {editingModule ? "Edit Module" : "New Module"}
              </h3>
              <form
                onSubmit={
                  editingModule ? handleUpdateModule : handleCreateModule
                }
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Module Title *"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500"
                  required
                />
                <textarea
                  placeholder="Module Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 h-20"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
                  >
                    {editingModule ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingModule(null);
                      setFormData({ title: "", description: "" });
                    }}
                    className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modules List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No modules yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {modules.map((module, idx) => (
                <div
                  key={module.id}
                  className="border border-slate-200 rounded-lg p-4 flex items-start justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900">
                        {module.title}
                      </h4>
                    </div>
                    {module.description && (
                      <p className="text-sm text-slate-600 mt-1">
                        {module.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      {module.lessonCount || 0} lessons
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditModule(module)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showForm && !editingModule && (
          <div className="p-6 border-t border-slate-200">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Module
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
