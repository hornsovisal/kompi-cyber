import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  User,
  Moon,
  Sun,
  Zap,
  Lock,
  Cpu,
  Shield,
  ChevronRight,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Home() {
  const [dark, setDark] = useState(true);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const handleStart = () => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleProfile = () => {
    if (isAuthenticated()) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/learn/${courseId}`);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    setCoursesLoading(true);
    setCoursesError("");

    axios
      .get("/api/courses", { baseURL: API_BASE })
      .then((res) => {
        const nextCourses = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.courses)
            ? res.data.courses
            : [];

        setCourses(nextCourses);
      })
      .catch((err) => {
        console.log(err);
        setCourses([]);
        setCoursesError(
          err.response?.data?.message ||
            "Courses could not be loaded right now.",
        );
      })
      .finally(() => {
        setCoursesLoading(false);
      });
  }, []);

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) => {
      const title = String(course.title || "").toLowerCase();
      const description = String(course.description || "").toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [courses, searchTerm]);

  const featuredCourses = filteredCourses.slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 4, repeat: Infinity },
    },
  };

  const theme = dark
    ? {
        shell: "bg-[#192841] text-white",
        nav: "bg-[#192841]/80 border-[#FFA500]/20",
        card: "bg-white/5 border-[#FFA500]/20 text-white",
        muted: "text-gray-400",
        soft: "text-gray-300",
        section: "bg-gradient-to-b from-[#192841] to-[#0f1a2e]",
      }
    : {
        shell: "bg-gradient-to-b from-white to-gray-50 text-[#1f2a44]",
        nav: "bg-white/95 border-orange-200 shadow-sm",
        card: "bg-gradient-to-br from-white to-orange-50 border-orange-200 text-[#1f2a44] shadow-sm",
        muted: "text-gray-600",
        soft: "text-gray-700",
        section: "bg-gradient-to-b from-gray-50 via-orange-50 to-white",
      };

  return (
    <div
      className={`${theme.shell} min-h-screen overflow-hidden transition-colors duration-300`}
    >
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#FFA500] opacity-20 blur-3xl animate-blob" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 h-96 w-96 rounded-full bg-[#FFA500] opacity-20 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <nav
        className={`fixed left-0 right-0 top-0 z-50 border-b px-6 py-4 shadow-2xl backdrop-blur-md md:px-12 ${theme.nav}`}
      >
        <div className="flex items-center justify-between gap-6">
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FFA500] to-orange-300 bg-clip-text text-3xl font-bold text-transparent"
          >
            <Zap className="text-[#FFA500]" size={32} />
            KOMPI-CYBER
          </motion.button>

          <div className="hidden gap-8 font-medium md:flex">
            <button
              type="button"
              onClick={() => scrollToSection("hero")}
              className="transition duration-300 hover:text-[#FFA500]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("courses")}
              className="transition duration-300 hover:text-[#FFA500]"
            >
              Courses
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="transition duration-300 hover:text-[#FFA500]"
            >
              Programs
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="transition duration-300 hover:text-[#FFA500]"
            >
              My Learning
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="transition duration-300 hover:text-[#FFA500]"
            >
              About Us
            </button>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <div className="flex items-center gap-3 rounded-lg border border-[#FFA500]/30 bg-white/5 px-4 py-2 transition hover:border-[#FFA500]/60">
              <Search size={18} className="text-[#FFA500]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search courses..."
                className="w-32 bg-transparent text-sm outline-none placeholder:text-inherit"
              />
            </div>

            <Bell className="cursor-pointer text-[#FFA500] transition hover:text-orange-300" />

            <User
              className="cursor-pointer text-[#FFA500] transition hover:text-orange-300"
              onClick={handleProfile}
            />

            <button
              type="button"
              onClick={() => setDark((value) => !value)}
              className="rounded-lg border border-[#FFA500]/30 bg-white/5 p-2 transition hover:border-[#FFA500]/60"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      <section
        id="hero"
        className="relative grid gap-16 px-6 pb-16 pt-32 md:grid-cols-2 md:px-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div variants={floatVariants} animate="animate">
            <p className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#FFA500]">
              <Zap size={20} /> FUTURE IS NOW
            </p>
          </motion.div>

          <h1 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
            Master
            <span className="block bg-gradient-to-r from-[#FFA500] via-orange-400 to-[#FFA500] bg-clip-text text-transparent">
              CYBERSECURITY
            </span>
            in 2050
          </h1>

          <p className={`mb-8 max-w-xl text-lg leading-relaxed ${theme.soft}`}>
            Unleash your potential with cutting-edge skills. Learn from industry
            experts and become a cyber guardian of tomorrow&apos;s digital
            world.
          </p>

          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFA500] to-orange-500 px-8 py-4 font-bold text-[#192841] shadow-lg transition hover:shadow-2xl"
            >
              START LEARNING <ChevronRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => scrollToSection("courses")}
              className="rounded-xl border-2 border-[#FFA500] px-8 py-4 font-bold text-[#FFA500] transition hover:bg-[#FFA500]/10"
            >
              EXPLORE COURSES
            </motion.button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-3xl font-bold text-[#FFA500]">500+</p>
              <p className={`text-sm ${theme.muted}`}>Active Users</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-3xl font-bold text-[#FFA500]">50+</p>
              <p className={`text-sm ${theme.muted}`}>Courses</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-3xl font-bold text-[#FFA500]">95%</p>
              <p className={`text-sm ${theme.muted}`}>Success Rate</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative h-full"
        >
          <div className="relative h-96 w-full">
            <motion.div
              variants={floatVariants}
              animate="animate"
              className="absolute right-10 top-10 rounded-xl border border-[#FFA500]/30 bg-white/10 p-6 backdrop-blur"
            >
              <Shield className="text-[#FFA500]" size={40} />
            </motion.div>

            <motion.div
              variants={floatVariants}
              animate="animate"
              className="absolute bottom-20 left-10 rounded-xl border border-[#FFA500]/30 bg-white/10 p-6 backdrop-blur"
              transition={{ delay: 0.5 }}
            >
              <Lock className="text-[#FFA500]" size={40} />
            </motion.div>

            <motion.div
              variants={floatVariants}
              animate="animate"
              className="absolute right-0 top-1/2 rounded-xl border border-[#FFA500]/30 bg-white/10 p-6 backdrop-blur"
              transition={{ delay: 1 }}
            >
              <Cpu className="text-[#FFA500]" size={40} />
            </motion.div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-[#FFA500]/20"
            />
          </div>
        </motion.div>
      </section>

      <section id="features" className="px-6 py-16 md:px-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-black md:text-5xl">
            Why Choose <span className="text-[#FFA500]">KOMPI-CYBER</span>?
          </h2>
          <p className={`mx-auto max-w-2xl ${theme.muted}`}>
            Industry-leading platform with world-class instructors
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-3"
        >
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Learn at your own pace with instant feedback",
            },
            {
              icon: Shield,
              title: "Real Security",
              desc: "Hands-on labs with real-world scenarios",
            },
            {
              icon: Star,
              title: "Expert Mentors",
              desc: "Learn from top cybersecurity professionals",
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className={`group rounded-2xl border p-8 backdrop-blur transition hover:border-[#FFA500]/60 ${theme.card}`}
            >
              <feature.icon
                className="mb-4 text-[#FFA500] transition group-hover:scale-110"
                size={40}
              />
              <h3 className="mb-2 text-2xl font-bold">{feature.title}</h3>
              <p className={theme.muted}>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="courses" className="px-6 py-16 md:px-20">
        <h2 className="mb-12 text-4xl font-black md:text-5xl">
          Featured <span className="text-[#FFA500]">Courses</span>
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-3"
        >
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCourseClick(course.id)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FFA500] to-orange-500 opacity-0 blur-xl transition duration-1000 group-hover:opacity-20" />

                <div
                  className={`relative h-full rounded-2xl border p-8 backdrop-blur transition hover:border-[#FFA500]/60 ${theme.card}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Cpu className="text-[#FFA500]" size={32} />
                    <motion.div
                      animate={
                        hoveredCard === idx ? { rotate: 360 } : { rotate: 0 }
                      }
                      transition={{ duration: 0.6 }}
                    >
                      <ChevronRight className="text-[#FFA500]" size={24} />
                    </motion.div>
                  </div>

                  <h3 className="mb-3 line-clamp-2 text-2xl font-bold">
                    {course.title}
                  </h3>
                  <p className={`mb-6 line-clamp-3 ${theme.muted}`}>
                    {course.description || "Start learning this course now."}
                  </p>

                  <div className="flex items-center justify-between text-[#FFA500]">
                    <span className="text-sm font-semibold">
                      EXPLORE COURSE
                    </span>
                    <motion.div
                      animate={hoveredCard === idx ? { x: 5 } : { x: 0 }}
                    >
                      →
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div
              className={`col-span-3 rounded-2xl border border-dashed border-[#FFA500]/30 py-12 text-center ${theme.card}`}
            >
              <p className={theme.muted}>
                {coursesLoading
                  ? "Loading courses..."
                  : coursesError || "No courses matched your search."}
              </p>
            </div>
          )}
        </motion.div>
      </section>

      <section className={`px-6 py-16 md:px-20 ${theme.section}`}>
        <h2 className="mb-12 text-4xl font-black md:text-5xl">
          Latest <span className="text-[#FFA500]">Announcements</span>
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-3"
        >
          {["Tech Conference", "AI Program Launch", "Guest Lecture"].map(
            (item) => (
              <motion.div
                key={item}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className={`group rounded-2xl border p-8 backdrop-blur transition hover:border-[#FFA500]/60 ${theme.card}`}
              >
                <h3 className="mb-3 text-2xl font-bold">{item}</h3>
                <p className={`mb-4 ${theme.muted}`}>
                  Stay updated with the latest news and opportunities.
                </p>
                <button
                  type="button"
                  onClick={() => scrollToSection("about")}
                  className="flex items-center gap-2 font-semibold text-[#FFA500] transition hover:text-orange-300"
                >
                  Learn More <ChevronRight size={18} />
                </button>
              </motion.div>
            ),
          )}
        </motion.div>
      </section>

      <section id="about" className="px-6 py-16 md:px-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-black md:text-5xl">
            Why Choose <span className="text-[#FFA500]">KOMPI-CYBER</span>?
          </h2>
          <p className={`mx-auto max-w-2xl text-lg ${theme.muted}`}>
            Industry-leading platform with world-class instructors and
            real-world projects
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-4"
        >
          {[
            {
              emoji: "🎯",
              title: "Certifications",
              desc: "Earn industry-recognized certifications",
            },
            {
              emoji: "👨‍💼",
              title: "Expert Teachers",
              desc: "Learn from cybersecurity professionals",
            },
            {
              emoji: "💻",
              title: "Real Projects",
              desc: "Hands-on labs with real-world scenarios",
            },
            {
              emoji: "🚀",
              title: "Career Focus",
              desc: "Direct path to tech jobs and roles",
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className={`group rounded-2xl border p-8 text-center backdrop-blur transition hover:border-[#FFA500]/60 ${theme.card}`}
            >
              <div className="mb-4 text-5xl transition group-hover:scale-110">
                {item.emoji}
              </div>
              <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
              <p className={theme.muted}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="relative px-6 py-20 text-center md:px-20">
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-[#FFA500]/10 to-blue-500/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="mb-6 text-4xl font-black md:text-5xl">
            Ready to Secure Your <span className="text-[#FFA500]">Future</span>?
          </h2>
          <p className={`mx-auto mb-8 max-w-2xl text-xl ${theme.soft}`}>
            Join thousands of learners becoming cybersecurity experts today.
            Start your journey now!
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="rounded-xl bg-gradient-to-r from-[#FFA500] to-orange-500 px-12 py-4 text-lg font-bold text-[#192841] shadow-2xl transition"
          >
            START YOUR JOURNEY NOW
          </motion.button>
        </motion.div>
      </section>

      <footer className="border-t border-[#FFA500]/20 bg-black/50 px-6 py-12 text-white backdrop-blur md:px-20">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-3 text-2xl font-bold text-[#FFA500]">
              KOMPI-CYBER
            </h2>
            <p className="text-gray-400">
              Cambodia Academy of Digital Technology
            </p>
            <p className="text-gray-400">Phnom Penh, Cambodia</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 font-bold text-[#FFA500]">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("hero")}
                  className="transition hover:text-[#FFA500]"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("courses")}
                  className="transition hover:text-[#FFA500]"
                >
                  Courses
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleStart}
                  className="transition hover:text-[#FFA500]"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("about")}
                  className="transition hover:text-[#FFA500]"
                >
                  About Us
                </button>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="mb-4 font-bold text-[#FFA500]">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("about")}
                  className="transition hover:text-[#FFA500]"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("about")}
                  className="transition hover:text-[#FFA500]"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className="transition hover:text-[#FFA500]"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className="transition hover:text-[#FFA500]"
                >
                  Documentation
                </button>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="mb-4 font-bold text-[#FFA500]">Contact</h3>
            <p className="mb-2 text-gray-400">Email: info@cadt.edu.kh</p>
            <p className="mb-2 text-gray-400">Phone: +855 (0) XXX XXX XXX</p>
            <div className="mt-4 flex gap-4">
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-[#FFA500]/20 transition hover:bg-[#FFA500]/40">
                f
              </div>
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-[#FFA500]/20 transition hover:bg-[#FFA500]/40">
                t
              </div>
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-[#FFA500]/20 transition hover:bg-[#FFA500]/40">
                in
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-[#FFA500]/20 pt-8 text-center text-gray-400">
          <p>
            © 2026 KOMPI-CYBER. All rights reserved. |{" "}
            <span className="text-[#FFA500]">Powered by CADT</span>
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
