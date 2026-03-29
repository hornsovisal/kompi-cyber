const supabase = require('../config/superbase');

const useSupabase = () => supabase && typeof supabase.from === 'function';

let invitations = [];

class RbacInvitationModel {
  async createInvitation({ courseId, invitedBy, studentEmail, studentName = '' }) {
    const invitation = {
      id: `invite-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      courseId,
      invitedBy,
      studentEmail: studentEmail.toLowerCase(),
      studentName: studentName || '',
      status: 'pending',
      studentId: null,
      createdAt: new Date().toISOString(),
      respondedAt: null,
    };

    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_invitations')
        .insert([{
          id: invitation.id,
          course_id: invitation.courseId,
          invited_by: invitation.invitedBy,
          student_email: invitation.studentEmail,
          student_name: invitation.studentName,
          status: invitation.status,
          student_id: invitation.studentId,
          created_at: invitation.createdAt,
          responded_at: invitation.respondedAt,
        }])
        .select()
        .single();

      if (!error && data) {
        const normalized = this._normalize(data);
        invitations.unshift(normalized);
        return normalized;
      }
      console.warn('[RbacInvitationModel] Supabase insert failed, using in-memory:', error?.message);
    }

    invitations.unshift(invitation);
    return invitation;
  }

  async getInvitationById(id) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_invitations')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return this._normalize(data);
    }

    return invitations.find(invitation => invitation.id === id) || null;
  }

  async getPendingByEmailAndCourse(studentEmail, courseId) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_invitations')
        .select('*')
        .eq('student_email', studentEmail.toLowerCase())
        .eq('course_id', courseId)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle();

      if (!error && data) return this._normalize(data);
    }

    return invitations.find(
      invitation => invitation.studentEmail === studentEmail.toLowerCase()
        && invitation.courseId === courseId
        && invitation.status === 'pending',
    ) || null;
  }

  async getCourseInvitations(courseId) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_invitations')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (!error && data) return data.map(row => this._normalize(row));
    }

    return invitations
      .filter(invitation => invitation.courseId === courseId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getStudentInvitations(studentEmail) {
    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_invitations')
        .select('*')
        .eq('student_email', studentEmail.toLowerCase())
        .order('created_at', { ascending: false });

      if (!error && data) return data.map(row => this._normalize(row));
    }

    return invitations
      .filter(invitation => invitation.studentEmail === studentEmail.toLowerCase())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateInvitation(id, updates) {
    const invitation = await this.getInvitationById(id);
    if (!invitation) return null;

    const next = { ...invitation, ...updates };

    if (useSupabase()) {
      const { data, error } = await supabase
        .from('rbac_invitations')
        .update({
          status: next.status,
          student_id: next.studentId,
          responded_at: next.respondedAt,
          created_at: next.createdAt,
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const normalized = this._normalize(data);
        const idx = invitations.findIndex(item => item.id === id);
        if (idx !== -1) invitations[idx] = normalized;
        return normalized;
      }
      console.warn('[RbacInvitationModel] Supabase update failed, using in-memory:', error?.message);
    }

    const idx = invitations.findIndex(item => item.id === id);
    if (idx !== -1) invitations[idx] = next;
    return next;
  }

  async acceptInvitation(id, studentId) {
    return this.updateInvitation(id, {
      status: 'accepted',
      studentId,
      respondedAt: new Date().toISOString(),
    });
  }

  async rejectInvitation(id) {
    return this.updateInvitation(id, {
      status: 'rejected',
      respondedAt: new Date().toISOString(),
    });
  }

  async resendInvitation(id) {
    return this.updateInvitation(id, {
      status: 'pending',
      createdAt: new Date().toISOString(),
      respondedAt: null,
    });
  }

  async cancelInvitation(id) {
    const invitation = await this.getInvitationById(id);
    if (!invitation) return false;

    if (useSupabase()) {
      const { error } = await supabase
        .from('rbac_invitations')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('[RbacInvitationModel] Supabase delete failed, using in-memory:', error?.message);
      }
    }

    invitations = invitations.filter(item => item.id !== id);
    return true;
  }

  _normalize(row) {
    return {
      id: row.id,
      courseId: row.course_id || row.courseId,
      invitedBy: row.invited_by || row.invitedBy,
      studentEmail: row.student_email || row.studentEmail,
      studentName: row.student_name || row.studentName || '',
      status: row.status,
      studentId: row.student_id || row.studentId || null,
      createdAt: row.created_at || row.createdAt,
      respondedAt: row.responded_at || row.respondedAt || null,
    };
  }
}

module.exports = new RbacInvitationModel();