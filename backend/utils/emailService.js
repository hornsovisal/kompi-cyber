const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/lecturer/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@kompi-cyber.com',
    to: email,
    subject: 'Verify Your Lecturer Email - Kompi-Cyber',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Kompi-Cyber</h1>
          <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">Lecturer Portal</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Welcome to the Lecturer Portal!</h2>
          <p style="color: #666; line-height: 1.6;">Thank you for joining Kompi-Cyber as a lecturer. To complete your registration and access the lecturer dashboard, please verify your email address.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px; color: #333; font-size: 14px;">${verificationUrl}</p>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">This verification link will expire in 24 hours.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>If you didn't create a lecturer account with Kompi-Cyber, please ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Lecturer verification email sent to:', email);
  } catch (error) {
    console.error('Error sending lecturer verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/lecturer/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@kompi-cyber.com',
    to: email,
    subject: 'Reset Your Lecturer Password - Kompi-Cyber',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Kompi-Cyber</h1>
          <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">Lecturer Portal</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">We received a request to reset your lecturer account password. Click the button below to create a new password.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>

          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px; color: #333; font-size: 14px;">${resetUrl}</p>

          <p style="color: #999; font-size: 14px; margin-top: 30px;">This password reset link will expire in 1 hour for security reasons.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>For security reasons, this link can only be used once.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Lecturer password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending lecturer password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};