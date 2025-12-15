export interface SendInviteEmailData {
  to: string
  inviteUrl: string
  message?: string
  inviterName: string
  roleName: string
}

export interface IEmailService {
  sendInviteEmail(data: SendInviteEmailData): Promise<void>
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>
  sendEmailVerificationEmail(to: string, verificationUrl: string): Promise<void>
}