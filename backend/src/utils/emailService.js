import nodemailer from 'nodemailer';
import { generateToken } from '../middleware/auth.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send OTP email for verification
  async sendOTP(email, otp) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Email Verification - GoJob',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #007bff; font-size: 48px; text-align: center; letter-spacing: 8px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, error: error.message };
    }
  }

  // Send bulk emails
  async sendBulkEmails(emailData) {
    const results = [];
    
    for (const email of emailData) {
      try {
        const mailOptions = {
          from: email.from,
          to: email.to,
          cc: email.cc,
          bcc: email.bcc,
          subject: email.subject,
          html: email.content,
          attachments: email.attachments || []
        };

        const result = await this.transporter.sendMail(mailOptions);
        results.push({
          email: email.to,
          success: true,
          messageId: result.messageId,
          sentAt: new Date()
        });
      } catch (error) {
        results.push({
          email: email.to,
          success: false,
          error: error.message,
          sentAt: new Date()
        });
      }
    }

    return results;
  }

  // Send single email
  async sendEmail(emailData) {
    try {
      const mailOptions = {
        from: emailData.from,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        html: emailData.content,
        attachments: emailData.attachments || []
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Verify SMTP connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
