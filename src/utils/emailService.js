/**
 * Email utility for sending emails via Nodemailer
 * Centralized email configuration
 */
import nodemailer from "nodemailer";

/**
 * Creates and configures the email transporter
 * Uses environment variables for secure configuration
 */
export function createEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Sends an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendEmail({ to, subject, html, text }) {
  const transporter = createEmailTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text: text || undefined, // Only include text if provided
  };

  return await transporter.sendMail(mailOptions);
}

/**
 * Sends a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Password reset link
 * @param {number} expiryMinutes - Minutes until link expires
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendPasswordResetEmail(to, resetLink, expiryMinutes = 15) {
  const { 
    createPasswordResetEmailTemplate, 
    createPasswordResetEmailPlainText 
  } = await import("./emailTemplates.js");

  const html = createPasswordResetEmailTemplate(resetLink, expiryMinutes);
  const text = createPasswordResetEmailPlainText(resetLink, expiryMinutes);

  return await sendEmail({
    to,
    subject: "Password Reset Request - Core2Cover",
    html,
    text,
  });
}

/**
 * Sends a password changed confirmation email
 * @param {string} to - Recipient email address
 * @returns {Promise} - Promise that resolves when email is sent
 */
export async function sendPasswordChangedEmail(to) {
  const { createPasswordChangedEmailTemplate } = await import("./emailTemplates.js");

  const html = createPasswordChangedEmailTemplate();

  return await sendEmail({
    to,
    subject: "Password Changed - Core2Cover",
    html,
  });
}
