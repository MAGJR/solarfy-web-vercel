import { IEmailService, SendInviteEmailData } from '@/domains/emails/services/email.service.interface'

export class MockEmailService implements IEmailService {
  async sendInviteEmail(data: SendInviteEmailData): Promise<void> {
    // Mock implementation - just log the email that would be sent
    console.log('📧 === INVITATION EMAIL ===')
    console.log(`To: ${data.to}`)
    console.log(`Subject: You're invited to join the team!`)
    console.log(`Invite URL: ${data.inviteUrl}`)
    console.log(`Role: ${data.roleName}`)
    console.log(`Message: ${data.message || 'No message provided'}`)
    console.log('========================')

    // In a real implementation, you would use a service like:
    // - Resend, SendGrid, AWS SES, etc.
    // For now, this will just console.log the email details

    // Example with Resend:
    // await resend.emails.send({
    //   from: 'noreply@yourcompany.com',
    //   to: [data.to],
    //   subject: 'You\'re invited to join the team!',
    //   html: this.generateInviteEmailHtml(data),
    // })
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    console.log('📧 === PASSWORD RESET EMAIL ===')
    console.log(`To: ${to}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log('==============================')
  }

  async sendEmailVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    console.log('📧 === EMAIL VERIFICATION ===')
    console.log(`To: ${to}`)
    console.log(`Verification URL: ${verificationUrl}`)
    console.log('==============================')
  }

  private generateInviteEmailHtml(data: SendInviteEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>You're Invited to Join the Team!</h2>
        <p>Hello,</p>
        <p>${data.inviterName} has invited you to join their team as a <strong>${data.roleName}</strong>.</p>
        ${data.message ? `<p>Message from ${data.inviterName}: "${data.message}"</p>` : ''}
        <p>
          <a href="${data.inviteUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p>This invitation will expire in 7 days.</p>
        <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      </body>
      </html>
    `
  }
}