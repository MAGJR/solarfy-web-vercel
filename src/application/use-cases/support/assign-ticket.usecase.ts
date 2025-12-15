import { ISupportRepository } from '@/domains/support/repositories/support.repository.interface'
import { SupportTicket } from '@/domains/support/entities/support-ticket.entity'
import { UserRole } from '@/domains/users/entities/user.entity'

interface AssignTicketInput {
  ticketId: string
  technicianId: string
  requestedBy: string
}

export class AssignTicketUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(input: AssignTicketInput, userRole: string): Promise<SupportTicket> {
    // Only ADMIN and MANAGER can assign tickets
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
      throw new Error('You do not have permission to assign support tickets')
    }

    // Validate that the ticket exists
    const ticket = await this.supportRepository.findById(input.ticketId)
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // Check if ticket is already assigned
    if (ticket.assignedToId) {
      throw new Error('Ticket is already assigned to a technician')
    }

    // Assign the ticket
    const assignedTicket = await this.supportRepository.assignTicket(
      input.ticketId,
      input.technicianId
    )

    // TODO: Send notification to the assigned technician
    // This will be implemented in the notification system

    return assignedTicket
  }
}