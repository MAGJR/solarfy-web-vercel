import { PrismaCrmLeadRepository, CreateCrmLeadInput } from '@/infrastructure/repositories/prisma-crm-lead.repository'

export class CreateCrmLeadUseCase {
  constructor(private crmLeadRepository: PrismaCrmLeadRepository) {}

  async execute(data: CreateCrmLeadInput) {
    return await this.crmLeadRepository.create(data)
  }
}