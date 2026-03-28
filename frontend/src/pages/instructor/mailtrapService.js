const nodemailer = require('nodemailer');

// Configure transporter for Mailtrap
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email with OTP
const sendVerificationEmail = async (email, name, otp) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@kompi-cyber.com',
    to: email,
    subject: 'Verify Your Instructor Account - KOMPI-CYBER',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">KOMPI-CYBER</h1>
          <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">Instructor Portal</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Welcome ${name}!</h2>
          <p style="color: #666; line-height: 1.6;">Your instructor account has been created. To complete the verification process, please use the following 6-digit code:</p>

          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; font-family: 'Courier New', monospace; letter-spacing: 4px;">${otp}</span>
            </div>
          </div>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">This verification code will expire in 10 minutes.</p>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">If you didn't create an instructor account, please ignore this email.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>KOMPI-CYBER Cybersecurity Learning Platform</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendVerificationEmail
};