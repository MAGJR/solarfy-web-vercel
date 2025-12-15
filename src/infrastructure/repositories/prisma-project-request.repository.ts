import { ProjectRequestRepository } from "@/domains/project-requests/repositories/project-request.repository.interface"
import {
  ProjectRequest,
  CreateProjectRequestInput,
  UpdateProjectRequestInput,
  UpdateStatusInput,
  ProjectRequestWithRelations,
  ProjectRequestFilters,
  ProjectRequestListResult,
  ProjectRequestStatus,
  ProjectRequestPriority
} from "@/domains/project-requests/entities/project-request.entity"
import { PrismaClient } from "@prisma/client"

export class PrismaProjectRequestRepository implements ProjectRequestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateProjectRequestInput): Promise<ProjectRequest> {
    const { createdById, serviceId, tenantId, ...restData } = data

    const projectRequest = await this.prisma.projectRequest.create({
      data: {
        ...restData,
        status: ProjectRequestStatus.PENDING, // Default status
        // Handle relationships properly with Prisma connect syntax
        createdBy: {
          connect: {
            id: createdById
          }
        },
        service: {
          connect: {
            id: serviceId
          }
        },
        tenant: {
          connect: {
            id: tenantId
          }
        }
      },
    })

    return this.mapToEntity(projectRequest)
  }

  async findById(id: string): Promise<ProjectRequestWithRelations | null> {
    const projectRequest = await this.prisma.projectRequest.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        convertedToProject: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            attachments: true,
            comments: true,
          },
        },
      },
    })

    return projectRequest ? this.mapToEntityWithRelations(projectRequest) : null
  }

  async update(id: string, data: UpdateProjectRequestInput): Promise<ProjectRequest> {
    const projectRequest = await this.prisma.projectRequest.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    return this.mapToEntity(projectRequest)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.projectRequest.delete({
      where: { id },
    })
  }

  async updateStatus(id: string, input: UpdateStatusInput): Promise<ProjectRequest> {
    const projectRequest = await this.prisma.projectRequest.update({
      where: { id },
      data: {
        status: input.status,
        reviewedBy: input.reviewedBy,
        reviewedAt: new Date(),
        rejectionReason: input.rejectionReason,
        adminNotes: input.adminNotes,
        updatedAt: new Date(),
      },
    })

    return this.mapToEntity(projectRequest)
  }

  async findAll(filters?: ProjectRequestFilters): Promise<ProjectRequestListResult> {
    const where = this.buildWhereClause(filters)
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    const [requests, total] = await Promise.all([
      this.prisma.projectRequest.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          convertedToProject: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              attachments: true,
              comments: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      this.prisma.projectRequest.count({ where }),
    ])

    return {
      requests: requests.map(req => this.mapToEntityWithRelations(req)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findByCreatedBy(createdById: string, filters?: ProjectRequestFilters): Promise<ProjectRequestListResult> {
    return this.findAll({
      ...filters,
      createdById,
    })
  }

  async findByAssignedTo(assignedToId: string, filters?: ProjectRequestFilters): Promise<ProjectRequestListResult> {
    return this.findAll({
      ...filters,
      assignedToId,
    })
  }

  async assignToAdmin(requestId: string, adminId: string): Promise<ProjectRequest> {
    const projectRequest = await this.prisma.projectRequest.update({
      where: { id: requestId },
      data: {
        assignedToId: adminId,
        assignedAt: new Date(),
        status: ProjectRequestStatus.UNDER_REVIEW,
        updatedAt: new Date(),
      },
    })

    return this.mapToEntity(projectRequest)
  }

  async unassign(requestId: string): Promise<ProjectRequest> {
    const projectRequest = await this.prisma.projectRequest.update({
      where: { id: requestId },
      data: {
        assignedToId: null,
        assignedAt: null,
        status: ProjectRequestStatus.PENDING,
        updatedAt: new Date(),
      },
    })

    return this.mapToEntity(projectRequest)
  }

  async convertToProject(requestId: string, projectId: string): Promise<ProjectRequest> {
    const projectRequest = await this.prisma.projectRequest.update({
      where: { id: requestId },
      data: {
        convertedToProjectId: projectId,
        status: ProjectRequestStatus.CONVERTED_TO_PROJECT,
        convertedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return this.mapToEntity(projectRequest)
  }

  async getStats(tenantId: string): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    converted: number
    byServiceType: Record<string, number>
    byPriority: Record<string, number>
    avgResponseTime?: number
  }> {
    const [
      total,
      pending,
      approved,
      rejected,
      converted,
      byServiceType,
      byPriority,
      avgResponseData
    ] = await Promise.all([
      this.prisma.projectRequest.count({ where: { tenantId } }),
      this.prisma.projectRequest.count({ where: { tenantId, status: ProjectRequestStatus.PENDING } }),
      this.prisma.projectRequest.count({ where: { tenantId, status: ProjectRequestStatus.APPROVED } }),
      this.prisma.projectRequest.count({ where: { tenantId, status: ProjectRequestStatus.REJECTED } }),
      this.prisma.projectRequest.count({ where: { tenantId, status: ProjectRequestStatus.CONVERTED_TO_PROJECT } }),
      this.prisma.projectRequest.groupBy({
        by: ['serviceType'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.projectRequest.groupBy({
        by: ['priority'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.projectRequest.aggregate({
        where: {
          tenantId,
          reviewedAt: { not: null }
        },
        _avg: {
          // This would need to be calculated differently in a real implementation
          // For now, returning 0 as placeholder
        }
      })
    ])

    return {
      total,
      pending,
      approved,
      rejected,
      converted,
      byServiceType: byServiceType.reduce((acc, item) => {
        acc[item.serviceType] = item._count
        return acc
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count
        return acc
      }, {} as Record<string, number>),
      avgResponseTime: 0, // Calculate based on createdAt and reviewedAt difference
    }
  }

  async searchByAddress(address: string, tenantId: string): Promise<ProjectRequest[]> {
    const requests = await this.prisma.projectRequest.findMany({
      where: {
        tenantId,
        OR: [
          { address: { contains: address, mode: 'insensitive' } },
          { city: { contains: address, mode: 'insensitive' } },
          { state: { contains: address, mode: 'insensitive' } },
        ],
      },
    })

    return requests.map(req => this.mapToEntity(req))
  }

  async searchByClientName(name: string, tenantId: string): Promise<ProjectRequest[]> {
    const requests = await this.prisma.projectRequest.findMany({
      where: {
        tenantId,
        clientName: { contains: name, mode: 'insensitive' },
      },
    })

    return requests.map(req => this.mapToEntity(req))
  }

  async searchByEmail(email: string, tenantId: string): Promise<ProjectRequest[]> {
    const requests = await this.prisma.projectRequest.findMany({
      where: {
        tenantId,
        clientEmail: { contains: email, mode: 'insensitive' },
      },
    })

    return requests.map(req => this.mapToEntity(req))
  }

  async findRequestsInDateRange(startDate: Date, endDate: Date, tenantId: string): Promise<ProjectRequest[]> {
    const requests = await this.prisma.projectRequest.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    return requests.map(req => this.mapToEntity(req))
  }

  async findPendingRequestsOlderThan(days: number, tenantId: string): Promise<ProjectRequest[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const requests = await this.prisma.projectRequest.findMany({
      where: {
        tenantId,
        status: ProjectRequestStatus.PENDING,
        createdAt: {
          lte: cutoffDate,
        },
      },
    })

    return requests.map(req => this.mapToEntity(req))
  }

  private buildWhereClause(filters?: ProjectRequestFilters) {
    if (!filters) return {}

    const where: any = {}

    if (filters.status) where.status = filters.status
    if (filters.priority) where.priority = filters.priority
    if (filters.serviceType) where.serviceType = filters.serviceType
    if (filters.assignedToId) where.assignedToId = filters.assignedToId
    if (filters.createdById) where.createdById = filters.createdById

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { clientName: { contains: filters.search, mode: 'insensitive' } },
        { clientEmail: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
      if (filters.dateTo) where.createdAt.lte = filters.dateTo
    }

    return where
  }

  private mapToEntity(data: any): ProjectRequest {
    return {
      id: data.id,
      serviceType: data.serviceType,
      status: data.status,
      priority: data.priority,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      companyName: data.companyName,
      address: data.address,
      address2: data.address2,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      title: data.title,
      description: data.description,
      estimatedBudget: data.estimatedBudget,
      preferredTimeline: data.preferredTimeline,
      propertyType: data.propertyType,
      roofType: data.roofType,
      estimatedSize: data.estimatedSize,
      assignedToId: data.assignedToId,
      assignedAt: data.assignedAt,
      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt,
      rejectionReason: data.rejectionReason,
      adminNotes: data.adminNotes,
      convertedToProjectId: data.convertedToProjectId,
      convertedAt: data.convertedAt,
      createdById: data.createdById,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      tenantId: data.tenantId,
    }
  }

  private mapToEntityWithRelations(data: any): ProjectRequestWithRelations {
    return {
      ...this.mapToEntity(data),
      createdBy: data.createdBy,
      assignedTo: data.assignedTo,
      convertedToProject: data.convertedToProject,
      _count: data._count,
    }
  }
}