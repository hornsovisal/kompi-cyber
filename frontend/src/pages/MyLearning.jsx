import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyLearning() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/enrollments/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEnrollments(data.enrollments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching enrollments:", err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1E293B]">
        <p className="text-white">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-[#1E293B]">
        <h1 className="text-white font-bold text-lg">Kompi Cyber</h1>
        <button
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="text-[#FE9A00] border border-[#FE9A00] px-3 py-1 rounded-lg text-sm hover:bg-[#FE9A00] hover:text-black transition"
        >
          Logout
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-6">My Learning</h1>

        {enrollments.length === 0 ? (
          <p className="text-[#90A1B9]">You haven’t enrolled in any courses yet.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {enrollments.map((course) => (
              <div
                key={course.id}
                className="bg-[#0A0F1A] rounded-xl border border-gray-800 overflow-hidden shadow-lg p-6"
              >
                <h3 className="text-white font-semibold mb-2">{course.title}</h3>
                <p className="text-[#90A1B9] text-sm mb-4">{course.desc}</p>
                <span className="text-xs text-gray-400 block mb-2">
                  Level: {course.level} • Lessons: {course.lessons_count}
                </span>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    try {
                     
                      const data = await res.json();
                      alert(data.message);
                      // Refresh list
                      setEnrollments((prev) =>
                        prev.filter((c) => c.id !== course.id)
                      );
                    } catch (err) {
                      console.error(err);
                      alert("Error unenrolling from course");
                    }
                  }}
                  className="w-full py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
                >
                  Unenroll
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
