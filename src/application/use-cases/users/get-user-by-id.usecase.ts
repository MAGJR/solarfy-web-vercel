import { IUserRepository } from '@/domains/users/repositories/user.repository.interface'

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: { userId: string; requestingUserId: string }): Promise<{
    id: string
    name: string
    email: string
    phone?: string
    role: string
    status: string
    permissions: string[]
    tenantId: string
    createdAt: Date
    updatedAt: Date
  } | null> {
    const { userId, requestingUserId } = input

    // Get the requesting user to validate permissions
    const requestingUser = await this.userRepository.findById(requestingUserId)
    if (!requestingUser) {
      throw new Error('Requesting user not found')
    }

    // Users can view their own profile, or ADMIN/MANAGER can view any user's profile
    if (userId !== requestingUserId &&
        requestingUser.role !== 'ADMIN' &&
        requestingUser.role !== 'MANAGER') {
      throw new Error('Insufficient permissions to view user profile')
    }

    // Get the user to be displayed
    const user = await this.userRepository.findById(userId)
    if (!user) {
      return null
    }

    // Validate that both users belong to the same tenant
    if (user.tenantId !== requestingUser.tenantId) {
      throw new Error('Cannot view user from different tenant')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      permissions: user.permissions,
      tenantId: user.tenantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}