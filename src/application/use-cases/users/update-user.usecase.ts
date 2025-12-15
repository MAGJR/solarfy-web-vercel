import { IUserRepository } from '@/domains/users/repositories/user.repository.interface'
import { UpdateTenantUserInput, UserRole, UserStatus, Permission } from '@/domains/users/entities/user.entity'

export interface UpdateUserInput {
  userId: string
  name?: string
  phone?: string
  role?: UserRole
  status?: UserStatus
  permissions?: Permission[]
  requestedBy: string
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: UpdateUserInput): Promise<{
    id: string
    name: string
    email: string
    phone?: string
    role: UserRole
    status: UserStatus
    permissions: Permission[]
    tenantId: string
    updatedAt: Date
  }> {
    const { userId, requestedBy, ...updateData } = input

    // Validate that the requesting user exists and has permissions
    const requestingUser = await this.userRepository.findById(requestedBy)
    if (!requestingUser) {
      throw new Error('Requesting user not found')
    }

    // Validate that the user to be updated exists
    const userToUpdate = await this.userRepository.findById(userId)
    if (!userToUpdate) {
      throw new Error('User to update not found')
    }

    // Validate that both users belong to the same tenant
    if (userToUpdate.tenantId !== requestingUser.tenantId) {
      throw new Error('Cannot update user from different tenant')
    }

    // Prevent users from changing their own role/status to avoid locking themselves out
    if (userId === requestedBy) {
      if (input.role && input.role !== requestingUser.role) {
        throw new Error('Cannot change your own role')
      }
      if (input.status && input.status === UserStatus.INACTIVE) {
        throw new Error('Cannot deactivate your own account')
      }
    }

    // Validate permissions for role changes
    if (input.role && input.role !== userToUpdate.role) {
      // Only ADMIN or MANAGER can change roles
      if (requestingUser.role !== UserRole.ADMIN && requestingUser.role !== UserRole.MANAGER) {
        throw new Error('Insufficient permissions to change user role')
      }

      // Only ADMIN can promote to ADMIN role
      if (input.role === UserRole.ADMIN && requestingUser.role !== UserRole.ADMIN) {
        throw new Error('Only ADMIN users can promote others to ADMIN role')
      }

      // Users can only be promoted to roles equal or lower than themselves
      const roleHierarchy = {
        [UserRole.VIEWER]: 1,
        [UserRole.TECHNICIAN]: 2,
        [UserRole.SALES_REP]: 3,
        [UserRole.MANAGER]: 4,
        [UserRole.ADMIN]: 5
      }

      if (roleHierarchy[input.role] > roleHierarchy[requestingUser.role]) {
        throw new Error('Cannot promote user to higher role than your own')
      }
    }

    // Validate permissions for status changes
    if (input.status && input.status !== userToUpdate.status) {
      // Only ADMIN or MANAGER can change status
      if (requestingUser.role !== UserRole.ADMIN && requestingUser.role !== UserRole.MANAGER) {
        throw new Error('Insufficient permissions to change user status')
      }
    }

    // Validate permissions for basic info updates
    if (input.name || input.phone) {
      // Users can update their own basic info, or ADMIN/MANAGER can update any user's info
      if (userId !== requestedBy && requestingUser.role !== UserRole.ADMIN && requestingUser.role !== UserRole.MANAGER) {
        throw new Error('Insufficient permissions to update user information')
      }
    }

    // Validate permissions if provided
    if (input.permissions) {
      // Only ADMIN can modify permissions
      if (requestingUser.role !== UserRole.ADMIN) {
        throw new Error('Only ADMIN users can modify permissions')
      }

      // Users can only grant permissions they have themselves
      const hasAllRequestedPermissions = input.permissions.every(
        permission => requestingUser.permissions.includes(permission)
      )

      if (!hasAllRequestedPermissions) {
        throw new Error('Cannot grant permissions that you do not have')
      }
    }

    // Prepare update data
    const updateTenantUserInput: UpdateTenantUserInput = {}

    if (input.name !== undefined) updateTenantUserInput.name = input.name
    if (input.phone !== undefined) updateTenantUserInput.phone = input.phone
    if (input.role !== undefined) updateTenantUserInput.role = input.role
    if (input.status !== undefined) updateTenantUserInput.status = input.status
    if (input.permissions !== undefined) updateTenantUserInput.permissions = input.permissions

    // Update user
    const updatedUser = await this.userRepository.update(userId, updateTenantUserInput)

    if (!updatedUser) {
      throw new Error('Failed to update user')
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      status: updatedUser.status,
      permissions: updatedUser.permissions,
      tenantId: updatedUser.tenantId,
      updatedAt: updatedUser.updatedAt
    }
  }
}