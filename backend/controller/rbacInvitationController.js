const RbacInvitationModel = require('../models/rbacInvitationModel');
const RbacCourseModel = require('../models/rbacCourseModel');
const LecturerModel = require('../models/IntructorModel');
const StudentModel = require('../models/studentModel');

const enrichInvitation = async (invitation) => {
  const [course, lecturer] = await Promise.all([
    RbacCourseModel.getCourseById(invitation.courseId),
    LecturerModel.findLecturerByEmployeeId(invitation.invitedBy),
  ]);

  return {
    ...invitation,
    courseTitle: course?.title || 'Unknown Course',
    courseDescription: course?.description || '',
    invitedByName: lecturer?.name || invitation.invitedBy,
  };
};

const ensureCourseAccess = async (req, courseId) => {
  const course = await RbacCourseModel.getCourseById(courseId);
  if (!course) return { error: { code: 404, message: 'Course not found.' } };

  if (req.user.role === 'coordinator') return { course };

  if (req.user.role === 'instructor' && course.instructors.includes(req.user.employeeId)) {
    return { course };
  }

  return { error: { code: 403, message: 'You are not assigned to this course.' } };
};

const sendInvitation = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Student email is required.' });
    }

    const { course, error } = await ensureCourseAccess(req, courseId);
    if (error) return res.status(error.code).json({ success: false, message: error.message });

    const normalizedEmail = email.trim().toLowerCase();
    const student = StudentModel.findByEmail(normalizedEmail);
    if (student?.enrolledCourses?.includes(courseId)) {
      return res.status(400).json({ success: false, message: 'Student is already enrolled in this course.' });
    }

    const existing = await RbacInvitationModel.getPendingByEmailAndCourse(normalizedEmail, courseId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A pending invitation already exists for this student.' });
    }

    const invitation = await RbacInvitationModel.createInvitation({
      courseId,
      invitedBy: req.user.employeeId,
      studentEmail: normalizedEmail,
      studentName: String(name || '').trim(),
    });

    return res.status(201).json({
      success: true,
      data: await enrichInvitation(invitation),
      message: `Invitation sent to ${normalizedEmail}.`,
    });
  } catch (err) {
    console.error('[rbacInvitationController] sendInvitation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send invitation.' });
  }
};

const getCourseInvitations = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { error } = await ensureCourseAccess(req, courseId);
    if (error) return res.status(error.code).json({ success: false, message: error.message });

    const invitations = await RbacInvitationModel.getCourseInvitations(courseId);
    const enriched = await Promise.all(invitations.map(enrichInvitation));
    return res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('[rbacInvitationController] getCourseInvitations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch invitations.' });
  }
};

const resendInvitation = async (req, res) => {
  try {
    const invitation = await RbacInvitationModel.getInvitationById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    const { error } = await ensureCourseAccess(req, invitation.courseId);
    if (error) return res.status(error.code).json({ success: false, message: error.message });

    const updated = await RbacInvitationModel.resendInvitation(invitation.id);
    return res.json({ success: true, data: await enrichInvitation(updated), message: 'Invitation resent successfully.' });
  } catch (err) {
    console.error('[rbacInvitationController] resendInvitation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to resend invitation.' });
  }
};

const cancelInvitation = async (req, res) => {
  try {
    const invitation = await RbacInvitationModel.getInvitationById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    const { error } = await ensureCourseAccess(req, invitation.courseId);
    if (error) return res.status(error.code).json({ success: false, message: error.message });

    await RbacInvitationModel.cancelInvitation(invitation.id);
    return res.json({ success: true, message: 'Invitation cancelled successfully.' });
  } catch (err) {
    console.error('[rbacInvitationController] cancelInvitation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel invitation.' });
  }
};

const getMyInvitations = async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Authenticated email is required.' });
    }

    const invitations = await RbacInvitationModel.getStudentInvitations(email);
    const enriched = await Promise.all(invitations.map(enrichInvitation));
    return res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('[rbacInvitationController] getMyInvitations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch invitations.' });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const invitation = await RbacInvitationModel.getInvitationById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    if ((invitation.studentEmail || '').toLowerCase() !== (req.user?.email || '').toLowerCase()) {
      return res.status(403).json({ success: false, message: 'This invitation does not belong to you.' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Invitation already ${invitation.status}.` });
    }

    const student = StudentModel.createOrGetStudent(req.user.email, invitation.studentName);
    StudentModel.enrollInCourse(student.id, invitation.courseId);
    await RbacCourseModel.addStudent(invitation.courseId, student.id);
    const updated = await RbacInvitationModel.acceptInvitation(invitation.id, student.id);

    return res.json({
      success: true,
      data: await enrichInvitation(updated),
      message: 'Invitation accepted. You are now enrolled in the course.',
    });
  } catch (err) {
    console.error('[rbacInvitationController] acceptInvitation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to accept invitation.' });
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const invitation = await RbacInvitationModel.getInvitationById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    if ((invitation.studentEmail || '').toLowerCase() !== (req.user?.email || '').toLowerCase()) {
      return res.status(403).json({ success: false, message: 'This invitation does not belong to you.' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Invitation already ${invitation.status}.` });
    }

    const updated = await RbacInvitationModel.rejectInvitation(invitation.id);
    return res.json({ success: true, data: await enrichInvitation(updated), message: 'Invitation rejected.' });
  } catch (err) {
    console.error('[rbacInvitationController] rejectInvitation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reject invitation.' });
  }
};

module.exports = {
  sendInvitation,
  getCourseInvitations,
  resendInvitation,
  cancelInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
};