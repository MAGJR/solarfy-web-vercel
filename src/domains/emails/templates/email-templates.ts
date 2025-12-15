import { EmailType } from '../types/email-type.enum'

export interface EmailTemplateData {
  verificationUrl?: string
  resetPasswordUrl?: string
  userName?: string
  projectName?: string
  proposalName?: string
  installationDate?: string
  [key: string]: any
}

export const emailTemplates = {
  [EmailType.EMAIL_VERIFICATION]: {
    subject: 'Verify your email - Solarfy',
    htmlTemplate: (data: EmailTemplateData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f39c12; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #e67e22; color: white; text-decoration: none; border-radius: 4px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌞 Solarfy</h1>
            <p>Your solar energy partner</p>
          </div>
          <div class="content">
            <h2>Welcome to Solarfy!</h2>
            <p>Hello${data.userName ? ', ' + data.userName : ''}!</p>
            <p>Thank you for signing up for Solarfy. To complete your registration and activate your account, please click the button below to verify your email:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationUrl}" class="button">Verify Email</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #fff; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${data.verificationUrl}
            </p>
            <p><strong>Important:</strong> This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Solarfy. All rights reserved.</p>
            <p>If you did not sign up on our website, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textTemplate: (data: EmailTemplateData) => `
Welcome to Solarfy!

Hello${data.userName ? ', ' + data.userName : ''}!

Thank you for signing up for Solarfy. To complete your registration and activate your account, please access the link below:

${data.verificationUrl}

Important: This link will expire in 24 hours.

© 2025 Solarfy. All rights reserved.
If you did not sign up on our website, please ignore this email.
    `
  },

  [EmailType.PASSWORD_RESET]: {
    subject: 'Password Reset - Solarfy',
    htmlTemplate: (data: EmailTemplateData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #c0392b; color: white; text-decoration: none; border-radius: 4px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌞 Solarfy</h1>
            <p>Password Reset</p>
          </div>
          <div class="content">
            <h2>Reset your password</h2>
            <p>Hello${data.userName ? ', ' + data.userName : ''}!</p>
            <p>We received a request to reset your password. To create a new password, click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetPasswordUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #fff; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${data.resetPasswordUrl}
            </p>
            <p><strong>Important:</strong> This link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Solarfy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textTemplate: (data: EmailTemplateData) => `
Password Reset - Solarfy

Hello${data.userName ? ', ' + data.userName : ''}!

We received a request to reset your password. To create a new password, please access the link below:

${data.resetPasswordUrl}

Important: This link will expire in 1 hour.

If you did not request a password reset, please ignore this email.

© 2025 Solarfy. All rights reserved.
    `
  },

  [EmailType.WELCOME]: {
    subject: 'Welcome to Solarfy! 🌞',
    htmlTemplate: (data: EmailTemplateData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Solarfy</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #2ecc71; color: white; text-decoration: none; border-radius: 4px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌞 Solarfy</h1>
            <p>Welcome!</p>
          </div>
          <div class="content">
            <h2>We're very happy to have you with us!</h2>
            <p>Hello${data.userName ? ', ' + data.userName : ''}!</p>
            <p>Your registration has been successfully completed at Solarfy! Now you can:</p>
            <ul>
              <li>📊 Manage your customers</li>
              <li>☀️ Create solar energy projects</li>
              <li>📈 Generate detailed proposals</li>
              <li>🔧 Track installations</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/dashboard" class="button">Access Dashboard</a>
            </div>
            <p>If you have any questions, our support team is always available to help.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Solarfy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textTemplate: (data: EmailTemplateData) => `
Welcome to Solarfy! 🌞

Hello${data.userName ? ', ' + data.userName : ''}!

We're very happy to have you with us! Your registration has been successfully completed at Solarfy!

Now you can:
• Manage your customers
• Create solar energy projects
• Generate detailed proposals
• Track installations

Access your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/dashboard

If you have any questions, our support team is always available to help.

© 2025 Solarfy. All rights reserved.
    `
  }
}

export const getTemplate = (type: EmailType) => {
  return emailTemplates[type]
}

export const renderEmailContent = (type: EmailType, data: EmailTemplateData = {}) => {
  const template = getTemplate(type)
  if (!template) {
    throw new Error(`Email template not found for type: ${type}`)
  }

  return {
    subject: template.subject,
    htmlContent: template.htmlTemplate(data),
    textContent: template.textTemplate?.(data)
  }
}