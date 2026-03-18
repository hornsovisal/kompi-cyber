import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1E293B]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Courses (IDs 1–5 match your DB table)
  const courses = [
    {
      id: 1,
      title: "Introduction to Cybersecurity",
      desc: "Starter course on threats, CIA triad, and cyber hygiene.",
    },
    {
      id: 2,
      title: "Ethical Hacking Essentials",
      desc: "Introductory ethical hacking methodology and tooling.",
    },
    {
      id: 3,
      title: "Network Security Basics",
      desc: "Learn how to secure networks and detect intrusions.",
    },
    {
      id: 4,
      title: "Web Application Security",
      desc: "Introduction to web app vulnerabilities and OWASP top 10.",
    },
    {
      id: 5,
      title: "Incident Response & Forensics",
      desc: "Handle security incidents and perform digital forensics.",
    },
  ];

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: courseId }),
      });

      const data = await res.json();
      alert(data.message);

      // If enrolled successfully or already enrolled, redirect to MyLearning
      if (data.enrolled) {
        navigate("/mylearning");
      }
    } catch (err) {
      console.error(err);
      alert("Error enrolling in course");
    }
  };

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
        <h1 className="text-4xl font-bold text-white mb-6">My Learning Path</h1>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-[#0A0F1A] rounded-xl border border-gray-800 overflow-hidden shadow-lg p-6"
            >
              <h3 className="text-white font-semibold mb-2">{course.title}</h3>
              <p className="text-[#90A1B9] text-sm mb-4">{course.desc}</p>
              <button
                onClick={() => handleEnroll(course.id)}
                className="w-full py-2 rounded-lg font-semibold text-white bg-[#FE9A00] hover:bg-[#ffb13b] transition"
              >
                Enroll
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
