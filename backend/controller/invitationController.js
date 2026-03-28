const InvitationModel = require("../models/invitationModel");
const enrollmentModel = require("../models/enrollmentModel");
const courseModel = require("../models/courseModel");

class InvitationController {
  // POST /api/invitations/send - Teacher sends invitation
  static async sendInvitation(req, res) {
    try {
      const { courseId, studentEmail } = req.body;
      const teacherId = req.user.id;

      // Validation
      if (!courseId || !studentEmail) {
        return res.status(400).json({
          success: false,
          message: "Course ID and student email are required",
        });
      }

      // Check if teacher owns this course
      const course = await courseModel.findById(courseId);
      if (!course || course.created_by !== teacherId) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to invite students to this course",
        });
      }

      // Check if invitation already exists
      const existingInvitation =
        await InvitationModel.getPendingByEmailAndCourse(
          studentEmail,
          courseId,
        );
      if (existingInvitation) {
        return res.status(400).json({
          success: false,
          message: "An invitation for this email already exists",
        });
      }

      // Send invitation
      await InvitationModel.sendInvitation(courseId, teacherId, studentEmail);

      return res.status(201).json({
        success: true,
        message: `Invitation sent to ${studentEmail}`,
      });
    } catch (error) {
      console.error("Send invitation error:", error);
      return res.status(500).json({
        success: false,
        message: "Error sending invitation",
        error: error.message,
      });
    }
  }

  // GET /api/invitations - Get student's pending invitations
  static async getStudentInvitations(req, res) {
    try {
      const studentEmail = req.user.email;

      const invitations =
        await InvitationModel.getStudentInvitations(studentEmail);

      return res.status(200).json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      console.error("Get invitations error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching invitations",
        error: error.message,
      });
    }
  }

  // POST /api/invitations/:id/accept - Student accepts invitation
  static async acceptInvitation(req, res) {
    try {
      const invitationId = req.params.id;
      const studentId = req.user.id;
      const studentEmail = req.user.email;

      // Get invitation
      const invitation = await InvitationModel.getInvitationById(invitationId);
      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found",
        });
      }

      // Verify email matches
      if (invitation.student_email !== studentEmail) {
        return res.status(403).json({
          success: false,
          message: "This invitation is not for you",
        });
      }

      // Check if already responded
      if (invitation.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Invitation already ${invitation.status}`,
        });
      }

      // Accept invitation
      await InvitationModel.acceptInvitation(invitationId, studentId);

      // Auto-enroll student in course
      try {
        await enrollmentModel.enroll(studentId, invitation.course_id);
      } catch (enrollError) {
        // Student might already be enrolled, ignore
        console.log(
          "Enrollment error (maybe already enrolled):",
          enrollError.message,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Invitation accepted! You are now enrolled in the course",
        courseId: invitation.course_id,
      });
    } catch (error) {
      console.error("Accept invitation error:", error);
      return res.status(500).json({
        success: false,
        message: "Error accepting invitation",
        error: error.message,
      });
    }
  }

  // POST /api/invitations/:id/reject - Student rejects invitation
  static async rejectInvitation(req, res) {
    try {
      const invitationId = req.params.id;
      const studentEmail = req.user.email;

      // Get invitation
      const invitation = await InvitationModel.getInvitationById(invitationId);
      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found",
        });
      }

      // Verify email matches
      if (invitation.student_email !== studentEmail) {
        return res.status(403).json({
          success: false,
          message: "This invitation is not for you",
        });
      }

      // Check if already responded
      if (invitation.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Invitation already ${invitation.status}`,
        });
      }

      // Reject invitation
      await InvitationModel.rejectInvitation(invitationId);

      return res.status(200).json({
        success: true,
        message: "Invitation rejected",
      });
    } catch (error) {
      console.error("Reject invitation error:", error);
      return res.status(500).json({
        success: false,
        message: "Error rejecting invitation",
        error: error.message,
      });
    }
  }

  // GET /api/courses/:courseId/invitations - Teacher views invitations for a course
  static async getCourseInvitations(req, res) {
    try {
      const courseId = req.params.courseId;
      const teacherId = req.user.id;

      // Check if teacher owns this course
      const course = await courseModel.findById(courseId);
      if (!course || course.created_by !== teacherId) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to view invitations for this course",
        });
      }

      const invitations = await InvitationModel.getCourseInvitations(
        courseId,
        teacherId,
      );

      return res.status(200).json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      console.error("Get course invitations error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching invitations",
        error: error.message,
      });
    }
  }

  // DELETE /api/invitations/:id - Teacher cancels invitation
  static async cancelInvitation(req, res) {
    try {
      const invitationId = req.params.id;
      const teacherId = req.user.id;

      const result = await InvitationModel.cancelInvitation(
        invitationId,
        teacherId,
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found or already responded",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Invitation cancelled",
      });
    } catch (error) {
      console.error("Cancel invitation error:", error);
      return res.status(500).json({
        success: false,
        message: "Error cancelling invitation",
        error: error.message,
      });
    }
  }

  // POST /api/invitations/:id/resend - Teacher resends invitation
  static async resendInvitation(req, res) {
    try {
      const invitationId = req.params.id;
      const teacherId = req.user.id;

      const result = await InvitationModel.resendInvitation(
        invitationId,
        teacherId,
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found or already responded",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Invitation resent",
      });
    } catch (error) {
      console.error("Resend invitation error:", error);
      return res.status(500).json({
        success: false,
        message: "Error resending invitation",
        error: error.message,
      });
    }
  }
}

module.exports = InvitationController;
