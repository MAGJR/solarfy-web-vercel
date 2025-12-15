import { CrmLeadRepository } from '@/infrastructure/repositories/prisma-crm-lead.repository'
import { CrmLeadWithJourney } from '@/infrastructure/repositories/prisma-crm-lead.repository'

export interface GetCrmLeadUseCaseInput {
  id: string
}

export class GetCrmLeadUseCase {
  constructor(private crmLeadRepository: CrmLeadRepository) {}

  async execute(leadId: string): Promise<CrmLeadWithJourney | null> {
    try {
      const lead = await this.crmLeadRepository.findById(leadId)
      return lead
    } catch (error) {
      console.error('Error in GetCrmLeadUseCase:', error)
      throw error
    }
  }
}