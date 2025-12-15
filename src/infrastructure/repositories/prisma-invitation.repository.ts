import { Invitation, InvitationStatus, UserRole } from '@/domains/company/entities/company.entity'
import { IInvitationRepository } from '@/domains/company/repositories/invitation.repository.interface'
import { prisma } from '@/infrastructure/database/prisma'

export class PrismaInvitationRepository implements IInvitationRepository {
  async create(data: {
    email: string
    role: UserRole
    token: string
    message?: string
    status: InvitationStatus
    invitedBy: string
    tenantId: string
    expiresAt: Date
  }): Promise<Invitation> {
    const invitation = await prisma.invitation.create({
      data,
    })

    return this.mapPrismaInvitationToInvitation(invitation)
  }

  async findById(id: string): Promise<Invitation | null> {
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    })

    return invitation ? this.mapPrismaInvitationToInvitation(invitation) : null
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    })

    return invitation ? this.mapPrismaInvitationToInvitation(invitation) : null
  }

  async findByEmailAndTenant(
    email: string,
    tenantId: string,
    status?: InvitationStatus
  ): Promise<Invitation | null> {
    const invitation = await prisma.invitation.findFirst({
      where: {
        email,
        tenantId,
        ...(status && { status }),
      },
    })

    return invitation ? this.mapPrismaInvitationToInvitation(invitation) : null
  }

  async updateStatus(id: string, status: InvitationStatus): Promise<Invitation> {
    const invitation = await prisma.invitation.update({
      where: { id },
      data: { status },
    })

    return this.mapPrismaInvitationToInvitation(invitation)
  }

  async delete(id: string): Promise<void> {
    await prisma.invitation.delete({
      where: { id },
    })
  }

  async findPendingByTenantId(tenantId: string): Promise<Invitation[]> {
    const invitations = await prisma.invitation.findMany({
      where: {
        tenantId,
        status: InvitationStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return invitations.map(inv => this.mapPrismaInvitationToInvitation(inv))
  }

  private mapPrismaInvitationToInvitation(prismaInvitation: any): Invitation {
    return {
      id: prismaInvitation.id,
      email: prismaInvitation.email,
      role: prismaInvitation.role,
      token: prismaInvitation.token,
      message: prismaInvitation.message || undefined,
      status: prismaInvitation.status,
      invitedBy: prismaInvitation.invitedBy,
      tenantId: prismaInvitation.tenantId,
      expiresAt: prismaInvitation.expiresAt,
      createdAt: prismaInvitation.createdAt,
      updatedAt: prismaInvitation.updatedAt,
    }
  }
}