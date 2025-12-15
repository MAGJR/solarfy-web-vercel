import { deleteUser } from '@/app/app/settings/user/actions'
import { User, UserRole, UserStatus, Permission, InviteUserInput, CreateTenantUserInput, UpdateTenantUserInput } from '../entities/user.entity'

export interface IUserRepository {
  // User operations
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByTenant(tenantId: string, options?: {
    page?: number
    limit?: number
    role?: UserRole
    status?: UserStatus
    search?: string
  }): Promise<{ users: User[], total: number }>

  create(input: CreateTenantUserInput): Promise<User>
  update(id: string, input: UpdateTenantUserInput): Promise<User>
  delete(id: string): Promise<void>

  // Invitation operations
  invite(input: InviteUserInput): Promise<{
    id: string
    email: string
    role: UserRole
    token: string
    expiresAt: Date
    invitedBy: string
    tenantId: string
  }>

  findByInvitationToken(token: string): Promise<{
    id: string
    email: string
    role: UserRole
    token: string
    expiresAt: Date
    invitedBy: string
    tenantId: string
  } | null>

  acceptInvitation(token: string, userData: {
    name: string
    password?: string
  }): Promise<User>
  
  deleteUser(id: string): Promise<User>

  cancelInvitation(token: string): Promise<void>

  // Status operations
  activateUser(id: string): Promise<User>
  deactivateUser(id: string): Promise<User>

  // Permission operations
  updatePermissions(id: string, permissions: Permission[]): Promise<User>

  // Role operations
  updateRole(id: string, role: UserRole): Promise<User>
}