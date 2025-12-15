import { IEmailRepository } from '@/domains/emails/repositories/email.repository.interface'
import { IEmailProvider } from '@/infrastructure/emails/providers/resend.provider'
import { Email, CreateEmailInput, EmailType, EmailStatus } from '@/domains/emails/entities/email.entity'
import { renderEmailContent } from '@/domains/emails/templates/email-templates'

export interface SendEmailUseCaseInput extends CreateEmailInput {
  sendImmediately?: boolean
}

export class SendEmailUseCase {
  constructor(
    private emailRepository: IEmailRepository,
    private emailProvider: IEmailProvider
  ) {}

  async execute(input: SendEmailUseCaseInput): Promise<Email> {
    try {
      // Create email record in database first
      const email = await this.emailRepository.create({
        ...input,
        status: EmailStatus.PENDING
      })

      if (input.sendImmediately !== false) {
        // Send email immediately
        await this.sendEmailNow(email)
      }

      return email
    } catch (error) {
      console.error('Error in SendEmailUseCase:', error)
      throw new Error(`Failed to create and send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async sendEmailNow(email: Email): Promise<void> {
    try {
      const result = await this.emailProvider.sendEmail({
        to: email.to,
        subject: email.subject,
        htmlContent: email.htmlContent,
        textContent: email.textContent,
        from: email.from,
        replyTo: email.replyTo,
        attachments: email.attachments
      })

      // Update email status
      await this.emailRepository.updateStatus(
        email.id,
        EmailStatus.SENT,
        undefined,
        result.id
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Update email status with error
      await this.emailRepository.updateStatus(
        email.id,
        EmailStatus.FAILED,
        errorMessage
      )

      throw error
    }
  }
}

export class SendTemplatedEmailUseCase {
  constructor(
    private emailRepository: IEmailRepository,
    private emailProvider: IEmailProvider
  ) {}

  async execute(
    to: string,
    type: EmailType,
    templateData?: Record<string, any>,
    options?: Partial<CreateEmailInput>
  ): Promise<Email> {
    try {
      // Render email content from template
      const { subject, htmlContent, textContent } = renderEmailContent(type, templateData)

      const sendEmailUseCase = new SendEmailUseCase(
        this.emailRepository,
        this.emailProvider
      )

      return await sendEmailUseCase.execute({
        to,
        subject,
        htmlContent,
        textContent,
        type,
        templateData,
        ...options
      })
    } catch (error) {
      console.error('Error in SendTemplatedEmailUseCase:', error)
      throw new Error(`Failed to send templated email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}