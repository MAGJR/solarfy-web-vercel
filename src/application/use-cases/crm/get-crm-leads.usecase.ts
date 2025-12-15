import { PrismaCrmLeadRepository, CrmLeadQueryInput } from '@/infrastructure/repositories/prisma-crm-lead.repository'

export class GetCrmLeadsUseCase {
  constructor(private crmLeadRepository: PrismaCrmLeadRepository) {}

  async execute(query: CrmLeadQueryInput = {}) {
    return await this.crmLeadRepository.findAll(query)
  }
}