import { PrismaClient, CrmLead, CrmUserStatus, ProductService } from '@prisma/client'

export type CrmLeadWithJourney = CrmLead & {
  journey: Array<{
    id: string
    step: string
    status: string
    completedAt?: Date | null
    notes?: string | null
    assignedTo?: string | null
  }>
}

export interface CreateCrmLeadInput {
  name: string
  email: string
  phone?: string
  company: string
  productService: ProductService
  assignee?: string
  notes?: string
  customerType?: 'OWNER' | 'LEASE' | 'UNKNOWN'
  createdBy: string
}

export interface UpdateCrmLeadInput {
  name?: string
  phone?: string
  status?: CrmUserStatus
  score?: number
  assignee?: string
  productService?: ProductService
  notes?: string
  lastActivity?: Date
}

export interface CrmLeadQueryInput {
  page?: number
  limit?: number
  status?: CrmUserStatus
  assignee?: string
  productService?: ProductService
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
  sortBy?: 'name' | 'createdAt' | 'score' | 'lastActivity'
  sortOrder?: 'asc' | 'desc'
}

export class PrismaCrmLeadRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCrmLeadInput): Promise<CrmLeadWithJourney> {
    const crmLead = await this.prisma.crmLead.create({
      data: {
        ...data,
        journey: {
          create: [
            {
              step: 'INITIAL_CONTACT',
              status: 'COMPLETED',
              completedAt: new Date(),
              notes: 'Lead created in system'
            }
          ]
        }
      },
      include: {
        journey: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return crmLead as CrmLeadWithJourney
  }

  async findById(id: string): Promise<CrmLeadWithJourney | null> {
    const lead = await this.prisma.crmLead.findUnique({
      where: { id },
      include: {
        journey: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return lead as CrmLeadWithJourney | null
  }

  async findAll(query: CrmLeadQueryInput = {}): Promise<{
    leads: CrmLeadWithJourney[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const {
      page = 1,
      limit = 50,
      status,
      assignee,
      productService,
      search,
      dateRange,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    // Validação para evitar valores nulos no orderBy
    const validSortBy = sortBy || 'createdAt'
    const validSortOrder = sortOrder || 'desc'

    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (assignee) {
      where.assignee = assignee
    }

    if (productService) {
      where.productService = productService
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (dateRange) {
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end
      }
    }

    const [leads, total] = await Promise.all([
      this.prisma.crmLead.findMany({
        where,
        include: {
          journey: {
            orderBy: { createdAt: 'asc' }
          }
        },
        skip,
        take: limit,
        orderBy: { [validSortBy]: validSortOrder }
      }),
      this.prisma.crmLead.count({ where })
    ])

    return {
      leads: leads as CrmLeadWithJourney[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async update(id: string, data: UpdateCrmLeadInput): Promise<CrmLeadWithJourney> {
    const updateData: any = { ...data }

    // If status is changing, add a journey step
    if (data.status) {
      updateData.lastActivity = new Date()
    }

    const lead = await this.prisma.crmLead.update({
      where: { id },
      data: updateData,
      include: {
        journey: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return lead as CrmLeadWithJourney
  }

  async delete(id: string): Promise<void> {
    await this.prisma.crmLead.delete({
      where: { id }
    })
  }

  async addJourneyStep(
    crmLeadId: string,
    step: string,
    status: string,
    notes?: string,
    assignedTo?: string
  ): Promise<void> {
    await this.prisma.userJourneyStep.create({
      data: {
        crmLeadId,
        step,
        status,
        notes,
        assignedTo,
        completedAt: status === 'COMPLETED' ? new Date() : undefined
      }
    })

    // Update lead's last activity
    await this.prisma.crmLead.update({
      where: { id: crmLeadId },
      data: { lastActivity: new Date() }
    })
  }

  async getStats(): Promise<{
    total: number
    byStatus: Record<string, number>
    byAssignee: Record<string, number>
    avgScore: number
    recentActivity: number
  }> {
    const [total, byStatus, byAssignee, avgScore, recentActivity] = await Promise.all([
      this.prisma.crmLead.count(),
      this.prisma.crmLead.groupBy({
        by: ['status'],
        _count: true
      }),
      this.prisma.crmLead.groupBy({
        by: ['assignee'],
        _count: true,
        where: { assignee: { not: null } }
      }),
      this.prisma.crmLead.aggregate({
        _avg: { score: true }
      }),
      this.prisma.crmLead.count({
        where: {
          lastActivity: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    return {
      total,
      byStatus: byStatus.reduce((acc: any, item: any) => {
        acc[item.status] = item._count
        return acc
      }, {}),
      byAssignee: byAssignee.reduce((acc: any, item: any) => {
        if (item.assignee) {
          acc[item.assignee] = item._count
        }
        return acc
      }, {}),
      avgScore: avgScore._avg.score || 0,
      recentActivity
    }
  }
}