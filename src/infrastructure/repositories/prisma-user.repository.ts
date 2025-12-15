import {
  User,
  UserRole,
  UserStatus,
  Permission,
  InviteUserInput,
  CreateTenantUserInput,
  UpdateTenantUserInput
} from '@/domains/users/entities/user.entity'
import { IUserRepository } from '@/domains/users/repositories/user.repository.interface'
import { prisma } from '@/infrastructure/database/prisma'
import crypto from 'crypto'

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
        // TODO: Adicionar campos que estão faltando no schema Prisma
        // phone: true,
        // status: true,
        // permissions: true,
      }
    })

    if (!user) return null

    // Mapear do schema Prisma para a entidade User
    return {
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: undefined, // TODO: Implementar quando tiver no schema
      role: user.role as UserRole,
      status: UserStatus.ACTIVE, // TODO: Implementar quando tiver no schema
      tenantId: user.tenantId || 'default-tenant', // Fallback para evitar tenantId vazio
      permissions: [], // TODO: Implementar quando tiver no schema
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
      }
    })

    if (!user) return null

    return {
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: undefined,
      role: user.role as UserRole,
      status: UserStatus.ACTIVE,
      tenantId: user.tenantId || '',
      permissions: [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async findByTenant(tenantId: string, options?: {
    page?: number
    limit?: number
    role?: UserRole
    status?: UserStatus
    search?: string
  }): Promise<{ users: User[], total: number }> {
    const page = options?.page || 1
    const limit = options?.limit || 20
    const skip = (page - 1) * limit

    const where = {
      tenantId,
      ...(options?.role && { role: options.role }),
      ...(options?.search && {
        OR: [
          { name: { contains: options.search, mode: 'insensitive' as const } },
          { email: { contains: options.search, mode: 'insensitive' as const } },
        ],
      }),
      // TODO: Implementar filtro por status quando tiver no schema
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          tenantId: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: undefined,
      role: user.role as UserRole,
      status: UserStatus.ACTIVE,
      tenantId: user.tenantId || '',
      permissions: [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    return {
      users: transformedUsers,
      total,
    }
  }

  async create(input: CreateTenantUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        tenantId: input.tenantId,
        // TODO: Implementar campos adicionais quando tiver no schema
        // phone: input.phone,
        // status: input.status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
      },
    })

    return {
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: input.phone,
      role: user.role as UserRole,
      status: UserStatus.ACTIVE,
      tenantId: user.tenantId || '',
      permissions: input.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async update(id: string, input: UpdateTenantUserInput): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.role && { role: input.role }),
        // TODO: Implementar campos adicionais quando tiver no schema
        // ...(input.phone && { phone: input.phone }),
        // ...(input.status && { status: input.status }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
      },
    })

    return {
      id: user.id,
      name: user.name || '',
      email: user.email,
      phone: undefined,
      role: user.role as UserRole,
      status: UserStatus.ACTIVE,
      tenantId: user.tenantId || '',
      permissions: input.permissions || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    await prisma.user.delete({
      where: { id },
    })

    return user
  }

  async invite(input: InviteUserInput): Promise<{
    id: string
    email: string
    role: UserRole
    token: string
    expiresAt: Date
    invitedBy: string
    tenantId: string
  }> {
    // TODO: Implementar tabela de convites no schema Prisma
    // Por enquanto, vamos gerar o token e retornar um objeto mock

    const invitationToken = crypto.randomBytes(32).toString('hex')
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    // Mock implementation - na realidade, salvaríamos no banco
    const invitation = {
      id: crypto.randomUUID(),
      email: input.email,
      role: input.role,
      token: invitationToken,
      expiresAt: invitationExpires,
      invitedBy: input.invitedBy,
      tenantId: input.tenantId,
    }

    console.log('📧 Mock invitation created:', invitation)

    return invitation
  }

  async findByInvitationToken(token: string): Promise<{
    id: string
    email: string
    role: UserRole
    token: string
    expiresAt: Date
    invitedBy: string
    tenantId: string
  } | null> {
    // TODO: Implementar quando tiver tabela de convites
    // Por enquanto, return null (não encontrado)
    return null
  }

  async acceptInvitation(token: string, userData: {
    name: string
    password?: string
  }): Promise<User> {
    // TODO: Implementar quando tiver tabela de convites
    throw new Error('Not implemented yet')
  }

  async cancelInvitation(token: string): Promise<void> {
    // TODO: Implementar quando tiver tabela de convites
    console.log('📧 Mock invitation cancelled:', token)
  }

  async activateUser(id: string): Promise<User> {
    // TODO: Implementar quando tiver campo status no schema
    return this.findById(id) || Promise.reject(new Error('User not found'))
  }

  async deactivateUser(id: string): Promise<User> {
    // TODO: Implementar quando tiver campo status no schema
    return this.findById(id) || Promise.reject(new Error('User not found'))
  }

  async updatePermissions(id: string, permissions: Permission[]): Promise<User> {
    // TODO: Implementar quando tiver campo permissions no schema
    const user = await this.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    return {
      ...user,
      permissions,
      updatedAt: new Date(),
    }
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const updatedUser = await this.update(id, { role })
    return updatedUser
  }
}