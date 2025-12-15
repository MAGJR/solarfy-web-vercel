import { PrismaMonitoringRepository, CreateMonitoringDataInput } from '@/infrastructure/repositories/prisma-monitoring.repository'
import { PrismaCrmLeadRepository } from '@/infrastructure/repositories/prisma-crm-lead.repository'

export class CreateMonitoringDataUseCase {
  constructor(
    private monitoringRepository: PrismaMonitoringRepository,
    private crmLeadRepository: PrismaCrmLeadRepository
  ) {}

  async execute(data: CreateMonitoringDataInput) {
    // Check if CRM lead exists
    const crmLead = await this.crmLeadRepository.findById(data.crmLeadId)
    if (!crmLead) {
      throw new Error('CRM lead not found. Monitoring data can only be created for existing CRM leads.')
    }

    return await this.monitoringRepository.create(data)
  }
}