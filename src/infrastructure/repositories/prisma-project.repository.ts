import { PrismaClient, Project, ProjectStatus } from '@prisma/client'
import {
  ProjectRepository,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectWithRelations
} from '@/domains/projects/repositories/project.repository.interface'

export class PrismaProjectRepository implements ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProjectInput): Promise<Project> {
    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        estimatedKw: data.estimatedKw,
        estimatedPrice: data.estimatedPrice,
        customerId: data.customerId,
        createdById: data.createdById,

        // New fields for Lead integration and Map
        crmLeadId: data.crmLeadId,
        address: data.address,
        email: data.email,
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: {
        crmLead: true,
        customer: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async findById(id: string): Promise<ProjectWithRelations | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        crmLead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            status: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!project) return null

    return this.mapToProjectWithRelations(project)
  }

  async findAll(filters: {
    status?: string
    search?: string
    page?: number
    limit?: number
    createdBy?: string
  } = {}): Promise<{ projects: ProjectWithRelations[]; total: number }> {
    const { status, search, page = 1, limit = 50, createdBy } = filters
    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status as ProjectStatus
    }

    if (createdBy) {
      where.createdById = createdBy
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { crmLead: { name: { contains: search, mode: 'insensitive' } } },
        { crmLead: { company: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          crmLead: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
              status: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ])

    return {
      projects: projects.map(project => this.mapToProjectWithRelations(project)),
      total,
    }
  }

  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        estimatedKw: data.estimatedKw,
        estimatedPrice: data.estimatedPrice,

        // New fields for Lead integration and Map
        crmLeadId: data.crmLeadId,
        address: data.address,
        email: data.email,
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: {
        crmLead: true,
        customer: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id },
    })
  }

  async findByCrmLeadId(crmLeadId: string): Promise<ProjectWithRelations | null> {
    const project = await this.prisma.project.findFirst({
      where: { crmLeadId },
      include: {
        crmLead: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            status: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!project) return null

    return this.mapToProjectWithRelations(project)
  }

  async findAvailableLeads(): Promise<Array<{
    id: string
    name: string
    email: string
    phone?: string
    company: string
    status: string
  }>> {
    // Return ALL CRM leads for project creation, not just those without projects
    const leads = await this.prisma.crmLead.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return leads
  }

  async searchByAddress(address: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        address: {
          contains: address,
          mode: 'insensitive',
        },
      },
      include: {
        crmLead: true,
        customer: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  async findByCoordinates(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<Project[]> {
    // Simple bounding box search for coordinates within radius
    // In a production environment, you might want to use PostGIS for more accurate spatial queries
    const latRange = radiusKm / 111 // Approximate km per degree latitude
    const lngRange = radiusKm / (111 * Math.cos(latitude * Math.PI / 180)) // Adjust for longitude

    return this.prisma.project.findMany({
      where: {
        AND: [
          { latitude: { gte: latitude - latRange } },
          { latitude: { lte: latitude + latRange } },
          { longitude: { gte: longitude - lngRange } },
          { longitude: { lte: longitude + lngRange } },
        ],
      },
      include: {
        crmLead: true,
        customer: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  }

  private mapToProjectWithRelations(project: any): ProjectWithRelations {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      estimatedKw: project.estimatedKw,
      estimatedPrice: project.estimatedPrice,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      customerId: project.customerId,
      createdById: project.createdById,

      // New fields for Lead integration and Map
      crmLeadId: project.crmLeadId,
      address: project.address,
      email: project.email,
      phone: project.phone,
      latitude: project.latitude,
      longitude: project.longitude,

      // Relations
      crmLead: project.crmLead,
      customer: project.customer,
      createdBy: project.createdBy,
    }
  }
}