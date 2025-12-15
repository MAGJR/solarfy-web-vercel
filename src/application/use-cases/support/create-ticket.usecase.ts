import { ISupportRepository } from '@/domains/support/repositories/support.repository.interface'
import { CreateTicketInput, SupportTicket } from '@/domains/support/entities/support-ticket.entity'
import { UserRole } from '@/domains/users/entities/user.entity'
import { notifyNewTicket } from '@/lib/notifications'

export class CreateTicketUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(input: CreateTicketInput, userRole: string): Promise<SupportTicket> {
    // Validation: Only VIEWER, ADMIN, MANAGER, and TECHNICIAN can create tickets
    const allowedRoles = [UserRole.VIEWER, UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN]
    if (!allowedRoles.includes(userRole as UserRole)) {
      throw new Error('You do not have permission to create support tickets')
    }

    // Validate required fields
    if (!input.subject?.trim()) {
      throw new Error('Subject is required')
    }

    if (!input.description?.trim()) {
      throw new Error('Description is required')
    }

    if (!input.createdById) {
      throw new Error('User ID is required')
    }

    if (!input.tenantId) {
      throw new Error('Tenant ID is required')
    }

    // Create the ticket
    const ticket = await this.supportRepository.create(input)

    // Send notifications to technicians and admins about new ticket
    try {
      await notifyNewTicket({
        id: ticket.id,
        subject: ticket.subject,
        tenantId: ticket.tenantId,
        createdById: ticket.createdById
      })
    } catch (notificationError) {
      // Log error but don't fail ticket creation
      console.error('Failed to send notification for new ticket:', notificationError)
    }

    return ticket
  }
}