import type { PrismaClient } from '@prisma/client'
import { SupportTicket, TicketResponse, TicketStatus, TicketPriority } from '@prisma/client'
import {
  ISupportRepository,
  type CreateTicketInput,
  type UpdateTicketInput,
  type AddTicketResponseInput,
  type GetTicketsOptions,
  type TicketStats
} from '@/domains/support/repositories/support.repository.interface'
import {
  SupportTicket as SupportTicketEntity,
  TicketResponse as TicketResponseEntity
} from '@/domains/support/entities/support-ticket.entity'

export class PrismaSupportRepository implements ISupportRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateTicketInput): Promise<SupportTicketEntity> {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        subject: input.subject,
        description: input.description,
        priority: input.priority,
        category: input.category,
        createdById: input.createdById,
        tenantId: input.tenantId,
      },
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
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return this.mapToEntity(ticket)
  }

  async findById(id: string): Promise<SupportTicketEntity | null> {
    const ticket = await this.prisma.supportTicket.findUnique({
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
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return ticket ? this.mapToEntity(ticket) : null
  }

  async update(id: string, input: UpdateTicketInput): Promise<SupportTicketEntity> {
    const ticket = await this.prisma.supportTicket.update({
      where: { id },
      data: input,
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
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return this.mapToEntity(ticket)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supportTicket.delete({
      where: { id },
    })
  }

  async findMany(options: GetTicketsOptions): Promise<{
    tickets: SupportTicketEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const where = this.buildWhereClause(options)

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
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
          responses: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ])

    return {
      tickets: tickets.map(ticket => this.mapToEntity(ticket)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async addResponse(input: AddTicketResponseInput): Promise<TicketResponseEntity> {
    const response = await this.prisma.ticketResponse.create({
      data: {
        content: input.content,
        isInternal: input.isInternal || false,
        ticketId: input.ticketId,
        userId: input.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return this.mapResponseToEntity(response)
  }

  async updateResponse(id: string, content: string): Promise<TicketResponseEntity> {
    const response = await this.prisma.ticketResponse.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return this.mapResponseToEntity(response)
  }

  async deleteResponse(id: string): Promise<void> {
    await this.prisma.ticketResponse.delete({
      where: { id },
    })
  }

  async getStats(tenantId: string, userId?: string, userRole?: string): Promise<TicketStats> {
    const where = { tenantId }

    // If user is a technician, only get stats for their assigned tickets
    if (userRole === 'TECHNICIAN' && userId) {
      const [total, open, inProgress, resolved, closed, urgent] = await Promise.all([
        this.prisma.supportTicket.count({ where: { ...where, assignedToId: userId } }),
        this.prisma.supportTicket.count({ where: { ...where, assignedToId: userId, status: 'OPEN' } }),
        this.prisma.supportTicket.count({ where: { ...where, assignedToId: userId, status: 'IN_PROGRESS' } }),
        this.prisma.supportTicket.count({ where: { ...where, assignedToId: userId, status: 'RESOLVED' } }),
        this.prisma.supportTicket.count({ where: { ...where, assignedToId: userId, status: 'CLOSED' } }),
        this.prisma.supportTicket.count({ where: { ...where, assignedToId: userId, priority: 'URGENT' } }),
      ])

      return {
        total,
        open,
        inProgress,
        resolved,
        closed,
        urgent,
        myAssigned: total,
      }
    }

    // For other roles, get general tenant stats
    const [total, open, inProgress, resolved, closed, urgent, myAssigned] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { ...where, status: 'CLOSED' } }),
      this.prisma.supportTicket.count({ where: { ...where, priority: 'URGENT' } }),
      userId ? this.prisma.supportTicket.count({ where: { ...where, assignedToId: userId } }) : 0,
    ])

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      urgent,
      myAssigned,
    }
  }

  async findUnassignedTickets(tenantId: string): Promise<SupportTicketEntity[]> {
    const tickets = await this.prisma.supportTicket.findMany({
      where: {
        tenantId,
        assignedToId: null,
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
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
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return tickets.map(ticket => this.mapToEntity(ticket))
  }

  async assignTicket(ticketId: string, technicianId: string): Promise<SupportTicketEntity> {
    const ticket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToId: technicianId,
        status: TicketStatus.IN_PROGRESS,
      },
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
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return this.mapToEntity(ticket)
  }

  async searchTickets(tenantId: string, query: string, limit = 10): Promise<SupportTicketEntity[]> {
    const tickets = await this.prisma.supportTicket.findMany({
      where: {
        tenantId,
        OR: [
          { subject: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
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
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return tickets.map(ticket => this.mapToEntity(ticket))
  }

  async findUserTickets(userId: string, tenantId: string, options?: Partial<GetTicketsOptions>): Promise<SupportTicketEntity[]> {
    const tickets = await this.prisma.supportTicket.findMany({
      where: {
        tenantId,
        createdById: userId,
        ...this.buildWhereClause({ tenantId, createdById: userId, ...options }),
      },
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
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return tickets.map(ticket => this.mapToEntity(ticket))
  }

  async findAssignedTickets(technicianId: string, tenantId: string): Promise<SupportTicketEntity[]> {
    const tickets = await this.prisma.supportTicket.findMany({
      where: {
        tenantId,
        assignedToId: technicianId,
      },
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
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return tickets.map(ticket => this.mapToEntity(ticket))
  }

  private buildWhereClause(options: GetTicketsOptions) {
    const where: any = {
      tenantId: options.tenantId,
    }

    if (options.status) {
      where.status = options.status
    }

    if (options.priority) {
      where.priority = options.priority
    }

    if (options.category) {
      where.category = options.category
    }

    if (options.assignedToId) {
      where.assignedToId = options.assignedToId
    }

    if (options.createdById) {
      where.createdById = options.createdById
    }

    if (options.search) {
      where.OR = [
        { subject: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ]
    }

    return where
  }

  private mapToEntity(ticket: any): SupportTicketEntity {
    return {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status as any,
      priority: ticket.priority as any,
      category: ticket.category as any,
      tenantId: ticket.tenantId,
      createdById: ticket.createdById,
      assignedToId: ticket.assignedToId,
      resolvedAt: ticket.resolvedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      createdBy: ticket.createdBy,
      assignedTo: ticket.assignedTo,
      responses: ticket.responses?.map(response => this.mapResponseToEntity(response)),
    }
  }

  private mapResponseToEntity(response: any): TicketResponseEntity {
    return {
      id: response.id,
      content: response.content,
      isInternal: response.isInternal,
      ticketId: response.ticketId,
      userId: response.userId,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      user: response.user,
    }
  }
}