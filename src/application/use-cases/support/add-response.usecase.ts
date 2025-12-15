import { ISupportRepository } from '@/domains/support/repositories/support.repository.interface'
import { AddTicketResponseInput, TicketResponse } from '@/domains/support/entities/support-ticket.entity'
import { UserRole } from '@/domains/users/entities/user.entity'

export class AddTicketResponseUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(input: AddTicketResponseInput, userRole: string): Promise<TicketResponse> {
    // Validation
    if (!input.content?.trim()) {
      throw new Error('Response content is required')
    }

    if (!input.ticketId) {
      throw new Error('Ticket ID is required')
    }

    if (!input.userId) {
      throw new Error('User ID is required')
    }

    // Check if ticket exists
    const ticket = await this.supportRepository.findById(input.ticketId)
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // Role-based permissions for internal notes
    if (input.isInternal) {
      // Only TECHNICIAN, ADMIN, and MANAGER can add internal notes
      const allowedRoles = [UserRole.TECHNICIAN, UserRole.ADMIN, UserRole.MANAGER]
      if (!allowedRoles.includes(userRole as UserRole)) {
        throw new Error('You do not have permission to add internal notes')
      }
    }

    // Check if user can respond to this ticket
    const canRespond = this.canUserRespondToTicket(userRole, input.userId, ticket)
    if (!canRespond) {
      throw new Error('You do not have permission to respond to this ticket')
    }

    // Add the response
    const response = await this.supportRepository.addResponse(input)

    // TODO: Send notification to relevant parties
    // - If customer responds, notify assigned technician
    // - If technician responds, notify customer
    // This will be implemented in the notification system

    return response
  }

  private canUserRespondToTicket(
    userRole: string,
    userId: string,
    ticket: any
  ): boolean {
    switch (userRole) {
      case UserRole.VIEWER:
        // VIEWER can only respond to their own tickets
        return ticket.createdById === userId

      case UserRole.TECHNICIAN:
        // TECHNICIAN can respond to tickets assigned to them
        return ticket.assignedToId === userId

      case UserRole.MANAGER:
      case UserRole.ADMIN:
        // MANAGER and ADMIN can respond to any ticket
        return true

      default:
        return false
    }
  }
}