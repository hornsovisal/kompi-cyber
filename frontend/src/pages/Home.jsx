import React, { useEffect, useState } from "react";
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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home() {
  const [dark, setDark] = useState(true);
  const [courses, setCourses] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const navigate = useNavigate();

  // 🔐 Auth handlers
  const handleStart = () => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleProfile = () => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/learn/${courseId}`);
  };

  // 🌐 Fetch courses
  useEffect(() => {
    axios
      .get(`${API_BASE}/courses`)
      .then((res) => setCourses(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Animation variants
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

  return (
    <div className="bg-[#192841] text-white min-h-screen overflow-hidden">
      {/* ANIMATED BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFA500] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[#FFA500] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <span onClick={() => navigate("/about")} className="cursor-pointer">
            About us
      </span>
      {/* NAVBAR - Glass Morphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 backdrop-blur-md bg-[#192841]/80 border-b border-[#FFA500]/20 shadow-2xl">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-[#FFA500] to-orange-300 bg-clip-text text-transparent flex items-center gap-2"
          >
            <Zap className="text-[#FFA500]" size={32} />
            KOMPI-CYBER
          </motion.h1>

      {/* CENTER */}
        <div className="hidden md:flex gap-8 text-white font-medium">
            <span
              onClick={() => navigate("/")}
              className="cursor-pointer hover:text-[#FFA500] transition duration-300"
            >
              Home
            </span>

            <span
              onClick={() => navigate("/courses")}
              className="cursor-pointer hover:text-[#FFA500] transition duration-300"
            >
              Courses
            </span>

            <span
              onClick={() => navigate("/programs")}
              className="cursor-pointer hover:text-[#FFA500] transition duration-300"
            >
              Programs
            </span>

            <span
              onClick={() => navigate("/my-learning")}
              className="cursor-pointer hover:text-[#FFA500] transition duration-300"
            >
              My Learning
            </span>

            <span
              onClick={() => navigate("/about")}
              className="cursor-pointer hover:text-[#FFA500] transition duration-300"
            >
              About Us
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-[#FFA500]/30 hover:border-[#FFA500]/60 transition">
              <Search size={18} className="text-[#FFA500]" />
              <input
                type="text"
                placeholder="Search courses..."
                className="bg-transparent outline-none text-sm w-32"
              />
            </div>

            <Bell className="cursor-pointer text-[#FFA500] hover:text-orange-300 transition" />

            <User
              className="cursor-pointer text-[#FFA500] hover:text-orange-300 transition"
              onClick={handleProfile}
            />

            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg bg-white/5 border border-[#FFA500]/30 hover:border-[#FFA500]/60 transition"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 px-6 md:px-20 pb-16 grid md:grid-cols-2 gap-16 items-center relative">
        {/* LEFT - Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div variants={floatVariants} animate="animate">
            <p className="text-[#FFA500] font-semibold text-lg mb-2 flex items-center gap-2">
              <Zap size={20} /> FUTURE IS NOW
            </p>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
            Master
            <span className="block bg-gradient-to-r from-[#FFA500] via-orange-400 to-[#FFA500] bg-clip-text text-transparent">
              CYBERSECURITY
            </span>
            in 2050
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Unleash your potential with cutting-edge skills. Learn from industry experts and become a cyber guardian of tomorrow's digital world.
          </p>

          <div className="flex gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-[#FFA500] to-orange-500 text-[#192841] font-bold rounded-xl shadow-lg hover:shadow-2xl transition flex items-center gap-2"
            >
              START LEARNING <ChevronRight size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-[#FFA500] text-[#FFA500] font-bold rounded-xl hover:bg-[#FFA500]/10 transition"
            >
              EXPLORE COURSES
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <p className="text-3xl font-bold text-[#FFA500]">500+</p>
              <p className="text-gray-400 text-sm">Active Users</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <p className="text-3xl font-bold text-[#FFA500]">50+</p>
              <p className="text-gray-400 text-sm">Courses</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <p className="text-3xl font-bold text-[#FFA500]">95%</p>
              <p className="text-gray-400 text-sm">Success Rate</p>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT - Animated Icons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative h-full"
        >
          <div className="relative w-full h-96">
            {/* Floating Icons */}
            <motion.div
              variants={floatVariants}
              animate="animate"
              className="absolute top-10 right-10 p-6 bg-white/10 border border-[#FFA500]/30 rounded-xl backdrop-blur"
            >
              <Shield className="text-[#FFA500]" size={40} />
            </motion.div>

            <motion.div
              variants={floatVariants}
              animate="animate"
              style={{ animationDelay: "0.5s" }}
              className="absolute bottom-20 left-10 p-6 bg-white/10 border border-[#FFA500]/30 rounded-xl backdrop-blur"
            >
              <Lock className="text-[#FFA500]" size={40} />
            </motion.div>

            <motion.div
              variants={floatVariants}
              animate="animate"
              style={{ animationDelay: "1s" }}
              className="absolute top-1/2 right-0 p-6 bg-white/10 border border-[#FFA500]/30 rounded-xl backdrop-blur"
            >
              <Cpu className="text-[#FFA500]" size={40} />
            </motion.div>

            {/* Glowing Circle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-[#FFA500]/20 rounded-full"
            ></motion.div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 md:px-20 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black mb-4">
            Why Choose <span className="text-[#FFA500]">KOMPI-CYBER</span>?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Industry-leading platform with world-class instructors
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Learn at your own pace with instant feedback" },
            { icon: Shield, title: "Real Security", desc: "Hands-on labs with real-world scenarios" },
            { icon: Star, title: "Expert Mentors", desc: "Learn from top cybersecurity professionals" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="p-8 bg-white/5 border border-[#FFA500]/20 rounded-2xl backdrop-blur hover:border-[#FFA500]/60 transition group"
            >
              <feature.icon className="text-[#FFA500] mb-4 group-hover:scale-110 transition" size={40} />
              <h3 className="text-2xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* COURSES SECTION */}
      <section className="px-6 md:px-20 py-16">
        <h2 className="text-5xl font-black mb-12">
          Featured <span className="text-[#FFA500]">Courses</span>
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8"
        >
          {courses.length > 0 ? (
            courses.slice(0, 6).map((course, idx) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCourseClick(course.id)}
                className="group cursor-pointer relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFA500] to-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-1000"></div>

                <div className="relative p-8 bg-white/5 border border-[#FFA500]/30 rounded-2xl backdrop-blur hover:border-[#FFA500]/60 transition h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Cpu className="text-[#FFA500]" size={32} />
                    <motion.div animate={hoveredCard === idx ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.6 }}>
                      <ChevronRight className="text-[#FFA500]" size={24} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 line-clamp-2 text-white">{course.title}</h3>
                  <p className="text-gray-400 mb-6 line-clamp-2">{course.description}</p>

                  <div className="flex items-center justify-between text-[#FFA500]">
                    <span className="text-sm font-semibold">EXPLORE COURSE</span>
                    <motion.div animate={hoveredCard === idx ? { x: 5 } : { x: 0 }}>
                      →
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-400">Loading courses...</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* ANNOUNCEMENTS SECTION */}
      <section className="px-6 md:px-20 py-16 bg-gradient-to-b from-[#192841] to-[#0f1a2e]">
        <h2 className="text-5xl font-black mb-12">
          Latest <span className="text-[#FFA500]">Announcements</span>
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8"
        >
          {["🎓 Tech Conference", "🤖 AI Program Launch", "👨‍🏫 Guest Lecture"].map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="p-8 bg-white/5 border border-[#FFA500]/20 rounded-2xl backdrop-blur hover:border-[#FFA500]/60 transition group"
            >
              <h3 className="text-2xl font-bold mb-3 text-white">{item}</h3>
              <p className="text-gray-400 mb-4">Stay updated with the latest news and opportunities.</p>
              <button className="text-[#FFA500] font-semibold hover:text-orange-300 transition flex items-center gap-2">
                Learn More <ChevronRight size={18} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* WHY CHOOSE DETAILED SECTION */}
      <section className="px-6 md:px-20 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4">
            Why Choose <span className="text-[#FFA500]">KOMPI-CYBER</span>?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Industry-leading platform with world-class instructors and real-world projects
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-4 gap-8"
        >
          {[
            { emoji: "🎯", title: "Certifications", desc: "Earn industry-recognized certifications" },
            { emoji: "👨‍💼", title: "Expert Teachers", desc: "Learn from cybersecurity professionals" },
            { emoji: "💻", title: "Real Projects", desc: "Hands-on labs with real-world scenarios" },
            { emoji: "🚀", title: "Career Focus", desc: "Direct path to tech jobs and roles" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-white/5 border border-[#FFA500]/20 rounded-2xl backdrop-blur hover:border-[#FFA500]/60 transition text-center group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">{item.emoji}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 md:px-20 py-20 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFA500]/10 to-blue-500/10 rounded-3xl blur-3xl -z-10"></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-5xl font-black mb-6">
            Ready to Secure Your <span className="text-[#FFA500]">Future</span>?
          </h2>
          <p className="text-gray-300 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of learners becoming cybersecurity experts today. Start your journey now!
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="px-12 py-4 bg-gradient-to-r from-[#FFA500] to-orange-500 text-[#192841] font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl transition"
          >
            START YOUR JOURNEY NOW
          </motion.button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black/50 border-t border-[#FFA500]/20 backdrop-blur text-white px-6 md:px-20 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h2 className="text-2xl font-bold text-[#FFA500] mb-3">KOMPI-CYBER</h2>
            <p className="text-gray-400">Cambodia Academy of Digital Technology</p>
            <p className="text-gray-400">Phnom Penh, Cambodia</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h3 className="font-bold text-[#FFA500] mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-[#FFA500] transition cursor-pointer">Home</li>
              <li className="hover:text-[#FFA500] transition cursor-pointer">Courses</li>
              <li className="hover:text-[#FFA500] transition cursor-pointer">Dashboard</li>
              <li className="hover:text-[#FFA500] transition cursor-pointer">About Us</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 className="font-bold text-[#FFA500] mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-[#FFA500] transition cursor-pointer">Help Center</li>
              <li className="hover:text-[#FFA500] transition cursor-pointer">Contact Us</li>
              <li className="hover:text-[#FFA500] transition cursor-pointer">FAQ</li>
              <li className="hover:text-[#FFA500] transition cursor-pointer">Documentation</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3 className="font-bold text-[#FFA500] mb-4">Contact</h3>
            <p className="text-gray-400 mb-2">Email: info@cadt.edu.kh</p>
            <p className="text-gray-400 mb-2">Phone: +855 (0) XXX XXX XXX</p>
            <div className="flex gap-4 mt-4">
              <div className="w-8 h-8 bg-[#FFA500]/20 rounded hover:bg-[#FFA500]/40 transition cursor-pointer flex items-center justify-center">f</div>
              <div className="w-8 h-8 bg-[#FFA500]/20 rounded hover:bg-[#FFA500]/40 transition cursor-pointer flex items-center justify-center">t</div>
              <div className="w-8 h-8 bg-[#FFA500]/20 rounded hover:bg-[#FFA500]/40 transition cursor-pointer flex items-center justify-center">in</div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-[#FFA500]/20 pt-8 text-center text-gray-400">
          <p>© 2026 KOMPI-CYBER. All rights reserved. | <span className="text-[#FFA500]">Powered by CADT</span></p>
        </div>
      </footer>

      <style jsx>{`
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