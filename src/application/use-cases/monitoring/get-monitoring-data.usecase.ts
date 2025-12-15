import { PrismaMonitoringRepository, MonitoringDataQueryInput } from '@/infrastructure/repositories/prisma-monitoring.repository'

export class GetMonitoringDataUseCase {
  constructor(private monitoringRepository: PrismaMonitoringRepository) {}

  async execute(query: MonitoringDataQueryInput = {}) {
    return await this.monitoringRepository.findAll(query)
  }
}