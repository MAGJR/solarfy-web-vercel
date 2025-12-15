import { Invitation, InvitationStatus } from '@/domains/company/entities/company.entity'
import { IInvitationRepository } from '@/domains/company/repositories/invitation.repository.interface'
import { IEmailService } from '@/domains/emails/services/email.service.interface'
import { validateInviteUser, InviteUserInput as InviteUserFormData } from '@/application/schemas/company.schema'
import { generateInviteToken } from '@/infrastructure/auth/tokens'
import { PrismaUserRepository } from '@/infrastructure/repositories/prisma-user.repository'

export interface InviteUserInput {
  tenantId: string
  inviterId: string
  data: InviteUserFormData
}

export interface InviteUserOutput {
  success: boolean
  invitation?: Invitation
  error?: string
}

export class InviteUserUseCase {
  private userRepository = new PrismaUserRepository()

  constructor(
    private invitationRepository: IInvitationRepository,
    private emailService: IEmailService
  ) {}

  async execute(input: InviteUserInput): Promise<InviteUserOutput> {
    try {
      // Validate input data
      const validation = validateInviteUser(input.data)
      if (!validation.success) {
        const errorMessages = validation.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
        return {
          success: false,
          error: `Validation failed: ${errorMessages.join(', ')}`
        }
      }

      const validatedData = validation.data

      // Check if there's already a pending invitation for this email
      const existingInvitation = await this.invitationRepository.findByEmailAndTenant(
        validatedData.email,
        input.tenantId,
        InvitationStatus.PENDING
      )

      if (existingInvitation) {
        return {
          success: false,
          error: 'An invitation has already been sent to this email address'
        }
      }

      // Generate invitation token
      const token = generateInviteToken()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

      // Create invitation
      const invitation = await this.invitationRepository.create({
        email: validatedData.email,
        role: validatedData.role,
        token,
        message: validatedData.message,
        status: InvitationStatus.PENDING,
        invitedBy: input.inviterId,
        tenantId: input.tenantId,
        expiresAt,
      })

      // Send invitation email
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`

      // Get inviter name
      const inviter = await this.userRepository.findById(input.inviterId)
      const inviterName = inviter?.name || 'Your colleague'

      await this.emailService.sendInviteEmail({
        to: validatedData.email,
        inviteUrl,
        message: validatedData.message,
        inviterName,
        roleName: validatedData.role.toLowerCase().replace('_', ' '),
      })

      return {
        success: true,
        invitation
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invitation'
      }
    }
  }
}