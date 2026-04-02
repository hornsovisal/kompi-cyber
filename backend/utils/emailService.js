// Email service using direct verification links
// Note: Railway blocks SMTP, so we use direct link verification instead
// Users can click the verification link or copy it to their browser

const emailServiceActive = false; // SMTP is blocked on Railway, use direct links instead

const generateVerificationLink = (token) => {
  return `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
};

const sendVerificationEmail = async (email, token) => {
  const verificationLink = generateVerificationLink(token);

  // NOTE: Email sending is disabled because Railway blocks SMTP.
  // Instead, we return the verification link directly to the frontend.
  // The frontend will automatically redirect users to this link.

  console.log("\n[VERIFICATION LINK GENERATED]");
  console.log("Email:", email);
  console.log("Verification Link:", verificationLink);
  console.log("User will be redirected to this link to verify their email.\n");

  // Return the link for frontend to redirect user to it
  return {
    delivered: false,
    url: verificationLink,
    message: "Verification link ready. Redirecting you now...",
  };
};

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  // NOTE: Email sending is disabled because Railway blocks SMTP.
  // Instead, we return the reset link directly to the frontend.

  console.log("\n[PASSWORD RESET LINK GENERATED]");
  console.log("Email:", email);
  console.log("Reset Link:", resetLink);
  console.log("User must click the link above to reset their password.\n");

  // Return the link for frontend to redirect user to it
  return {
    delivered: false,
    url: resetLink,
    message: "Password reset link ready.",
  };
};

module.exports = {
  emailServiceActive,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
