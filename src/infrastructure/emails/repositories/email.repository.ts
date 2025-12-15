import { prisma } from '@/infrastructure/database/prisma'
import { IEmailRepository } from '@/domains/emails/repositories/email.repository.interface'
import { Email, CreateEmailInput } from '@/domains/emails/entities/email.entity'
import { EmailStatus } from '@/domains/emails/types/email-type.enum'

export class PrismaEmailRepository implements IEmailRepository {
  async create(input: CreateEmailInput): Promise<Email> {
    const email = await prisma.email.create({
      data: {
        to: input.to,
        subject: input.subject,
        htmlContent: input.htmlContent,
        textContent: input.textContent,
        type: input.type,
        status: EmailStatus.PENDING,
        templateId: input.templateId,
        templateData: input.templateData,
        from: input.from ? JSON.stringify(input.from) : null,
        replyTo: input.replyTo,
        attachments: input.attachments ? JSON.stringify(input.attachments) : null,
      }
    })

    return this.mapToEntity(email)
  }

  async findById(id: string): Promise<Email | null> {
    const email = await prisma.email.findUnique({
      where: { id }
    })

    return email ? this.mapToEntity(email) : null
  }

  async findByTo(to: string): Promise<Email[]> {
    const emails = await prisma.email.findMany({
      where: { to },
      orderBy: { createdAt: 'desc' }
    })

    return emails.map(email => this.mapToEntity(email))
  }

  async findByStatus(status: string): Promise<Email[]> {
    const emails = await prisma.email.findMany({
      where: { status: status as EmailStatus },
      orderBy: { createdAt: 'desc' }
    })

    return emails.map(email => this.mapToEntity(email))
  }

  async updateStatus(
    id: string,
    status: string,
    errorMessage?: string,
    externalId?: string
  ): Promise<Email> {
    const email = await prisma.email.update({
      where: { id },
      data: {
        status: status as EmailStatus,
        errorMessage,
        externalId,
        updatedAt: new Date(),
        ...(status === EmailStatus.SENT && { sentAt: new Date() })
      }
    })

    return this.mapToEntity(email)
  }

  async updateDeliveryStatus(id: string, deliveredAt: Date): Promise<Email> {
    const email = await prisma.email.update({
      where: { id },
      data: {
        status: EmailStatus.DELIVERED,
        deliveredAt,
        updatedAt: new Date()
      }
    })

    return this.mapToEntity(email)
  }

  async delete(id: string): Promise<void> {
    await prisma.email.delete({
      where: { id }
    })
  }

  async list(params?: {
    limit?: number
    offset?: number
    type?: string
    status?: string
    to?: string
  }): Promise<Email[]> {
    const { limit = 50, offset = 0, type, status, to } = params || {}

    const emails = await prisma.email.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(status && { status: status as EmailStatus }),
        ...(to && { to })
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    return emails.map(email => this.mapToEntity(email))
  }

  private mapToEntity(email: any): Email {
    return {
      id: email.id,
      to: email.to,
      subject: email.subject,
      htmlContent: email.htmlContent,
      textContent: email.textContent,
      type: email.type,
      status: email.status,
      templateId: email.templateId,
      templateData: email.templateData as any,
      from: email.from ? JSON.parse(email.from) : undefined,
      replyTo: email.replyTo,
      attachments: email.attachments ? JSON.parse(email.attachments) : undefined,
      sentAt: email.sentAt,
      deliveredAt: email.deliveredAt,
      errorMessage: email.errorMessage,
      externalId: email.externalId,
      createdAt: email.createdAt,
      updatedAt: email.updatedAt
    }
  }
}