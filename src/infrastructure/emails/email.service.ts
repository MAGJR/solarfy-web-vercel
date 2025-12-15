import { PrismaEmailRepository } from './repositories/email.repository'
import { ResendEmailProvider, MockEmailProvider } from './providers/resend.provider'
import { SendEmailUseCase, SendTemplatedEmailUseCase } from '@/application/use-cases/emails/send-email.usecase'

export class EmailService {
  private emailRepository: PrismaEmailRepository
  private emailProvider: ResendEmailProvider | MockEmailProvider
  private sendEmailUseCase: SendEmailUseCase
  private sendTemplatedEmailUseCase: SendTemplatedEmailUseCase

  constructor() {
    this.emailRepository = new PrismaEmailRepository()

    // Use real provider if RESEND_API_KEY is set, otherwise use mock
    const hasResendKey = !!process.env.RESEND_API_KEY

    if (hasResendKey) {
      this.emailProvider = new ResendEmailProvider()
      console.log('✅ Using Resend email provider')
    } else {
      console.warn('⚠️ Using mock email provider. Set RESEND_API_KEY to send real emails.')
      this.emailProvider = new MockEmailProvider()
    }

    this.sendEmailUseCase = new SendEmailUseCase(
      this.emailRepository,
      this.emailProvider
    )

    this.sendTemplatedEmailUseCase = new SendTemplatedEmailUseCase(
      this.emailRepository,
      this.emailProvider
    )
  }

  async sendEmail(input: any) {
    return await this.sendEmailUseCase.execute(input)
  }

  async sendTemplatedEmail(
    to: string,
    type: string,
    templateData?: Record<string, any>,
    options?: any
  ) {
    return await this.sendTemplatedEmailUseCase.execute(
      to,
      type as any,
      templateData,
      options
    )
  }
}

// Singleton instance
export const emailService = new EmailService()