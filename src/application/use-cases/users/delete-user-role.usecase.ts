import { validateDeleteUser } from '@/application/schemas/user.schema'
import { IUserRepository } from '@/domains/users/repositories/user.repository.interface'
import { UserRole } from '@/domains/users/entities/user.entity'


export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: unknown): Promise<{
    success: boolean
    message: string
    deletedUserId: string
  }> {
    const validation = validateDeleteUser(input)

    if(!validation.success) {
      const errorMessage = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`Validation failed: ${errorMessage.join(', ')}`)
    }

    const {userId, requestedBy} = validation.data

    const requester = await this.userRepository.findById(requestedBy)
    if(!requester?.tenantId) {
      throw new Error("Requester not found or has no tenant")
    }

    if(userId === requestedBy) {
      throw new Error("Cannot delete your own account")
    }

    const targetUser = await this.userRepository.findById(userId)
    if(!targetUser) {
      throw new Error("User not found")
    }

    if(targetUser.tenantId !== requester.tenantId) {
      throw new Error("Access denied: user belongs to different tenant")
    }

    if(requester.role !== UserRole.ADMIN) {
      throw new Error("Insufficient permissions: only ADMIN can delete users")
    }

    await this.userRepository.delete(userId)

    return {
      success: true,
      message: 'User deleted successfully',
      deletedUserId: userId,
    }
  }
}