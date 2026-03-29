/**
 * rbacCourseModel.js
 * Course model for the RBAC system.
 * Persists to Supabase (table: rbac_courses) when configured,
 * falls back to in-memory storage otherwise.
 */

const supabase = require('../config/superbase');

// Check if Supabase database client is available (not just the mock storage stub)
const useSupabase = () => supabase && typeof supabase.from === 'function';

// ── In-memory seed data ───────────────────────────────────────────────────────
let courses = [
  {
    id: 'course-001',
    title: 'Introduction to Cybersecurity',
    description: 'Covers fundamental cybersecurity concepts, threat landscape, and basic defense strategies.',
    createdBy: 'COORD001',
    instructors: ['LEC005'],
    students: [],
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'course-002',
    title: 'Network Security Fundamentals',
    description: 'Deep dive into network protocols, firewalls, IDS/IPS, and network threat modeling.',
    createdBy: 'COORD001',
    instructors: ['LEC001'],
    students: [],
    createdAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'course-003',
    title: 'Web Application Security',
    description: 'OWASP Top 10, SQL injection, XSS, CSRF, and secure coding practices.',
    createdBy: 'COORD002',
    instructors: ['LEC002'],
    students: [],
    createdAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'course-004',
    title: 'Incident Response & Forensics',
    description: 'Incident handling lifecycle, forensic tools, evidence collection, and recovery.',
    createdBy: 'COORD002',
    instructors: ['LEC003'],
    students: [],
    createdAt: new Date('2024-03-01').toISOString(),
  },
  {
    id: 'course-005',
    title: 'Linux for Security Professionals',
    description: 'Linux CLI, scripting, log analysis, and hardening techniques.',
    createdBy: 'COORD001',
    instructors: ['LEC004'],
    students: [],
    createdAt: new Date('2024-03-15').toISOString(),
  },
];

class RbacCourseModel {
  // ── CREATE ──────────────────────────────────────────────────────────────────

  async createCourse({ title, description, createdBy }) {
    const id = `course-${Date.now()}`;
    const now = new Date().toISOString();

    const course = {
      id,
      title,
      description,
      createdBy,        // coordinator employeeId
      instructors: [],
      students: [],
      createdAt: now,
    };

    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_courses')
        .insert([{ id, title, description, created_by: createdBy, instructors: [], students: [], created_at: now }])
        .select()
        .single();

      if (!error && data) {
        // Normalize Supabase snake_case → camelCase
        return this._normalize(data);
      }
      console.warn('[RbacCourseModel] Supabase insert failed, using in-memory:', error?.message);
    }

    courses.push(course);
    return course;
  }

  // ── READ ────────────────────────────────────────────────────────────────────

  async getAllCourses() {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data.map(this._normalize);
      console.warn('[RbacCourseModel] Supabase fetch failed, using in-memory:', error?.message);
    }
    return [...courses];
  }

  async getCourseById(id) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_courses')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return this._normalize(data);
    }
    return courses.find(c => c.id === id) || null;
  }

  // Get all courses a specific instructor is assigned to
  async getCoursesByInstructor(employeeId) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_courses')
        .select('*')
        .contains('instructors', [employeeId]);

      if (!error && data) return data.map(this._normalize);
    }
    return courses.filter(c => c.instructors.includes(employeeId));
  }

  // Get all courses created by a coordinator
  async getCoursesByCoordinator(employeeId) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_courses')
        .select('*')
        .eq('created_by', employeeId)
        .order('created_at', { ascending: false });

      if (!error && data) return data.map(this._normalize);
    }
    return courses.filter(c => c.createdBy === employeeId);
  }

  // ── ASSIGN INSTRUCTOR ───────────────────────────────────────────────────────

  async assignInstructor(courseId, instructorEmployeeId) {
    const course = await this.getCourseById(courseId);
    if (!course) return null;

    if (!course.instructors.includes(instructorEmployeeId)) {
      course.instructors.push(instructorEmployeeId);
    }

    if (useSupabase()) {
      await supabase
        .from('rbac_courses')
        .update({ instructors: course.instructors })
        .eq('id', courseId);
    }

    // Update in-memory too
    const idx = courses.findIndex(c => c.id === courseId);
    if (idx !== -1) courses[idx] = course;

    return course;
  }

  // ── STUDENTS ────────────────────────────────────────────────────────────────

  async addStudent(courseId, studentId) {
    const course = await this.getCourseById(courseId);
    if (!course) return null;

    if (!course.students.includes(String(studentId))) {
      course.students.push(String(studentId));
    }

    if (useSupabase()) {
      await supabase
        .from('rbac_courses')
        .update({ students: course.students })
        .eq('id', courseId);
    }

    const idx = courses.findIndex(c => c.id === courseId);
    if (idx !== -1) courses[idx] = course;

    return course;
  }

  async getCourseStudents(courseId) {
    const course = await this.getCourseById(courseId);
    return course ? course.students : [];
  }

  // ── PRIVATE HELPER ──────────────────────────────────────────────────────────

  _normalize(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      createdBy: row.created_by || row.createdBy,
      instructors: row.instructors || [],
      students: row.students || [],
      createdAt: row.created_at || row.createdAt,
    };
  }
}

module.exports = new RbacCourseModel();
