import { IUserRepository } from '@/domains/users/repositories/user.repository.interface'
import { validateInviteUser } from '@/application/schemas'
import crypto from 'crypto'

export class InviteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: unknown): Promise<{
    id: string
    email: string
    role: string
    token: string
    expiresAt: Date
    invitedBy: string
    tenantId: string
  }> {
    // Validar dados de entrada usando Zod
    const validation = validateInviteUser(input)

    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`)
    }

    const validatedInput = validation.data

    // Verificar se já existe usuário com este email
    const existingUser = await this.userRepository.findByEmail(validatedInput.email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Gerar token de convite único e seguro
    const invitationToken = crypto.randomBytes(32).toString('hex')
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    // Criar convite usando o repositório
    const invitation = await this.userRepository.invite({
      ...validatedInput,
      token: invitationToken, // O repositório irá gerar o token, mas incluímos aqui como referência
      expiresAt: invitationExpires,
    })

    return invitation
  }
}