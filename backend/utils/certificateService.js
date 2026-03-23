const PDFDocument = require("pdfkit");
const supabase = require("../config/superbase");

class CertificateService {
  constructor() {
    this.supabase = supabase;
    this.bucketName = "certificates";
  }

  /**
   * Generate a PDF certificate and upload to Supabase storage
   * @param {Object} data - Certificate data
   * @param {string} data.studentName - Name of student
   * @param {string} data.courseName - Name of course
   * @param {string} data.certificateCode - Unique certificate code
   * @param {Date} data.issuedAt - Issue date
   * @param {string} data.courseLevel - Course level (beginner/intermediate/advanced)
   * @param {Object} data.stats - Completion statistics
   * @param {number} data.stats.completedLessons - Number of lessons completed
   * @param {number} data.stats.totalLessons - Total lessons in course
   * @param {number} data.stats.averageScore - Average quiz score
   * @returns {string} Public URL of the generated PDF in Supabase
   */
  generateCertificate(data) {
    return new Promise((resolve, reject) => {
      try {
        const filename = `cert-${data.certificateCode}.pdf`;
        const chunks = [];

        const doc = new PDFDocument({
          size: "A4",
          margin: 0,
          bufferPages: true,
        });

        // Collect PDF data in chunks instead of writing to file
        doc.on("data", (chunk) => {
          chunks.push(chunk);
        });

        // Handle errors
        doc.on("error", (err) => {
          console.error("PDF Document error:", err);
          reject(err);
        });

        // BACKGROUND GRADIENT EFFECT (dark blue header)
        doc.rect(0, 0, 595, 150).fillColor("#003366").fill();

        // DECORATIVE TOP BORDER with accent colors
        doc.rect(0, 140, 595, 10).fillColor("#FF6B35").fill();
        doc.rect(0, 150, 595, 5).fillColor("#004B9D").fill();

        // LEFT ACCENT BAR
        doc.rect(0, 0, 20, 842).fillColor("#FF6B35").fill();

        // OUTER BORDER
        doc.lineWidth(3).strokeColor("#003366").rect(40, 60, 515, 722);

        // INNER ACCENT BORDER
        doc.lineWidth(1).strokeColor("#FF6B35").rect(45, 65, 505, 712);

        // DECORATIVE CIRCLES (top right)
        doc.circle(545, 85, 15).fillColor("#FF6B35").fill();
        doc.circle(545, 85, 10).fillColor("#003366").fill();
        doc.circle(545, 85, 5).fillColor("#FF6B35").fill();

        // HEADER TEXT - "CERTIFICATE OF ACHIEVEMENT"
        doc
          .font("Helvetica-Bold")
          .fontSize(52)
          .fillColor("#FFFFFF")
          .text("CERTIFICATE", 60, 75, {
            align: "center",
            width: 475,
            characterMargin: 5,
          });

        doc
          .fontSize(16)
          .fillColor("#FF6B35")
          .text("~ OF ACHIEVEMENT ~", 60, 135, {
            align: "center",
            width: 475,
          });

        // MAIN CONTENT SECTION
        // Separator line
        doc
          .lineWidth(2)
          .strokeColor("#004B9D")
          .moveTo(100, 180)
          .lineTo(495, 180)
          .stroke();

        // INTRODUCTORY TEXT
        doc
          .fontSize(14)
          .font("Helvetica")
          .fillColor("#333333")
          .text("This is to proudly certify that", 60, 210, {
            align: "center",
            width: 475,
          });

        // STUDENT NAME - LARGE AND PROMINENT
        doc
          .fontSize(42)
          .font("Helvetica-Bold")
          .fillColor("#003366")
          .text(data.studentName, 60, 260, {
            align: "center",
            width: 475,
            lineBreak: true,
          });

        // COMPLETION TEXT
        doc
          .fontSize(14)
          .font("Helvetica")
          .fillColor("#333333")
          .text(
            "has successfully completed the comprehensive training course",
            60,
            330,
            {
              align: "center",
              width: 475,
            },
          );

        // COURSE NAME - HIGHLIGHTED BOX
        doc.rect(60, 365, 475, 50).fillColor("#E8F0F7").fill();
        doc
          .fontSize(18)
          .font("Helvetica-Bold")
          .fillColor("#003366")
          .text(data.courseName, 70, 380, {
            align: "center",
            width: 455,
            lineBreak: true,
          });

        // DECORATIVE DIVIDER
        doc
          .moveTo(150, 430)
          .lineTo(445, 430)
          .strokeColor("#FF6B35")
          .lineWidth(2)
          .stroke();

        // ACHIEVEMENT DETAILS BOX
        doc
          .rect(70, 460, 455, 120)
          .lineWidth(1)
          .strokeColor("#004B9D")
          .stroke();

        const detailsY = 475;
        const colWidth = 227.5;

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#003366")
          .text("COURSE LEVEL", 80, detailsY);

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#111111")
          .text(
            data.courseLevel
              ? data.courseLevel.charAt(0).toUpperCase() +
                  data.courseLevel.slice(1)
              : "Professional",
            80,
            detailsY + 20,
          );

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#003366")
          .text("LESSONS COMPLETED", 80 + colWidth, detailsY);

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#111111")
          .text(
            `${data.stats?.completedLessons || 0}/${data.stats?.totalLessons || 0}`,
            80 + colWidth,
            detailsY + 20,
          );

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#003366")
          .text("AVERAGE SCORE", 80, detailsY + 50);

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#111111")
          .text(
            `${Math.round(data.stats?.averageScore || 0)}%`,
            80,
            detailsY + 70,
          );

        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#003366")
          .text("COMPLETION STATUS", 80 + colWidth, detailsY + 50);

        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor("#00AA00")
          .text("✓ COMPLETED", 80 + colWidth, detailsY + 70);

        // SIGNATURE AREA
        const sigY = 610;

        // Signature line
        doc
          .lineWidth(1)
          .strokeColor("#333333")
          .moveTo(100, sigY)
          .lineTo(220, sigY)
          .stroke();

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#333333")
          .text("Authorized Official", 100, sigY + 8, {
            width: 120,
            align: "center",
          });

        // Date line
        doc
          .lineWidth(1)
          .strokeColor("#333333")
          .moveTo(375, sigY)
          .lineTo(495, sigY)
          .stroke();

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#333333")
          .text(this.formatDate(data.issuedAt), 375, sigY + 8, {
            width: 120,
            align: "center",
          });

        // CERTIFICATE CODE AND FOOTER
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#888888")
          .text(`Certificate ID: ${data.certificateCode}`, 60, 680, {
            align: "center",
            width: 475,
          });

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor("#003366")
          .text("Kompi-Cyber Academy", 60, 710, {
            align: "center",
            width: 475,
          });

        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#666666")
          .text("Professional Cybersecurity Training Platform", 60, 730, {
            align: "center",
            width: 475,
          });

        // Issued date at bottom
        doc
          .fontSize(8)
          .fillColor("#999999")
          .text(`Issued: ${this.formatDate(data.issuedAt)}`, 60, 760, {
            align: "center",
            width: 475,
          });

        // Finalize PDF
        doc.end();

        doc.on("end", async () => {
          try {
            // Convert chunks to buffer
            const pdfBuffer = Buffer.concat(chunks);

            // Upload to Supabase storage
            const { data: uploadData, error: uploadError } =
              await this.supabase.storage
                .from(this.bucketName)
                .upload(filename, pdfBuffer, {
                  contentType: "application/pdf",
                  upsert: true,
                });

            if (uploadError) {
              console.error("Supabase upload error:", uploadError);
              reject(uploadError);
              return;
            }

            // Get public URL
            const { data: publicUrlData } = this.supabase.storage
              .from(this.bucketName)
              .getPublicUrl(filename);

            const publicUrl = publicUrlData.publicUrl;
            console.log(`Certificate uploaded to Supabase: ${publicUrl}`);
            resolve(publicUrl);
          } catch (error) {
            console.error("Error uploading certificate to Supabase:", error);
            reject(error);
          }
        });
      } catch (error) {
        console.error("Error generating certificate:", error);
        reject(error);
      }
    });
  }

  formatDate(date) {
    if (!date) date = new Date();
    if (typeof date === "string") date = new Date(date);

    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  // Get public URL from Supabase for a certificate
  async getPublicPath(certificateCode) {
    const filename = `cert-${certificateCode}.pdf`;
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filename);
    return data.publicUrl;
  }

  // Delete certificate from Supabase storage
  async deleteCertificate(certificateCode) {
    const filename = `cert-${certificateCode}.pdf`;
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filename]);

    if (error) {
      console.error("Error deleting certificate from Supabase:", error);
    }
  }
}

module.exports = new CertificateService();
