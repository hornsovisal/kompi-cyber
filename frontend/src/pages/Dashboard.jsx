import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cyber1 from "../assets/cyber1.jpg";
import cyber2 from "../assets/cyber2.jpg";
import cyber3 from "../assets/cyber3.jpg";
import cyber4 from "../assets/cyber4.jpg";
import cyber5 from "../assets/cyber5.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const courses = [
    {
      id: 1,
      title: "Introduction to Cybersecurity",
      desc: "Starter course on threats, CIA triad, and cyber hygiene.",
      img: cyber1,
      module: "1 Module",
      hour: "1h",
      level: "Beginner",
      icon: "shield",
    },
    {
      id: 2,
      title: "Ethical Hacking Essentials",
      desc: "Introductory ethical hacking methodology and tooling.",
      img: cyber2,
      module: "1 Module",
      hour: "1.5h",
      level: "Beginner",
      icon: "web",
    },
    {
      id: 3,
      title: "Network Security Basics",
      desc: "Learn how to secure networks and detect intrusions.",
      img: cyber3,
      module: "1 Module",
      hour: "2h",
      level: "Beginner",
      icon: "network",
    },
    {
      id: 4,
      title: "Web Application Security",
      desc: "Introduction to web app vulnerabilities and OWASP top 10.",
      img: cyber4,
      module: "1 Module",
      hour: "1.5h",
      level: "Beginner",
      icon: "terminal",
    },
    {
      id: 5,
      title: "Incident Response & Forensics",
      desc: "Handle security incidents and perform digital forensics.",
      img: cyber5,
      module: "1 Module",
      hour: "1h",
      level: "Beginner",
      icon: "alert",
    },
  ];

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setEnrolling(true);
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
      if (res.ok) {
        alert(data.message);
        // redirect to MyLearning page
        navigate(`/learn/${courseId}`);
      } else {
        alert(data.message || "Failed to enroll");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1E293B]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-[#1E293B]">
        <h1 className="text-white font-bold text-lg">Kompi Cyber</h1>
        <button
          onClick={handleLogout}
          className="text-[#FE9A00] border border-[#FE9A00] px-3 py-1 rounded-lg text-sm hover:bg-[#FE9A00] hover:text-black transition"
        >
          Logout
        </button>
      </nav>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <h1 className="text-4xl font-bold text-white mb-6">My Learning Path</h1>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-[#0A0F1A] rounded-xl border border-gray-800 overflow-hidden shadow-lg"
            >
              <img
                src={course.img}
                alt={course.title}
                className="w-full h-40 object-cover"
              />

              <div className="p-6">
                <h3 className="text-white font-semibold mb-2">{course.title}</h3>
                <p className="text-[#90A1B9] text-sm mb-4">{course.desc}</p>

                <div className="flex justify-between text-[#90A1B9] text-sm mb-4">
                  <span>📚 {course.module}</span>
                  <span>⏱ {course.hour}</span>
                  <span>🎓 {course.level}</span>
                </div>

                <button
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolling}
                  className="w-full py-2 rounded-lg font-semibold text-white bg-[#FE9A00] hover:bg-[#ffb13b] transition disabled:opacity-50"
                >
                  {enrolling ? "Enrolling..." : "Enroll"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}