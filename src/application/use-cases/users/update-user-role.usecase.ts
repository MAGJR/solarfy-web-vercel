import { validateUpdateUserRole } from '@/application/schemas/user.schema'
import { IUserRepository } from '@/domains/users/repositories/user.repository.interface'

export class UpdateUserRoleUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: unknown): Promise<{
    id: string
    name: string
    email: string
    role: string
    status: string
  }> {
    // Validar dados de entrada
    const validation = validateUpdateUserRole(input)

    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`)
    }

    const { userId, newRole, requestedBy } = validation.data

    // TODO: Check if requester has permission to change roles
    // Por enquanto, assumimos que a verificação de permissão é feita antes

    // Verificar se o usuário existe
    const existingUser = await this.userRepository.findById(userId)
    if (!existingUser) {
      throw new Error("User not found")
    }

    // Não permitir alterar o próprio role do solicitante (proteção adicional)
    if (userId === requestedBy) {
      throw new Error("Cannot change your own role")
    }

    // Atualizar o role do usuário
    const updatedUser = await this.userRepository.updateRole(userId, newRole)

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
    }
  }
}