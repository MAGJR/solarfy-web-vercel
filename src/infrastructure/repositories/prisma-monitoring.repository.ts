import { PrismaClient, MonitoringData, CustomerType, EquipmentStatus, AlertLevel } from '@prisma/client'

export interface MonitoringDataWithCrm extends MonitoringData {
  crmLead: {
    id: string
    name: string
    email: string
    company: string
  }
}

export interface CreateMonitoringDataInput {
  crmLeadId: string
  customerType?: CustomerType
  address: string
  peakKwp: number
  energyTodayKwh?: number
  equipmentStatus?: EquipmentStatus
  alertLevel?: AlertLevel

  // Micro-inverter information
  microinverterBrand?: string
  microinverterModel?: string
  microinverterCount?: number
  microinverterSerial?: string

  // Enphase API integration fields (future implementation)
  enphaseSystemId?: string
  enphaseUserId?: string
  enphaseSiteId?: string
  enphaseApiKey?: string
  enphaseApiEnabled?: boolean

  // Real-time data fields (populated by Enphase API)
  currentPowerW?: number
  lifetimeEnergyKwh?: number
}

export interface UpdateMonitoringDataInput {
  customerType?: CustomerType
  address?: string
  peakKwp?: number
  energyTodayKwh?: number
  equipmentStatus?: EquipmentStatus
  alertLevel?: AlertLevel
  lastUpdate?: Date

  // Micro-inverter information
  microinverterBrand?: string
  microinverterModel?: string
  microinverterCount?: number
  microinverterSerial?: string

  // Enphase API integration fields (future implementation)
  enphaseSystemId?: string
  enphaseUserId?: string
  enphaseSiteId?: string
  enphaseApiKey?: string
  enphaseApiEnabled?: boolean

  // Real-time data fields (populated by Enphase API)
  currentPowerW?: number
  lifetimeEnergyKwh?: number
  lastSyncAt?: Date
}

export interface MonitoringDataQueryInput {
  page?: number
  limit?: number
  crmLeadId?: string
  customerType?: CustomerType
  equipmentStatus?: EquipmentStatus
  alertLevel?: AlertLevel
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
  sortBy?: 'lastUpdate' | 'peakKwp' | 'energyTodayKwh'
  sortOrder?: 'asc' | 'desc'
}

export class PrismaMonitoringRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateMonitoringDataInput): Promise<MonitoringDataWithCrm> {
    const monitoringData = await this.prisma.monitoringData.create({
      data: {
        ...data,
        lastUpdate: new Date()
      },
      include: {
        crmLead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return monitoringData as MonitoringDataWithCrm
  }

  async findById(id: string): Promise<MonitoringDataWithCrm | null> {
    const data = await this.prisma.monitoringData.findUnique({
      where: { id },
      include: {
        crmLead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return data as MonitoringDataWithCrm | null
  }

  async findByCrmLeadId(crmLeadId: string): Promise<MonitoringDataWithCrm | null> {
    const data = await this.prisma.monitoringData.findFirst({
      where: { crmLeadId },
      include: {
        crmLead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return data as MonitoringDataWithCrm | null
  }

  async findAll(query: MonitoringDataQueryInput = {}): Promise<{
    data: MonitoringDataWithCrm[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const {
      page = 1,
      limit = 50,
      crmLeadId,
      customerType,
      equipmentStatus,
      alertLevel,
      search,
      dateRange,
      sortBy = 'lastUpdate',
      sortOrder = 'desc'
    } = query

    const skip = (page - 1) * limit

    const where: any = {}

    if (crmLeadId) {
      where.crmLeadId = crmLeadId
    }

    if (customerType) {
      where.customerType = customerType
    }

    if (equipmentStatus) {
      where.equipmentStatus = equipmentStatus
    }

    if (alertLevel) {
      where.alertLevel = alertLevel
    }

    if (search) {
      where.OR = [
        {
          crmLead: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateRange) {
      where.lastUpdate = {
        gte: dateRange.start,
        lte: dateRange.end
      }
    }

    const orderBy: any = {}
    if (sortBy && sortOrder) {
      orderBy[sortBy] = sortOrder
    }

    const [data, total] = await Promise.all([
      this.prisma.monitoringData.findMany({
        where,
        include: {
          crmLead: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.monitoringData.count({ where })
    ])

    return {
      data: data as MonitoringDataWithCrm[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async update(id: string, data: UpdateMonitoringDataInput): Promise<MonitoringDataWithCrm> {
    const updateData: any = { ...data }

    // Always update lastUpdate when monitoring data changes
    if (!updateData.lastUpdate) {
      updateData.lastUpdate = new Date()
    }

    const monitoringData = await this.prisma.monitoringData.update({
      where: { id },
      data: updateData,
      include: {
        crmLead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return monitoringData as MonitoringDataWithCrm
  }

  async updateByCrmLeadId(crmLeadId: string, data: UpdateMonitoringDataInput): Promise<MonitoringDataWithCrm> {
    const updateData: any = { ...data }

    // Always update lastUpdate when monitoring data changes
    if (!updateData.lastUpdate) {
      updateData.lastUpdate = new Date()
    }

    // First find the record, then update it
    const existingData = await this.prisma.monitoringData.findFirst({
      where: { crmLeadId }
    })

    if (!existingData) {
      throw new Error(`Monitoring data with crmLeadId ${crmLeadId} not found`)
    }

    const monitoringData = await this.prisma.monitoringData.update({
      where: { id: existingData.id },
      data: updateData,
      include: {
        crmLead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    return monitoringData as MonitoringDataWithCrm
  }

  async delete(id: string): Promise<void> {
    await this.prisma.monitoringData.delete({
      where: { id }
    })
  }

  async getStats(): Promise<{
    total: number
    byCustomerType: Record<string, number>
    byEquipmentStatus: Record<string, number>
    byAlertLevel: Record<string, number>
    totalPeakKwp: number
    avgEnergyToday: number
    alertsCount: number
  }> {
    const [
      total,
      byCustomerType,
      byEquipmentStatus,
      byAlertLevel,
      totalPeakKwp,
      avgEnergyToday,
      alertsCount
    ] = await Promise.all([
      this.prisma.monitoringData.count(),
      this.prisma.monitoringData.groupBy({
        by: ['customerType'],
        _count: true
      }),
      this.prisma.monitoringData.groupBy({
        by: ['equipmentStatus'],
        _count: true
      }),
      this.prisma.monitoringData.groupBy({
        by: ['alertLevel'],
        _count: true
      }),
      this.prisma.monitoringData.aggregate({
        _sum: { peakKwp: true }
      }),
      this.prisma.monitoringData.aggregate({
        _avg: { energyTodayKwh: true }
      }),
      this.prisma.monitoringData.count({
        where: {
          alertLevel: {
            in: ['WARNING', 'CRITICAL']
          }
        }
      })
    ])

    return {
      total,
      byCustomerType: byCustomerType.reduce((acc: any, item: any) => {
        acc[item.customerType] = item._count
        return acc
      }, {}),
      byEquipmentStatus: byEquipmentStatus.reduce((acc: any, item: any) => {
        acc[item.equipmentStatus] = item._count
        return acc
      }, {}),
      byAlertLevel: byAlertLevel.reduce((acc: any, item: any) => {
        acc[item.alertLevel] = item._count
        return acc
      }, {}),
      totalPeakKwp: totalPeakKwp._sum.peakKwp || 0,
      avgEnergyToday: avgEnergyToday._avg.energyTodayKwh || 0,
      alertsCount
    }
  }
}