// Email service using direct verification links
// Note: Railway blocks SMTP, so we use direct link verification instead
// Users can click the verification link or copy it to their browser

const emailServiceActive = false; // SMTP is blocked on Railway, use direct links instead

const generateVerificationLink = (token) => {
  return `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
};

const sendVerificationEmail = async (email, token) => {
  const verificationLink = generateVerificationLink(token);

  console.log("\n[EMAIL VERIFICATION]");
  console.log("Email:", email);
  console.log("Verification Link:", verificationLink);
  console.log("User must click the link above to verify their email.\n");

  // Return the link so frontend can display it
  return {
    delivered: false,
    url: verificationLink,
    message:
      "Verification link generated. Click the link below to verify your email.",
  };
};

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  console.log("\n[PASSWORD RESET]");
  console.log("Email:", email);
  console.log("Reset Link:", resetLink);
  console.log("User must click the link above to reset their password.\n");

  // Return the link so frontend can display it
  return {
    delivered: false,
    url: resetLink,
    message:
      "Password reset link generated. Click the link below to reset your password.",
  };
};

module.exports = {
  emailServiceActive,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
