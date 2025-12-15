import { IUserRepository } from '@/domains/users/repositories/user.repository.interface'
import { validateUserQuery } from '@/application/schemas'

export class GetUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: unknown & { tenantId: string }): Promise<{
    users: Array<{
      id: string
      name: string
      email: string
      role: string
      status: string
      createdAt: Date
      lastLogin?: Date
    }>
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    // Validar dados de entrada usando Zod
    const validation = validateUserQuery(input)

    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`)
    }

    const validatedInput = validation.data

    // Buscar usuários usando o repositório
    const { users, total } = await this.userRepository.findByTenant(
      input.tenantId,
      {
        page: validatedInput.page,
        limit: validatedInput.limit,
        role: validatedInput.role,
        status: validatedInput.status,
        search: validatedInput.search,
      }
    )

    // Transformar dados para o formato esperado
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: undefined, // TODO: Implementar lastLogin no banco de dados
    }))

    return {
      users: transformedUsers,
      total,
      page: validatedInput.page,
      limit: validatedInput.limit,
      totalPages: Math.ceil(total / validatedInput.limit),
    }
  }
}