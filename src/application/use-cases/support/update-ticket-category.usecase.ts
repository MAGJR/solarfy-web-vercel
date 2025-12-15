import { ISupportRepository } from '@/domains/support/repositories/support.repository.interface'
import { SupportTicket, TicketCategory } from '@/domains/support/entities/support-ticket.entity'
import { UserRole } from '@/domains/users/entities/user.entity'

interface UpdateTicketCategoryInput {
  ticketId: string
  category: TicketCategory
  updatedBy: string
}

export class UpdateTicketCategoryUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(input: UpdateTicketCategoryInput, userRole: string): Promise<SupportTicket> {
    // Only ADMIN can update ticket category
    if (userRole !== UserRole.ADMIN) {
      throw new Error('You do not have permission to update ticket category')
    }

    // Validate that the ticket exists
    const ticket = await this.supportRepository.findById(input.ticketId)
    if (!ticket) {
      throw new Error('Ticket not found')
    }

    // Validate the category
    if (!Object.values(TicketCategory).includes(input.category)) {
      throw new Error('Invalid ticket category')
    }

    // Update the ticket category
    const updatedTicket = await this.supportRepository.update(input.ticketId, {
      category: input.category,
      updatedAt: new Date()
    })

    return updatedTicket
  }
}