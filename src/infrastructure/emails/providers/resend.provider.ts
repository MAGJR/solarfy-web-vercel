import { Resend } from 'resend'
import { SendEmailInput } from '@/domains/emails/entities/email.entity'

export interface IEmailProvider {
  sendEmail(input: SendEmailInput): Promise<{ id: string; success: boolean }>
}

export class ResendEmailProvider implements IEmailProvider {
  private resend: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }

    this.resend = new Resend(apiKey)
  }

  async sendEmail(input: SendEmailInput): Promise<{ id: string; success: boolean }> {
    try {
      const defaultFrom = {
        name: 'Solarfy',
        email: process.env.RESEND_FROM_EMAIL || 'no-reply@solarfy.com'
      }

      const from = input.from || defaultFrom
      const fromEmail = `${from.name} <${from.email}>`

      const emailData = {
        from: fromEmail,
        to: [input.to],
        subject: input.subject,
        html: input.htmlContent,
        text: input.textContent,
        replyTo: input.replyTo,
        attachments: input.attachments?.map(att => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          contentType: att.contentType
        }))
      }

      console.log('📧 Sending email with Resend:', {
        to: input.to,
        subject: input.subject,
        from: fromEmail
      })

      const result = await this.resend.emails.send(emailData)

      if (result.error) {
        console.error('❌ Resend error:', result.error)
        throw new Error(result.error.message)
      }

      console.log('✅ Email sent successfully:', result.data?.id)

      return {
        id: result.data?.id || '',
        success: true
      }
    } catch (error) {
      console.error('❌ Error sending email with Resend:', error)
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export class MockEmailProvider implements IEmailProvider {
  async sendEmail(input: SendEmailInput): Promise<{ id: string; success: boolean }> {
    // Mock provider for development/testing
    console.log('🧪 MOCK EMAIL SENDING:')
    console.log('To:', input.to)
    console.log('Subject:', input.subject)
    console.log('HTML length:', input.htmlContent.length)
    console.log('Text length:', input.textContent?.length || 0)

    return {
      id: `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      success: true
    }
  }
}