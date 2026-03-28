const express = require("express");
const router = express.Router();
const InvitationController = require("../controller/invitationController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Teacher sends invitation to a student
router.post("/send", InvitationController.sendInvitation);

// Student gets their pending invitations
router.get("/", InvitationController.getStudentInvitations);

// Student accepts invitation
router.post("/:id/accept", InvitationController.acceptInvitation);

// Student rejects invitation
router.post("/:id/reject", InvitationController.rejectInvitation);

// Teacher views invitations for a course
router.get("/course/:courseId", InvitationController.getCourseInvitations);

// Teacher cancels an invitation
router.delete("/:id", InvitationController.cancelInvitation);

// Teacher resends an invitation
router.post("/:id/resend", InvitationController.resendInvitation);

module.exports = router;
