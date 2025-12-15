import { Email, CreateEmailInput } from '../entities/email.entity'

export interface IEmailRepository {
  create(input: CreateEmailInput): Promise<Email>
  findById(id: string): Promise<Email | null>
  findByTo(to: string): Promise<Email[]>
  findByStatus(status: string): Promise<Email[]>
  updateStatus(id: string, status: string, errorMessage?: string, externalId?: string): Promise<Email>
  updateDeliveryStatus(id: string, deliveredAt: Date): Promise<Email>
  delete(id: string): Promise<void>
  list(params?: {
    limit?: number
    offset?: number
    type?: string
    status?: string
    to?: string
  }): Promise<Email[]>
}