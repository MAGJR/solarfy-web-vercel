import { IEmailService, SendInviteEmailData } from '@/domains/emails/services/email.service.interface'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export class ResendEmailService implements IEmailService {
  async sendInviteEmail(data: SendInviteEmailData): Promise<void> {
    try {
      const { data: result, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@solarfy.com',
        to: [data.to],
        subject: `You're invited to join ${data.inviterName}'s team`,
        html: this.generateInviteEmailHtml(data),
        text: this.generateInviteEmailText(data),
      })

      if (error) {
        console.error('Error sending invitation email:', error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log('✅ Invitation email sent successfully:', result)
    } catch (error) {
      console.error('Error sending invitation email:', error)
      throw error
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    try {
      const { data: result, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@solarfy.com',
        to: [to],
        subject: 'Reset your password',
        html: this.generatePasswordResetEmailHtml(resetUrl),
        text: this.generatePasswordResetEmailText(resetUrl),
      })

      if (error) {
        console.error('Error sending password reset email:', error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log('✅ Password reset email sent successfully:', result)
    } catch (error) {
      console.error('Error sending password reset email:', error)
      throw error
    }
  }

  async sendEmailVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    try {
      const { data: result, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@solarfy.com',
        to: [to],
        subject: 'Verify your email address',
        html: this.generateEmailVerificationHtml(verificationUrl),
        text: this.generateEmailVerificationText(verificationUrl),
      })

      if (error) {
        console.error('Error sending email verification email:', error)
        throw new Error(`Failed to send email: ${error.message}`)
      }

      console.log('✅ Email verification sent successfully:', result)
    } catch (error) {
      console.error('Error sending email verification email:', error)
      throw error
    }
  }

  private generateInviteEmailHtml(data: SendInviteEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited to Join Solarfy</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          .message-box { background: #f8fafc; border-left: 4px solid #4f46e5; padding: 20px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited! 🎉</h1>
            <p>Join ${data.inviterName}'s team on Solarfy</p>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p><strong>${data.inviterName}</strong> has invited you to join their Solarfy team as a <strong>${data.roleName}</strong>.</p>

            ${data.message ? `
            <div class="message-box">
              <p><strong>Message from ${data.inviterName}:</strong></p>
              <p>"${data.message}"</p>
            </div>
            ` : ''}

            <p>Solarfy is a comprehensive solar energy management platform that helps you:</p>
            <ul>
              <li>Manage customer information and projects</li>
              <li>Create and track solar proposals</li>
              <li>Monitor installation performance</li>
              <li>Generate detailed reports</li>
            </ul>

            <p style="text-align: center;">
              <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
            </p>

            <p><strong>Note:</strong> This invitation will expire in 7 days. If you don't have an account yet, you'll be able to create one when you click the link above.</p>

            <p>If you weren't expecting this invitation, you can safely ignore this email.</p>

            <div class="footer">
              <p>This is an automated message from Solarfy. Please do not reply to this email.</p>
              <p>© 2024 Solarfy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateInviteEmailText(data: SendInviteEmailData): string {
    return `
You're invited to join Solarfy!

${data.inviterName} has invited you to join their team as a ${data.roleName}.

${data.message ? `Message from ${data.inviterName}: "${data.message}"` : ''}

Click here to accept the invitation: ${data.inviteUrl}

This invitation will expire in 7 days.

If you weren't expecting this invitation, you can safely ignore this email.
    `
  }

  private generatePasswordResetEmailHtml(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `
  }

  private generatePasswordResetEmailText(resetUrl: string): string {
    return `
Reset Your Password

You requested to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.
    `
  }

  private generateEmailVerificationHtml(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Verify Your Email Address</h2>
          <p>Please click the button below to verify your email address:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `
  }

  private generateEmailVerificationText(verificationUrl: string): string {
    return `
Verify Your Email Address

Please click the link below to verify your email address:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.
    `
  }
}