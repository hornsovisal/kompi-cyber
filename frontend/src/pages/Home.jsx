import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
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
  Menu,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import new responsive system
import { useResponsive } from '../hooks/useResponsive';
import { Button, Card, Container, Section, Grid, Flex } from '../components/base';
import { ThemeManager } from '../utils/themeManager';
import { responsiveText, responsivePadding, MobileFirst } from '../utils/responsiveUtils';

import { isAuthenticated } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ============= Sub-components =============

/**
 * Responsive Navigation Component
 */
function ResponsiveNavigation({ dark, setDark, searchTerm, setSearchTerm, onTeacherLogin, handleProfile, scrollToSection, isMobile }) {
  const theme = new ThemeManager(dark).getTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'features', label: 'Programs' },
    { id: 'about', label: 'About' },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-colors duration-300 px-4 py-4 shadow-lg backdrop-blur-md sm:px-6 md:px-12 ${theme.nav}`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => scrollToSection('hero')}
          className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FFA500] to-orange-400 bg-clip-text text-transparent"
        >
          <Zap className="text-[#FFA500]" size={24} />
          <span className={MobileFirst.hideOnMobile('md:inline')}>KOMPI</span>
        </motion.button>

        {/* Desktop Menu */}
        <div className={`${MobileFirst.hideOnMobile('md:flex')} items-center gap-6 font-medium`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={theme.hover}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <Flex gap={3} className="items-center">
          {!isMobile && (
            <div className={`flex items-center gap-3 rounded-lg ${theme.card} px-3 py-2 text-sm`}>
              <Search size={16} className="text-[#FFA500]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={`w-24 bg-transparent outline-none placeholder:${theme.muted}`}
              />
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onTeacherLogin}
            className={MobileFirst.hideOnMobile('md:block')}
          >
            Teacher Login
          </Button>

          {/* Mobile Menu Button */}
          <button
            className={MobileFirst.hideOnMobile('md:hidden')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </Flex>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 border-t space-y-3 pt-4 ${theme.border}`}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                scrollToSection(item.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2"
            >
              {item.label}
            </button>
          ))}
          <Button fullWidth variant="primary" onClick={onTeacherLogin} size="sm">
            Teacher Login
          </Button>
        </motion.div>
      )}
    </nav>
  );
}

/**
 * Hero Section Component
 */
