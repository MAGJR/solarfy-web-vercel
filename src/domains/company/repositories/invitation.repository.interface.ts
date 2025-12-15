import { Invitation, InvitationStatus, UserRole } from '../entities/company.entity'

export interface IInvitationRepository {
  create(data: {
    email: string
    role: UserRole
    token: string
    message?: string
    status: InvitationStatus
    invitedBy: string
    tenantId: string
    expiresAt: Date
  }): Promise<Invitation>
  findById(id: string): Promise<Invitation | null>
  findByToken(token: string): Promise<Invitation | null>
  findByEmailAndTenant(email: string, tenantId: string, status?: InvitationStatus): Promise<Invitation | null>
  updateStatus(id: string, status: InvitationStatus): Promise<Invitation>
  delete(id: string): Promise<void>
  findPendingByTenantId(tenantId: string): Promise<Invitation[]>
}