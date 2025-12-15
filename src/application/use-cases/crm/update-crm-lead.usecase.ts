import { PrismaCrmLeadRepository, UpdateCrmLeadInput } from '@/infrastructure/repositories/prisma-crm-lead.repository'

export class UpdateCrmLeadUseCase {
  constructor(private crmLeadRepository: PrismaCrmLeadRepository) {}

  async execute(id: string, data: UpdateCrmLeadInput) {
    return await this.crmLeadRepository.update(id, data)
  }
}