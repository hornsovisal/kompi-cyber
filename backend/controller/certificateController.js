const certificateModel = require("../models/certificateModel");
const certificateService = require("../utils/certificateService");
const crypto = require("crypto");

class CertificateController {
  constructor() {
    this.model = certificateModel;
    this.service = certificateService;
  }

  /**
   * Generate a new certificate for course completion
   * POST /api/certificates/generate/:courseId
   */
  generateCertificate = async (req, res) => {
    try {
      const userId = req.user?.sub;
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Check if user has already received a certificate for this course
      const existingCert = await this.model.getCertificateByUserAndCourse(
        userId,
        courseId,
      );

      if (existingCert) {
        return res.status(200).json({
          message: "Certificate already exists",
          certificate: existingCert,
          certificateUrl: this.service.getPublicPath(
            existingCert.certificate_code,
          ),
        });
      }

      // Check if user has completed the course
      const isCompleted = await this.model.hasCourseCompletion(
        userId,
        courseId,
      );

      if (!isCompleted) {
        return res.status(403).json({
          message:
            "Course not completed. Complete all lessons to generate certificate.",
        });
      }

      // Get completion stats
      const stats = await this.model.getCourseCompletionStats(userId, courseId);

      // Generate unique certificate code
      const certificateCode = this.generateCertificateCode();

      // Create certificate record
      const certId = await this.model.createCertificate(
        userId,
        courseId,
        certificateCode,
      );

      // Get certificate data
      const certificateData = await this.model.getCertificateById(certId);

      // Generate PDF (returns Supabase public URL)
      const publicPath = await this.service.generateCertificate({
        userId: userId,
        studentName: certificateData.full_name,
        courseName: certificateData.title,
        certificateCode: certificateCode,
        issuedAt: certificateData.issued_at,
        courseLevel: certificateData.level || "Professional",
        stats: {
          completedLessons: stats.completed_lessons,
          totalLessons: stats.total_lessons,
          averageScore: stats.average_score,
        },
      });

      // Update certificate with Supabase URL
      await this.model.updateCertificatePdfPath(certId, publicPath);

      return res.status(201).json({
        message: "Certificate generated successfully",
        certificate: {
          id: certId,
          certificate_code: certificateCode,
          student_name: certificateData.full_name,
          course_name: certificateData.title,
          issued_at: certificateData.issued_at,
          pdf_path: publicPath,
        },
        certificateUrl: publicPath,
      });
    } catch (error) {
      console.error("Generate certificate error:", error.message);
      console.error("Full error:", error);
      return res.status(500).json({
        message: "Server error generating certificate",
        error: error.message,
      });
    }
  };

  /**
   * Get certificate for a user and course
   * GET /api/certificates/course/:courseId
   */
  getCertificate = async (req, res) => {
    try {
      const userId = req.user?.sub;
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const certificate = await this.model.getCertificateByUserAndCourse(
        userId,
        courseId,
      );

      if (!certificate) {
        return res.status(404).json({
          message: "Certificate not found",
          exists: false,
        });
      }

      return res.status(200).json({
        message: "Certificate found",
        certificate: {
          id: certificate.id,
          certificate_code: certificate.certificate_code,
          student_name: certificate.full_name,
          course_name: certificate.title,
          issued_at: certificate.issued_at,
          pdf_path: certificate.pdf_path,
        },
        certificateUrl: certificate.pdf_path,
        exists: true,
      });
    } catch (error) {
      console.error("Get certificate error:", error.message);
      console.error("Full error:", error);
      return res.status(500).json({
        message: "Server error fetching certificate",
        error: error.message,
      });
    }
  };

  /**
   * Get all certificates for the logged-in user
   * GET /api/certificates/my
   */
  getMyMyCertificates = async (req, res) => {
    try {
      const userId = req.user?.sub;

      const certificates = await this.model.getCertificatesByUserId(userId);

      return res.status(200).json({
        message: "Certificates retrieved",
        certificates: certificates.map((cert) => ({
          id: cert.id,
          certificate_code: cert.certificate_code,
          course_name: cert.title,
          course_level: cert.level,
          issued_at: cert.issued_at,
          pdf_path: cert.pdf_path,
        })),
      });
    } catch (error) {
      console.error("Get my certificates error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  /**
   * Check if course is completed and get status
   * GET /api/certificates/status/:courseId
   */
  getCompletionStatus = async (req, res) => {
    try {
      const userId = req.user?.sub;
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const isCompleted = await this.model.hasCourseCompletion(
        userId,
        courseId,
      );
      const stats = await this.model.getCourseCompletionStats(userId, courseId);
      const hasCertificate = !!(await this.model.getCertificateByUserAndCourse(
        userId,
        courseId,
      ));

      return res.status(200).json({
        completed: isCompleted,
        hasCertificate: hasCertificate,
        stats: {
          completedLessons: stats.completed_lessons || 0,
          totalLessons: stats.total_lessons || 0,
          averageScore: Math.round(stats.average_score || 0),
          highestScore: stats.highest_score || 0,
        },
      });
    } catch (error) {
      console.error("Get completion status error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  /**
   * Generate unique certificate code
   */
  generateCertificateCode() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `CYBER-${timestamp}-${randomStr}`.substring(0, 20);
  }
}

module.exports = new CertificateController();
