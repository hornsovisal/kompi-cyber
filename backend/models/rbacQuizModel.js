/**
 * rbacQuizModel.js
 * Quiz model for RBAC quiz management (open / close / create).
 * Persists to Supabase (table: rbac_quizzes) when configured,
 * falls back to in-memory storage otherwise.
 */

const supabase = require('../config/superbase');

const useSupabase = () => supabase && typeof supabase.from === 'function';

// ── In-memory seed quizzes ────────────────────────────────────────────────────
let quizzes = [
  {
    id: 'quiz-001',
    title: 'CIA Triad Concepts',
    courseId: 'course-001',
    dueDate: '2026-04-10',
    dueTime: '23:59',
    status: 'open',
    createdBy: 'LEC005',
    createdAt: new Date('2026-03-01').toISOString(),
  },
  {
    id: 'quiz-002',
    title: 'Network Protocols Quiz',
    courseId: 'course-002',
    dueDate: '2026-04-15',
    dueTime: '18:00',
    status: 'closed',
    createdBy: 'LEC001',
    createdAt: new Date('2026-03-05').toISOString(),
  },
  {
    id: 'quiz-003',
    title: 'OWASP Top 10 Assessment',
    courseId: 'course-003',
    dueDate: '2026-04-20',
    dueTime: '20:00',
    status: 'open',
    createdBy: 'LEC002',
    createdAt: new Date('2026-03-10').toISOString(),
  },
];

class RbacQuizModel {
  // ── CREATE ──────────────────────────────────────────────────────────────────

  async createQuiz({ title, courseId, dueDate, dueTime, createdBy }) {
    const id = `quiz-${Date.now()}`;
    const now = new Date().toISOString();

    const quiz = {
      id,
      title,
      courseId,
      dueDate,
      dueTime,
      status: 'closed',   // newly created quizzes start as closed
      createdBy,
      createdAt: now,
    };

    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_quizzes')
        .insert([{
          id,
          title,
          course_id: courseId,
          due_date: dueDate,
          due_time: dueTime,
          status: 'closed',
          created_by: createdBy,
          created_at: now,
        }])
        .select()
        .single();

      if (!error && data) return this._normalize(data);
      console.warn('[RbacQuizModel] Supabase insert failed, using in-memory:', error?.message);
    }

    quizzes.push(quiz);
    return quiz;
  }

  // ── READ ────────────────────────────────────────────────────────────────────

  async getAllQuizzes() {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data.map(this._normalize);
    }
    return [...quizzes];
  }

  async getById(id) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return this._normalize(data);
    }
    return quizzes.find(q => q.id === id) || null;
  }

  async getByCourse(courseId) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (!error && data) return data.map(this._normalize);
    }
    return quizzes.filter(q => q.courseId === courseId);
  }

  async getByInstructor(instructorEmployeeId) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_quizzes')
        .select('*')
        .eq('created_by', instructorEmployeeId)
        .order('created_at', { ascending: false });

      if (!error && data) return data.map(this._normalize);
    }
    return quizzes.filter(q => q.createdBy === instructorEmployeeId);
  }

  // ── STATUS TOGGLE ───────────────────────────────────────────────────────────

  async setStatus(id, status) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_quizzes')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        // Keep in-memory in sync
        const idx = quizzes.findIndex(q => q.id === id);
        if (idx !== -1) quizzes[idx].status = status;
        return this._normalize(data);
      }
    }

    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) return null;
    quiz.status = status;
    return { ...quiz };
  }

  async openQuiz(id)  { return this.setStatus(id, 'open');   }
  async closeQuiz(id) { return this.setStatus(id, 'closed'); }

  // ── PRIVATE HELPER ──────────────────────────────────────────────────────────

  _normalize(row) {
    return {
      id:        row.id,
      title:     row.title,
      courseId:  row.course_id  || row.courseId,
      dueDate:   row.due_date   || row.dueDate,
      dueTime:   row.due_time   || row.dueTime,
      status:    row.status,
      createdBy: row.created_by || row.createdBy,
      createdAt: row.created_at || row.createdAt,
    };
  }
}

module.exports = new RbacQuizModel();
