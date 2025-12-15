import { ISupportRepository } from '@/domains/support/repositories/support.repository.interface'
import { SupportTicket, TicketStatus } from '@/domains/support/entities/support-ticket.entity'
import { UserRole } from '@/domains/users/entities/user.entity'

interface UpdateTicketStatusInput {
  ticketId: string
  status: TicketStatus
  updatedBy: string
}

export class UpdateTicketStatusUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(input: UpdateTicketStatusInput, userRole: string): Promise<SupportTicket> {
    // Check if ticket exists
    const ticket = await this.supportRepository.findById(input.ticketId)
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // Validate status transition based on role
    const canUpdateStatus = this.canUserUpdateStatus(userRole, input.updatedBy, ticket, input.status)
    if (!canUpdateStatus) {
      throw new Error('You do not have permission to update this ticket status')
    }

    // Prepare update data
    const updateData: any = { status: input.status }

    // Set resolvedAt when status is RESOLVED
    if (input.status === TicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date()
    }

    // Clear resolvedAt when status changes from RESOLVED
    if (ticket.status === TicketStatus.RESOLVED && input.status !== TicketStatus.RESOLVED) {
      updateData.resolvedAt = null
    }

    // Update the ticket
    const updatedTicket = await this.supportRepository.update(input.ticketId, updateData)

    // TODO: Send notification about status change
    // This will be implemented in the notification system

    return updatedTicket
  }

  private canUserUpdateStatus(
    userRole: string,
    userId: string,
    ticket: any,
    newStatus: TicketStatus
  ): boolean {
    switch (userRole) {
      case UserRole.VIEWER:
        // VIEWER can open or close their own tickets
        return ticket.createdById === userId && (
          newStatus === TicketStatus.OPEN || newStatus === TicketStatus.CLOSED
        )

      case UserRole.TECHNICIAN:
        // TECHNICIAN can update status of tickets assigned to them
        if (ticket.assignedToId !== userId) {
          return false
        }
        // Can move between OPEN, IN_PROGRESS, RESOLVED
        return [
          TicketStatus.OPEN,
          TicketStatus.IN_PROGRESS,
          TicketStatus.RESOLVED,
        ].includes(newStatus)

      case UserRole.MANAGER:
      case UserRole.ADMIN:
        // MANAGER and ADMIN can update any ticket status
        return true

      default:
        return false
    }
  }
}