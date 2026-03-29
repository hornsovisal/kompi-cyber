/**
 * Refactored Home Page - Example of Responsive & Modular Architecture
 * Shows how to use the new component system
 * 
 * This is an example refactor. To apply: replace existing Home.jsx with this
 */

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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import responsive hooks
import { useResponsive } from '../hooks/useResponsive';

// Import base components
import {
  Button,
  Card,
  Input,
  Container,
  Section,
  Grid,
  Flex,
} from '../components/base';

// Import layout components
import {
  ResponsiveNav,
  HeroSection,
  ResponsiveFooter,
} from '../components/layouts/ResponsiveLayout';

// Import utilities
import {
  ThemeManager,
  useTheme,
} from '../utils/themeManager';
import {
  ResponsiveUtils,
  responsivePadding,
  responsiveText,
  responsiveGap,
  MobileFirst,
} from '../utils/responsiveUtils';

import { isAuthenticated } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Example Refactored Home Page Component
 */
export default function Home() {
  // Hooks
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [dark, setDark] = useState(true);
  const theme = useTheme(dark);
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Handlers
  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleStart = () => {
    handleNavigate(isAuthenticated() ? '/dashboard' : '/login');
  };

  const handleCourseClick = (courseId) => {
    handleNavigate(`/learn/${courseId}`);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch courses
  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/courses', { baseURL: API_BASE })
      .then((res) => {
        const courseData = Array.isArray(res.data)
          ? res.data
          : res.data?.courses || [];
        setCourses(courseData);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load courses');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) => {
      const title = String(course.title || '').toLowerCase();
      const description = String(course.description || '').toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [courses, searchTerm]);

  const featuredCourses = filteredCourses.slice(0, 6);

  // Navigation items
  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'features', label: 'Programs' },
    { id: 'about', label: 'About Us' },
  ];

  const navButtons = (
    <Flex gap={3}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleNavigate('/instructor/login')}
      >
        Teacher Login
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDark(!dark)}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </Flex>
  );

  return (
    <div className={`${theme.getColor('shell')} min-h-screen overflow-hidden transition-colors duration-300`}>
      {/* Background gradient */}
      {!isMobile && (
        <div className="fixed inset-0 -z-10">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-[#FFA500] opacity-20 blur-3xl animate-blob" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 h-96 w-96 rounded-full bg-[#FFA500] opacity-20 blur-3xl animation-delay-4000" />
        </div>
      )}

      {/* Navigation */}
      <ResponsiveNav
        brand="KOMPI-CYBER"
        navItems={navItems.map((item) => ({
          ...item,
          onClick: () => scrollToSection(item.id),
        }))}
        rightActions={navButtons}
        sticky
      />

      {/* Hero Section */}
      <Section id="hero" className="pt-20 md:pt-32">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-6"
          >
            <h1 className={responsiveText['4xl']}>
              Learn Cybersecurity the Right Way
            </h1>

            <p className={`${responsiveText.lg} text-gray-300`}>
              Master defensive security, ethical hacking, and network protection from industry
              experts. Join thousands of cybersecurity professionals.
            </p>

            {/* CTA Buttons */}
            <Flex direction={isMobile ? 'col' : 'row'} gap={3}>
              <Button
                variant="primary"
                size={isMobile ? 'md' : 'lg'}
                fullWidth={isMobile}
                onClick={handleStart}
              >
                Get Started Free
              </Button>
              <Button
                variant="secondary"
                size={isMobile ? 'md' : 'lg'}
                fullWidth={isMobile}
                onClick={() => scrollToSection('courses')}
              >
                Explore Courses
              </Button>
            </Flex>
          </motion.div>

          {/* Hero Image/Illustration */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center"
            >
              <div className="relative">
                <Shield className="h-64 w-64 text-[#FFA500] opacity-20" />
                <Cpu className="absolute inset-0 h-64 w-64 text-blue-500 opacity-10 animate-spin" />
              </div>
            </motion.div>
          )}
        </div>
      </Section>

      {/* Courses Section */}
      <Section id="courses">
        <h2 className={responsiveText['3xl']}>Available Courses</h2>
        <p className={`${responsiveText.lg} text-gray-300 mt-2 mb-8`}>
          Choose from our comprehensive cybersecurity courses
        </p>

        {/* Search bar */}
        {!isMobile && (
          <div className="mb-8 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3 text-[#FFA500]" size={18} />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <Grid cols={1} md={2} lg={3} gap={6}>
            {featuredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onMouseEnter={() => setHoveredCard(course.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card
                  hoverable
                  className={`cursor-pointer h-full flex flex-col justify-between ${
                    hoveredCard === course.id ? 'ring-2 ring-[#FFA500]' : ''
                  }`}
                  onClick={() => handleCourseClick(course.id)}
                >
                  {/* Course Header */}
                  <div>
                    <Flex justify="between" items="center" className="mb-4">
                      <h3 className={responsiveText.lg}>{course.title}</h3>
                      <Star className="text-[#FFA500]" size={20} />
                    </Flex>

                    <p className="text-gray-300 text-sm mb-4">{course.description}</p>

                    {/* Course Info */}
                    <Flex
                      direction={isMobile ? 'col' : 'row'}
                      gap={2}
                      className={`${responsiveText.xs} text-gray-400 mb-6`}
                    >
                      <span>📚 {course.module_count || 0} Modules</span>
                      <span>⏱️ {course.duration_hrs || 0}h</span>
                      <span>📊 {course.level || 'Beginner'}</span>
                    </Flex>
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleCourseClick(course.id)}
                  >
                    View Course <ChevronRight size={16} />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </Grid>
        )}
      </Section>

      {/* Features Section */}
      <Section id="features">
        <h2 className={responsiveText['3xl']}>Why Choose Us</h2>

        <Grid cols={1} md={2} lg={3} gap={8} className="mt-12">
          {[
            {
              icon: Shield,
              title: 'Industry Expert Instruction',
              description: 'Learn from cybersecurity professionals with years of real-world experience.',
            },
            {
              icon: Lock,
              title: 'Hands-On Labs',
              description: 'Practice with real-world scenarios in secure lab environments.',
            },
            {
              icon: Zap,
              title: 'Career Ready',
              description: 'Get certified and boost your cybersecurity career prospects.',
            },
          ].map((feature) => (
            <Card key={feature.title} className="text-center">
              <div className="flex justify-center mb-4">
                <feature.icon className="h-12 w-12 text-[#FFA500]" />
              </div>
              <h3 className={responsiveText.lg}>{feature.title}</h3>
              <p className="text-gray-400 mt-2">{feature.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Footer */}
      <ResponsiveFooter
        sections={[
          {
            title: 'Product',
            links: [
              { label: 'Courses', href: '#courses' },
              { label: 'Certifications', href: '#' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#about' },
              { label: 'Contact', href: '#' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '#' },
              { label: 'Terms', href: '#' },
            ],
          },
        ]}
      />
    </div>
  );
}
