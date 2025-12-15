import { ISupportRepository } from '@/domains/support/repositories/support.repository.interface'
import { GetTicketsOptions, SupportTicket } from '@/domains/support/entities/support-ticket.entity'
import { UserRole } from '@/domains/users/entities/user.entity'

export class GetTicketsUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(options: GetTicketsOptions, userRole: string, userId: string): Promise<{
    tickets: SupportTicket[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    // Apply role-based filtering
    let filteredOptions = { ...options }

    switch (userRole) {
      case UserRole.VIEWER:
        // VIEWER can only see their own tickets
        filteredOptions.createdById = userId
        break

      case UserRole.TECHNICIAN:
        // TECHNICIAN can see tickets assigned to them or all unassigned tickets
        if (!options.assignedToId) {
          // If no specific assignment filter, show both assigned and unassigned
          // We'll need to make two queries and merge them
          const [assignedTickets, unassignedTickets] = await Promise.all([
            this.supportRepository.findMany({
              ...options,
              assignedToId: userId,
            }),
            this.supportRepository.findMany({
              ...options,
              assignedToId: undefined,
            }),
          ])

          // Merge and deduplicate tickets
          const allTickets = [...assignedTickets.tickets, ...unassignedTickets.tickets]
          const uniqueTickets = allTickets.filter((ticket, index, self) =>
            index === self.findIndex((t) => t.id === ticket.id)
          )

          return {
            tickets: uniqueTickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
            total: uniqueTickets.length,
            page: options.page || 1,
            limit: options.limit || 10,
            totalPages: Math.ceil(uniqueTickets.length / (options.limit || 10)),
          }
        }
        break

      case UserRole.MANAGER:
      case UserRole.ADMIN:
        // MANAGER and ADMIN can see all tickets in their tenant
        // No additional filtering needed
        break

      default:
        throw new Error('You do not have permission to view support tickets')
    }

    return await this.supportRepository.findMany(filteredOptions)
  }
}