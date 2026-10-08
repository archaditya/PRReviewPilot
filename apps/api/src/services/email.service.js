const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  /**
   * Send transactional email using Brevo (Sendinblue) API v3
   */
  async sendEmail({ toEmail, toName, subject, htmlContent }) {
    if (!config.brevo.apiKey) {
      logger.warn({ toEmail, subject }, '[EMAIL] Brevo API Key not configured. Email suppressed.');
      return { simulated: true };
    }

    try {
      const payload = {
        sender: {
          name: config.brevo.senderName,
          email: config.brevo.senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail.split('@')[0],
          },
        ],
        subject,
        htmlContent,
      };

      const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
        headers: {
          'api-key': config.brevo.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      logger.info({ messageId: response.data?.messageId, toEmail }, '[EMAIL] Email sent via Brevo');
      return { success: true, messageId: response.data?.messageId };
    } catch (err) {
      logger.error(
        { err: err.response?.data || err.message, toEmail },
        '[EMAIL] Failed to send email via Brevo'
      );
      throw new Error(`Email delivery failed: ${err.response?.data?.message || err.message}`);
    }
  }

  /**
   * Send Password Reset Link
   */
  async sendPasswordResetEmail({ toEmail, toName, resetUrl }) {
    // Always log the reset URL for operational observability
    logger.info({ toEmail, resetUrl }, '[AUTH] Password reset requested. Reset URL generated.');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your PRReviewPilot Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #e2e8f0; }
    .card { max-width: 540px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 36px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .logo { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.025em; margin-bottom: 24px; }
    .logo span { color: #818cf8; }
    h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; }
    p { font-size: 14px; line-height: 1.6; color: #9ca3af; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; margin: 24px 0; }
    .footer { margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 16px; font-size: 12px; color: #6b7280; }
    .raw-link { word-break: break-all; color: #818cf8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">PR<span>Review</span>Pilot</div>
    <h1>Password Reset Request</h1>
    <p>Hello ${toName || 'there'},</p>
    <p>We received a request to reset the password for your PRReviewPilot account. Click the button below to choose a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
    </div>
    <p>This link is valid for <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email — your account remains secure.</p>
    <div class="footer">
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p class="raw-link">${resetUrl}</p>
      <p style="margin-top: 16px;">PRReviewPilot • Automated AI Code Reviews for GitHub & Bitbucket</p>
    </div>
  </div>
</body>
</html>
    `;

    return this.sendEmail({
      toEmail,
      toName,
      subject: 'Reset your PRReviewPilot password',
      htmlContent,
    });
  }
}

module.exports = new EmailService();
