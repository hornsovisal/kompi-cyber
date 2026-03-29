const supabase = require("../config/superbase");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Upload certificate file to Supabase Storage
 * @param {string} userId - User ID
 * @param {Buffer} file - File buffer/content
 * @param {string} fileName - File name with extension
 * @returns {Promise<string>} Public URL of uploaded file
 */
async function uploadCertificate(userId, file, fileName) {
  const filePath = `${userId}/${fileName}`; // e.g. "user_123/cert_abc.pdf"

  const { data, error } = await supabase.storage
    .from("certificates")
    .upload(filePath, file, {
      contentType: "application/pdf",
      upsert: true, // overwrite if exists
    });

  if (error) throw error;

  // Get the public URL after upload
  const { data: publicUrlData } = supabase.storage
    .from("certificates")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Generate a certificate PDF with course completion details
 * @param {Object} certificateData - Certificate information
 * @returns {Promise<string>} Public URL of generated certificate
 */
async function generateCertificate(certificateData) {
  const {
    studentName,
    courseName,
    certificateCode,
    issuedAt,
    courseLevel,
    stats,
  } = certificateData;

  // Create PDF document
  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
  });

  // Convert PDF to buffer
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // ============ BACKGROUND & BORDERS ============
  // Cream/off-white background
  doc.rect(0, 0, 595, 842).fill("#FAFAF8");

  // Top decorative bar (blue from logo)
  doc.rect(0, 0, 595, 80).fill("#378ADD");

  // Bottom decorative bar (amber from logo)
  doc.rect(0, 820, 595, 22).fill("#EF9F27");

  // Left & right borders
  doc.rect(0, 0, 595, 842).strokeColor("#0C447C").lineWidth(3).stroke();

  // ============ HEADER SECTION ============
  // Try to load and add logo image
  try {
    const logoPath = path.join(
      __dirname,
      "../../frontend/src/assets/logos/logo-blue.svg",
    );
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 35, 15, { width: 50, height: 50 });
    }
  } catch (err) {
    console.log("Logo image not found, using text fallback");
  }

  // Logo text (text-based shield logo)
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#FFFFFF");
  doc.text("KOMPI CYBER", 100, 30, { align: "left", width: 400 });
  doc.fontSize(9).font("Helvetica").fillColor("#E8F1FA");
  doc.text("CYBERSECURITY EDUCATION PLATFORM", 100, 48, {
    align: "left",
    width: 400,
  });

  // ============ MAIN CONTENT ============
  const mainY = 120;

  // Title
  doc.fontSize(42).font("Helvetica-Bold").fillColor("#0C447C");
  doc.text("Certificate", 50, mainY, { width: 495, align: "center" });
  doc.fontSize(18).font("Helvetica").fillColor("#378ADD");
  doc.text("of Completion", 50, mainY + 48, { width: 495, align: "center" });

  // Decorative line under title
  doc
    .moveTo(150, mainY + 75)
    .lineTo(445, mainY + 75)
    .strokeColor("#EF9F27")
    .lineWidth(2)
    .stroke();

  // Main text
  doc.moveDown(3);
  doc.fontSize(13).font("Helvetica").fillColor("#333333");
  doc.text("This certificate is proudly presented to", 50, mainY + 100, {
    width: 495,
    align: "center",
  });

  // Student name (prominent)
  doc.fontSize(32).font("Helvetica-Bold").fillColor("#0C447C");
  doc.text(studentName, 50, mainY + 130, { width: 495, align: "center" });

  // Decorative underline for name
  doc
    .moveTo(100, mainY + 168)
    .lineTo(495, mainY + 168)
    .strokeColor("#378ADD")
    .lineWidth(1.5)
    .stroke();

  // Achievement text
  doc.fontSize(12).font("Helvetica").fillColor("#555555");
  doc.text("for successfully completing the course", 50, mainY + 185, {
    width: 495,
    align: "center",
  });

  doc.fontSize(18).font("Helvetica-Bold").fillColor("#0C447C");
  doc.text(courseName, 50, mainY + 210, {
    width: 495,
    align: "center",
  });

  // Course details box
  const boxY = mainY + 260;
  doc.rect(60, boxY, 475, 110).fillColor("#F0F5FB").fill();
  doc.rect(60, boxY, 475, 110).strokeColor("#378ADD").lineWidth(1.5).stroke();

  // Calculate completion percentage
  const completionPercentage =
    stats.totalLessons > 0
      ? Math.round((stats.completedLessons / stats.totalLessons) * 100)
      : 0;

  doc.fontSize(11).font("Helvetica-Bold").fillColor("#0C447C");
  doc.text(
    `Completed by: ${completionPercentage}% (${stats.completedLessons}/${stats.totalLessons} Lessons)`,
    75,
    boxY + 12,
    { width: 445, align: "left" },
  );

  doc.fontSize(10).font("Helvetica").fillColor("#378ADD");
  doc.text(`Level: ${courseLevel || "Beginner"}`, 75, boxY + 32, {
    width: 445,
    align: "left",
  });

  if (stats.averageScore && typeof stats.averageScore === "number") {
    doc.text(
      `Achievement Score: ${stats.averageScore.toFixed(1)}%`,
      75,
      boxY + 50,
      {
        width: 445,
        align: "left",
      },
    );
    doc.text(`Duration: ${stats.duration || "Self-paced"}`, 75, boxY + 68, {
      width: 445,
      align: "left",
    });
  } else {
    doc.text(`Duration: ${stats.duration || "Self-paced"}`, 75, boxY + 50, {
      width: 445,
      align: "left",
    });
  }

  // ============ FOOTER SECTION ============
  const footerY = 700;

  // Certificate code and date
  doc.fontSize(9).font("Helvetica").fillColor("#666666");
  doc.text(`Certificate Code: ${certificateCode}`, 50, footerY, {
    width: 245,
    align: "center",
  });
  doc.text(`Issued: ${new Date(issuedAt).toLocaleDateString()}`, 300, footerY, {
    width: 245,
    align: "center",
  });

  // Decorative seal (simple geometric design)
  const sealX = 60;
  const sealY = footerY + 30;
  doc.circle(sealX, sealY, 25).strokeColor("#EF9F27").lineWidth(2).stroke();
  doc.circle(sealX, sealY, 20).strokeColor("#EF9F27").lineWidth(1).stroke();
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#EF9F27");
  doc.text("★", sealX - 5, sealY - 8);

  // Signature line
  doc
    .moveTo(300, footerY + 65)
    .lineTo(500, footerY + 65)
    .strokeColor("#378ADD")
    .lineWidth(1)
    .stroke();
  doc.fontSize(9).font("Helvetica").fillColor("#666666");
  doc.text("Authorized by KOMPI Cyber Platform", 300, footerY + 70, {
    width: 200,
    align: "center",
  });

  // ============ DISCLAIMER ============
  doc.fontSize(8).font("Helvetica").fillColor("#999999");
  doc.text(
    "This certificate acknowledges successful completion and represents the educational achievement of the bearer.",
    50,
    footerY + 110,
    { width: 495, align: "center" },
  );

  // End the document
  doc.end();

  // Wait for PDF to be fully written
  return new Promise((resolve, reject) => {
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      try {
        // Generate unique filename
        const fileName = `${certificateCode}_${Date.now()}.pdf`;
        const userId = certificateData.userId || "system";

        // Upload to Supabase
        const publicUrl = await uploadCertificate(userId, pdfBuffer, fileName);
        resolve(publicUrl);
      } catch (error) {
        reject(error);
      }
    });

    doc.on("error", reject);
  });
}

/**
 * Get the public URL for a certificate
 * @param {string} certificateCode - Certificate code
 * @returns {string} Public URL path
 */
function getPublicPath(certificateCode) {
  // This constructs the URL pattern based on Supabase storage structure
  // The actual URL will be built from the generateCertificate function
  if (!certificateCode) {
    throw new Error("Certificate code is required");
  }
  return certificateCode;
}

module.exports = {
  uploadCertificate,
  generateCertificate,
  getPublicPath,
};
