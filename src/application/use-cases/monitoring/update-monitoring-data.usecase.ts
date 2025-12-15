import { PrismaMonitoringRepository, UpdateMonitoringDataInput } from '@/infrastructure/repositories/prisma-monitoring.repository'

export class UpdateMonitoringDataUseCase {
  constructor(private monitoringRepository: PrismaMonitoringRepository) {}

  async execute(id: string, data: UpdateMonitoringDataInput) {
    return await this.monitoringRepository.update(id, data)
  }

  async executeByCrmLeadId(crmLeadId: string, data: UpdateMonitoringDataInput) {
    return await this.monitoringRepository.updateByCrmLeadId(crmLeadId, data)
  }
}