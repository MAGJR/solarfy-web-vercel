import { ISupportRepository } from '@/domains/support/repositories/support.repository.interface'
import { TicketStats } from '@/domains/support/entities/support-ticket.entity'

export class GetTicketStatsUseCase {
  constructor(private supportRepository: ISupportRepository) {}

  async execute(tenantId: string, userId?: string, userRole?: string): Promise<TicketStats> {
    return await this.supportRepository.getStats(tenantId, userId, userRole)
  }
}