/**
 * Email template utilities for password reset
 */

/**
 * Creates a professional HTML email template for password reset
 * @param {string} resetLink - The password reset link
 * @param {number} expiryMinutes - Minutes until link expires (default: 15)
 * @returns {string} - HTML email template
 */
export function createPasswordResetEmailTemplate(resetLink, expiryMinutes = 15) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Core2Cover</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 10px;
      padding: 30px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #007bff;
    }
    .header h1 {
      color: #007bff;
      margin: 0;
    }
    .content {
      padding: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background-color: #0056b3;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 14px;
    }
    .link-box {
      background-color: #e9ecef;
      padding: 15px;
      border-radius: 5px;
      word-break: break-all;
      margin: 15px 0;
      font-family: monospace;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset Request</h1>
    </div>
    
    <div class="content">
      <p>Hello,</p>
      
      <p>We received a request to reset your password for your Core2Cover account. Click the button below to set a new password:</p>
      
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      
      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <ul style="margin: 10px 0;">
          <li>This link will expire in <strong>${expiryMinutes} minutes</strong></li>
          <li>You can only use this link once</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
      </div>
      
      <p><strong>If the button doesn't work, copy and paste this link into your browser:</strong></p>
      <div class="link-box">${resetLink}</div>
      
      <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Core2Cover. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Creates a plain text version of the password reset email
 * @param {string} resetLink - The password reset link
 * @param {number} expiryMinutes - Minutes until link expires (default: 15)
 * @returns {string} - Plain text email
 */
export function createPasswordResetEmailPlainText(resetLink, expiryMinutes = 15) {
  return `
Password Reset Request - Core2Cover

Hello,

We received a request to reset your password for your Core2Cover account.

Click the link below to set a new password:
${resetLink}

SECURITY NOTICE:
- This link will expire in ${expiryMinutes} minutes
- You can only use this link once
- If you didn't request this, please ignore this email

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
© ${new Date().getFullYear()} Core2Cover. All rights reserved.
This is an automated message. Please do not reply to this email.
  `;
}

/**
 * Creates email template for password changed confirmation
 * @returns {string} - HTML email template
 */
export function createPasswordChangedEmailTemplate() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed - Core2Cover</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 10px;
      padding: 30px;
      margin: 20px 0;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #28a745;
    }
    .header h1 {
      color: #28a745;
      margin: 0;
    }
    .content {
      padding: 20px 0;
    }
    .success {
      background-color: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Password Changed Successfully</h1>
    </div>
    
    <div class="content">
      <p>Hello,</p>
      
      <div class="success">
        <strong>Your password has been changed successfully.</strong>
      </div>
      
      <p>This email confirms that the password for your Core2Cover account was recently changed.</p>
      
      <p><strong>If you made this change,</strong> no further action is required.</p>
      
      <p><strong>If you did NOT make this change,</strong> please contact our support team immediately as your account may have been compromised.</p>
      
      <p>Changed on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Core2Cover. All rights reserved.</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
}