function HeroSection({ theme, isMobile, onStart, scrollToSection }) {
  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 4, repeat: Infinity },
    },
  };

  return (
    <Section id="hero" className="pt-32 md:pt-40">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center space-y-6"
        >
          <motion.div variants={floatVariants} animate="animate">
            <p className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#FFA500]">
              <Zap size={18} /> FUTURE IS NOW
            </p>
          </motion.div>

          <h1 className={`${responsiveText['3xl']} md:${responsiveText['4xl']} font-black leading-tight`}>
            Master
            <span className="block bg-gradient-to-r from-[#FFA500] via-orange-400 to-[#FFA500] bg-clip-text text-transparent">
              CYBERSECURITY
            </span>
            in 2026
          </h1>

          <p className={`${responsiveText.lg} ${theme.soft} max-w-xl`}>
            Unleash your potential with cutting-edge skills. Learn from industry experts and become a cyber guardian of
            tomorrow&apos;s digital world.
          </p>

          {/* CTA Buttons */}
          <Flex direction={isMobile ? 'col' : 'row'} gap={3}>
            <Button variant="primary" size={isMobile ? 'md' : 'lg'} fullWidth={isMobile} onClick={onStart}>
              START LEARNING <ChevronRight size={18} />
            </Button>
            <Button
              variant="secondary"
              size={isMobile ? 'md' : 'lg'}
              fullWidth={isMobile}
              onClick={() => scrollToSection('courses')}
            >
              EXPLORE COURSES
            </Button>
          </Flex>

          {/* Stats */}
          <Grid cols={3} gap={4} className="mt-8">
            {[
              { value: '500+', label: 'Active Users' },
              { value: '50+', label: 'Courses' },
              { value: '95%', label: 'Success Rate' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-lg sm:text-2xl font-bold text-[#FFA500]">{stat.value}</p>
                <p className={`text-xs sm:text-sm ${theme.muted}`}>{stat.label}</p>
              </motion.div>
            ))}
          </Grid>
        </motion.div>

        {/* Right Illustration */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-96 flex items-center justify-center"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 rounded-full border border-[#FFA500]/20" />

            {[
              { Icon: Shield, delay: 0, top: 'top-10', right: 'right-10' },
              { Icon: Lock, delay: 0.5, top: 'bottom-20', right: 'left-10' },
              { Icon: Cpu, delay: 1, top: 'top-1/2', right: 'right-0' },
            ].map((item) => (
              <motion.div
                key={item.Icon.name}
                variants={{ animate: { y: [0, -20, 0], transition: { duration: 4, repeat: Infinity, delay: item.delay } } }}
                animate="animate"
                className={`absolute ${item.top} ${item.right} rounded-xl border ${theme.border} ${theme.card} p-4`}
              >
                <item.Icon className="text-[#FFA500]" size={32} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Section>
  );
}

/**
 * Features Section
 */
function FeaturesSection({ theme }) {
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

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Learn at your own pace with instant feedback' },
    { icon: Shield, title: 'Real Security', desc: 'Hands-on labs with real-world scenarios' },
    { icon: Star, title: 'Expert Mentors', desc: 'Learn from top cybersecurity professionals' },
  ];

  return (
    <Section id="features">
      <h2 className={`${responsiveText['2xl']} md:${responsiveText['3xl']} font-black text-center mb-4`}>
        Why Choose <span className="text-[#FFA500]">KOMPI-CYBER</span>?
      </h2>
      <p className={`text-center ${theme.muted} mb-12 max-w-2xl mx-auto`}>
        Industry-leading platform with world-class instructors
      </p>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <motion.div key={feature.title} variants={itemVariants}>
            <Card hoverable className="h-full">
              <feature.icon className="text-[#FFA500] mb-4" size={40} />
              <h3 className={responsiveText.xl}>{feature.title}</h3>
              <p className={`${theme.muted} mt-2`}>{feature.desc}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/**
 * Courses Section
 */
function CoursesSection({ courses, loading, error, searchTerm, theme, isMobile, onCourseClick }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((c) => {
      const title = String(c.title || '').toLowerCase();
      const description = String(c.description || '').toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [courses, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <Section id="courses">
      <h2 className={`${responsiveText['2xl']} md:${responsiveText['3xl']} font-black mb-4`}>
        Featured <span className="text-[#FFA500]">Courses</span>
      </h2>

      {isMobile && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: theme.border }}>
          <Search size={16} className="text-[#FFA500]" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      )}

      {loading ? (
        <p className={`text-center py-12 ${theme.muted}`}>Loading courses...</p>
      ) : error ? (
        <p className="text-center py-12 text-red-500">{error}</p>
      ) : filteredCourses.length === 0 ? (
        <p className={`text-center py-12 ${theme.muted}`}>No courses found</p>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.slice(0, 6).map((course, idx) => (
            <motion.div key={course.id} variants={itemVariants} onMouseEnter={() => setHoveredCard(idx)} onMouseLeave={() => setHoveredCard(null)}>
              <Card hoverable onClick={() => onCourseClick(course.id)} className={`cursor-pointer h-full flex flex-col justify-between ${hoveredCard === idx ? 'ring-2 ring-[#FFA500]' : ''}`}>
                <div>
                  <Flex justify="between" items="center" className="mb-4">
                    <Cpu className="text-[#FFA500]" size={28} />
                    <motion.div animate={hoveredCard === idx ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.6 }}>
                      <ChevronRight className="text-[#FFA500]" size={20} />
                    </motion.div>
                  </Flex>

                  <h3 className={`${responsiveText.lg} font-bold line-clamp-2`}>{course.title}</h3>
                  <p className={`${theme.muted} text-sm line-clamp-2 mt-2`}>{course.description || 'Learn this course'}</p>

                  <Flex gap={2} direction="col" className={`${responsiveText.xs} ${theme.muted} mt-4`}>
                    <span>📚 {course.module_count || 0} Modules</span>
                    <span>⏱️ {course.duration_hrs || 0}h</span>
                    <span>📊 {course.level || 'Beginner'}</span>
                  </Flex>
                </div>

                <Button variant="primary" fullWidth size="sm" className="mt-4">
                  View Course →
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </Section>
  );
}

/**
 * Footer Component
 */
function Footer({ theme, scrollToSection }) {
  return (
    <footer className={`border-t ${theme.border} py-12 md:py-16`}>
      <Container>
        <Grid cols={1} md={3} gap={8} className="mb-8 md:mb-12">
          {[
            {
              title: 'Product',
              links: [
                { label: 'Courses', id: 'courses' },
                { label: 'Certifications', id: 'features' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About', id: 'about' },
                { label: 'Contact', id: 'hero' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Privacy Policy', id: 'hero' },
                { label: 'Terms & Conditions', id: 'hero' },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button onClick={() => scrollToSection(link.id)} className={`text-sm ${theme.muted} hover:text-[#FFA500]`}>
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Grid>

        <div className={`border-t ${theme.border} pt-8 text-center ${theme.muted} text-sm`}>
          <p>&copy; 2026 KOMPI-CYBER. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}

// ============= Main Component =============

export default function Home() {
  const { isMobile } = useResponsive();
  const [dark, setDark] = useState(true);
  const theme = new ThemeManager(dark).getTheme();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Handlers
  const handleStart = () => {
    navigate(isAuthenticated() ? '/dashboard' : '/login');
  };

  const handleTeacherLogin = () => {
    navigate('/instructor/login');
  };

  const handleCourseClick = (courseId) => {
    navigate(`/learn/${courseId}`);
  };

  const handleProfile = () => {
    navigate(isAuthenticated() ? '/dashboard' : '/login');
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Fetch courses
  useEffect(() => {
    setLoading(true);
    setError('');
    axios
      .get('/api/courses', { baseURL: API_BASE })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.courses || [];
        setCourses(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load courses');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`${theme.shell} min-h-screen transition-colors duration-300 overflow-hidden`}>
      {/* Background blobs - only on desktop */}
      {!isMobile && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#FFA500] opacity-20 blur-3xl animate-blob" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-8 left-20 h-96 w-96 rounded-full bg-[#FFA500] opacity-20 blur-3xl" style={{ animationDelay: '4s' }} />
        </div>
      )}

      {/* Navigation */}
      <ResponsiveNavigation
        dark={dark}
        setDark={setDark}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onTeacherLogin={handleTeacherLogin}
        handleProfile={handleProfile}
        scrollToSection={scrollToSection}
        isMobile={isMobile}
      />

      {/* Spacer for sticky nav */}
      <div className="h-20" />

      {/* Hero */}
      <HeroSection theme={theme} isMobile={isMobile} onStart={handleStart} scrollToSection={scrollToSection} />

      {/* Features */}
      <FeaturesSection theme={theme} />

      {/* Courses */}
      <CoursesSection courses={courses} loading={loading} error={error} searchTerm={searchTerm} theme={theme} isMobile={isMobile} onCourseClick={handleCourseClick} />

      {/* Footer */}
      <Footer theme={theme} scrollToSection={scrollToSection} />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
}
