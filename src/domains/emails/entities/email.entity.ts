import { EmailType, EmailStatus } from '../types/email-type.enum'

export { EmailType, EmailStatus }

export interface Email {
  id: string
  to: string
  subject: string
  htmlContent: string
  textContent?: string
  type: EmailType
  status: EmailStatus
  templateId?: string
  templateData?: Record<string, any>
  from?: {
    name: string
    email: string
  }
  replyTo?: string
  attachments?: EmailAttachment[]
  sentAt?: Date
  deliveredAt?: Date
  errorMessage?: string
  externalId?: string // ID from provider (Resend, SendGrid, etc.)
  createdAt: Date
  updatedAt: Date
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType?: string
}

export interface CreateEmailInput {
  to: string
  subject: string
  htmlContent: string
  textContent?: string
  type: EmailType
  templateId?: string
  templateData?: Record<string, any>
  from?: {
    name: string
    email: string
  }
  replyTo?: string
  attachments?: EmailAttachment[]
  status?: string
}

export interface SendEmailInput {
  to: string
  subject: string
  htmlContent: string
  textContent?: string
  from?: {
    name: string
    email: string
  }
  replyTo?: string
  attachments?: EmailAttachment[]
}