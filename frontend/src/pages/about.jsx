import { motion } from "framer-motion";
import { Shield, Cpu, Users, Target } from "lucide-react";

export default function About() {
  return (
    <div className="bg-[#192841] text-white min-h-screen px-6 md:px-20 py-20">

      {/* TITLE */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-black">
          About <span className="text-[#FFA500]">Kompi-Cyber</span>
        </h1>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Empowering the next generation of cybersecurity professionals in Cambodia and beyond.
        </p>
      </motion.div>

      {/* MISSION + VISION */}
      <div className="grid md:grid-cols-2 gap-10 mb-20">
        
        <div className="p-8 bg-white/5 border border-[#FFA500]/20 rounded-2xl">
          <Target className="text-[#FFA500] mb-4" size={40} />
          <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
          <p className="text-gray-400">
            To provide high-quality, practical cybersecurity education that helps students build real-world skills and succeed in the digital economy.
          </p>
        </div>

        <div className="p-8 bg-white/5 border border-[#FFA500]/20 rounded-2xl">
          <Cpu className="text-[#FFA500] mb-4" size={40} />
          <h2 className="text-2xl font-bold mb-2">Our Vision</h2>
          <p className="text-gray-400">
            To become the leading cybersecurity learning platform in Southeast Asia, producing skilled and job-ready graduates.
          </p>
        </div>

      </div>

      {/* FEATURES */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold">
          Why Choose <span className="text-[#FFA500]">Us</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        
        <div className="p-6 bg-white/5 border border-[#FFA500]/20 rounded-xl text-center">
          <Shield className="mx-auto text-[#FFA500] mb-4" size={40} />
          <h3 className="font-bold text-lg">Real Security Skills</h3>
          <p className="text-gray-400 mt-2">
            Learn practical cybersecurity techniques used in real jobs.
          </p>
        </div>

        <div className="p-6 bg-white/5 border border-[#FFA500]/20 rounded-xl text-center">
          <Users className="mx-auto text-[#FFA500] mb-4" size={40} />
          <h3 className="font-bold text-lg">Expert Instructors</h3>
          <p className="text-gray-400 mt-2">
            Learn from professionals with real-world experience.
          </p>
        </div>

        <div className="p-6 bg-white/5 border border-[#FFA500]/20 rounded-xl text-center">
          <Cpu className="mx-auto text-[#FFA500] mb-4" size={40} />
          <h3 className="font-bold text-lg">Hands-on Projects</h3>
          <p className="text-gray-400 mt-2">
            Practice with real scenarios and build your portfolio.
          </p>
        </div>

      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          Join Our Learning Community 🚀
        </h2>

        <button className="px-8 py-3 bg-[#FFA500] text-[#192841] font-bold rounded-xl">
          Start Learning
        </button>
      </div>

    </div>
  );
}