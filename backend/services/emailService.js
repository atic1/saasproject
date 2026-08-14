const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL || 'ankitadhikari48@gmail.com',
    pass: (process.env.SMTP_PASS || 'wgsjxtabgomgwbqn')
  }
});

const sendCongratulatoryEmail = async (email, businessName, ownerName) => {
  const mailOptions = {
    from: `"BizNepal Support" <${process.env.SMTP_EMAIL || 'ankitadhikari48@gmail.com'}>`,
    to: email,
    subject: `Congratulations on registering ${businessName}! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #fafafa;">
        <h2 style="color: #6d28d9; text-align: center;">Welcome to BizNepal SaaS! 🚀</h2>
        <p>Dear <strong>${ownerName}</strong>,</p>
        <p>Congratulations! Your business <strong>${businessName}</strong> has been successfully registered on the BizNepal SaaS platform.</p>
        <p style="margin-top: 15px;">Your application is currently under review by our super administrators. We will verify your document and details shortly.</p>
        <p>Once verified, you will receive another email and get full access to your business dashboard.</p>
        <br />
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #6d28d9; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #1f2937;">Registration Details:</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Business Name:</strong> ${businessName}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Owner:</strong> ${ownerName}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Status:</strong> Awaiting Review</p>
        </div>
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #eaeaea; padding-top: 10px;">
          If you have any questions, feel free to reply to this email.<br />
          &copy; 2026 BizNepal. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Congratulatory email sent to", email, info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send congratulatory email:", error);
    throw error;
  }
};

const sendVerificationEmail = async (email, businessName) => {
  const mailOptions = {
    from: `"BizNepal Support" <${process.env.SMTP_EMAIL || 'ankitadhikari48@gmail.com'}>`,
    to: email,
    subject: `Your business ${businessName} has been verified! 🌟`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
        <h2 style="color: #10b981; text-align: center;">Registration Approved! 🎉</h2>
        <p>Hello,</p>
        <p>Great news! Your business <strong>${businessName}</strong> has been verified by the super admin.</p>
        <p>You can now access your business dashboard to manage bookings, plans, pos billing, and more.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #6d28d9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
        </div>
        <p>Thank you for choosing BizNepal to grow your business.</p>
        <br />
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #eaeaea; padding-top: 10px;">
          If you have any questions, feel free to reply to this email.<br />
          &copy; 2026 BizNepal. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent to", email, info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send verification approval email:", error);
    throw error;
  }
};

module.exports = {
  sendCongratulatoryEmail,
  sendVerificationEmail
};
