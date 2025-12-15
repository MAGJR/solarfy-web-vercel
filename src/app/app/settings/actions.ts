'use server'

import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { validateInviteUser } from '@/application/schemas/company.schema'
import { UpdateCompanyInfoUseCase } from '@/application/use-cases/company/update-company-info.use-case'
import { GetCompanyInfoUseCase } from '@/application/use-cases/company/get-company-info.use-case'
import { InviteUserUseCase } from '@/application/use-cases/users/invite-user.use-case'
import { PrismaCompanyRepository } from '@/infrastructure/repositories/prisma-company.repository'
import { PrismaInvitationRepository } from '@/infrastructure/repositories/prisma-invitation.repository'
import { ResendEmailService } from '@/infrastructure/emails/resend-email.service'
import { generateInviteToken } from '@/infrastructure/auth/tokens'

// Initialize repositories and use cases
const companyRepository = new PrismaCompanyRepository()
const invitationRepository = new PrismaInvitationRepository()
const emailService = new ResendEmailService()
const updateCompanyInfoUseCase = new UpdateCompanyInfoUseCase(companyRepository)
const getCompanyInfoUseCase = new GetCompanyInfoUseCase(companyRepository)
const inviteUserUseCase = new InviteUserUseCase(invitationRepository, emailService)


/**
 * Server action para salvar informações da empresa
 */
export async function saveCompanyInfo(formData: FormData) {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Obter tenantId do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return {
        success: false,
        error: 'Tenant not found',
      }
    }

    // Extrair e validar dados do formulário
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      address: formData.get('address') as string || undefined,
      website: formData.get('website') as string || undefined,
      taxId: formData.get('taxId') as string || undefined,
      description: formData.get('description') as string || undefined,
    }

    // Usar o use case para atualizar informações da empresa
    const result = await updateCompanyInfoUseCase.execute({
      tenantId: user.tenantId,
      data: rawData,
    })

    if (result.success) {
      // Revalidar a página
      revalidatePath('/app/settings')

      return {
        success: true,
        message: 'Company information saved successfully',
        data: result.company,
      }
    } else {
      return {
        success: false,
        error: result.error,
      }
    }

  } catch (error) {
    console.error('Error saving company info:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save company information',
    }
  }
}

/**
 * Server action para carregar informações da empresa
 */
export async function getCompanyInfo() {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Obter tenantId do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return {
        success: false,
        error: 'Tenant not found',
      }
    }

    // Usar o use case para obter informações da empresa
    const result = await getCompanyInfoUseCase.execute({
      tenantId: user.tenantId,
    })

    if (result.success) {
      return {
        success: true,
        data: result.company,
      }
    } else {
      // Se não encontrar company info, retornar dados padrão
      const defaultCompanyInfo = {
        name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        taxId: '',
        description: '',
      }

      return {
        success: true,
        data: defaultCompanyInfo,
      }
    }

  } catch (error) {
    console.error('Error loading company info:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load company information',
    }
  }
}

/**
 * Server action para convidar um usuário
 */
export async function inviteUser(formData: FormData) {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      console.error('❌ No session or user ID found in inviteUser')
      return {
        success: false,
        error: 'Unauthorized - No valid session found',
      }
    }

    console.log('✅ Session found for inviteUser:', session.user.id)

    // Obter tenantId do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return {
        success: false,
        error: 'Tenant not found',
      }
    }

    // Extrair e validar dados do formulário
    const rawData = {
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      message: formData.get('message') as string || undefined,
    }

    // Validar dados
    const validation = validateInviteUser(rawData)
    if (!validation.success) {
      const errorMessages = validation.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
      return {
        success: false,
        error: `Validation failed: ${errorMessages.join(', ')}`,
      }
    }

    const validatedData = validation.data

    // Usar o use case para enviar convite
    const result = await inviteUserUseCase.execute({
      tenantId: user.tenantId,
      inviterId: session.user.id,
      data: validatedData,
    })

    if (result.success) {
      // Revalidar a página
      revalidatePath('/app/settings/invite')

      return {
        success: true,
        message: 'Invitation sent successfully',
        invitation: result.invitation,
      }
    } else {
      return {
        success: false,
        error: result.error,
      }
    }

  } catch (error) {
    console.error('Error inviting user:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invitation',
    }
  }
}

/**
 * Server action para obter lista de usuários
 */
export async function getUsers() {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Obter tenantId do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return {
        success: false,
        error: 'Tenant not found',
      }
    }

    // Buscar usuários do mesmo tenant
    const users = await prisma.user.findMany({
      where: { tenantId: user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        status: true,
      },
    })

    return {
      success: true,
      data: users,
    }

  } catch (error) {
    console.error('Error fetching users:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    }
  }
}

/**
 * Server action para atualizar role de usuário
 */
export async function updateUserRole(userId: string, newRole: string) {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // TODO: Implementar validação de permissões e atualização no banco
    console.log('🔄 Updating user role:', {
      userId,
      newRole,
      updatedBy: session.user.id,
      updatedAt: new Date(),
    })

    // Mock implementation
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { role: newRole },
    // })

    // Revalidar a página
    revalidatePath('/app/settings/user')

    return {
      success: true,
      message: 'User role updated successfully',
    }

  } catch (error) {
    console.error('Error updating user role:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role',
    }
  }
}

/**
 * Server action para alternar status de usuário
 */
export async function toggleUserStatus(userId: string, newStatus: 'active' | 'inactive') {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // TODO: Implementar validação de permissões e atualização no banco
    console.log('🔄 Toggling user status:', {
      userId,
      newStatus,
      updatedBy: session.user.id,
      updatedAt: new Date(),
    })

    // Mock implementation
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { status: newStatus },
    // })

    // Revalidar a página
    revalidatePath('/app/settings/user')

    return {
      success: true,
      message: `User ${newStatus}d successfully`,
    }

  } catch (error) {
    console.error('Error toggling user status:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user status',
    }
  }
}

/**
 * Server action para obter convites pendentes
 */
export async function getPendingInvitations() {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Obter tenantId do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return {
        success: false,
        error: 'Tenant not found',
      }
    }

    // Buscar convites pendentes do tenant
    const invitations = await prisma.invitation.findMany({
      where: {
        tenantId: user.tenantId,
        status: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        role: true,
        message: true,
        createdAt: true,
        expiresAt: true,
        invitedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Obter nome dos convidadores
    const inviterIds = Array.from(new Set(invitations.map(inv => inv.invitedBy)))
    const inviters = await prisma.user.findMany({
      where: {
        id: { in: inviterIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    const inviterMap = new Map(inviters.map(inv => [inv.id, inv.name || inv.email]))

    const formattedInvitations = invitations.map(inv => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      message: inv.message,
      invitedAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt.toISOString(),
      invitedBy: inviterMap.get(inv.invitedBy) || 'Unknown',
      status: 'pending' as const,
    }))

    return {
      success: true,
      invitations: formattedInvitations,
    }

  } catch (error) {
    console.error('Error fetching invitations:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invitations',
    }
  }
}

/**
 * Server action para cancelar um convite
 */
export async function cancelInvitation(invitationId: string) {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Obter tenantId do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return {
        success: false,
        error: 'Tenant not found',
      }
    }

    // Verificar se o convite pertence ao tenant do usuário
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        tenantId: user.tenantId,
      },
    })

    if (!invitation) {
      return {
        success: false,
        error: 'Invitation not found',
      }
    }

    // Cancelar o convite (mudar status para CANCELLED)
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' },
    })

    // Revalidar a página
    revalidatePath('/app/settings/invite')

    return {
      success: true,
      message: 'Invitation cancelled successfully',
    }

  } catch (error) {
    console.error('Error cancelling invitation:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel invitation',
    }
  }
}

/**
 * Server action para reenviar um convite
 */
export async function resendInvitation(invitationId: string) {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Obter tenantId do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return {
        success: false,
        error: 'Tenant not found',
      }
    }

    // Verificar se o convite pertence ao tenant do usuário
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        tenantId: user.tenantId,
      },
    })

    if (!invitation) {
      return {
        success: false,
        error: 'Invitation not found',
      }
    }

    // Obter informações do convidador
    const inviter = await prisma.user.findUnique({
      where: { id: invitation.invitedBy },
      select: {
        name: true,
        email: true,
      },
    })

    // Gerar novo token e atualizar expiração
    const token = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token,
        expiresAt,
        status: 'PENDING',
      },
    })

    // Enviar e-mail novamente
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`
    const inviterName = inviter?.name || inviter?.email || 'Your colleague'

    await emailService.sendInviteEmail({
      to: invitation.email,
      inviteUrl,
      message: invitation.message || undefined,
      inviterName,
      roleName: invitation.role.toLowerCase().replace('_', ' '),
    })

    // Revalidar a página
    revalidatePath('/app/settings/invite')

    return {
      success: true,
      message: 'Invitation resent successfully',
    }

  } catch (error) {
    console.error('Error resending invitation:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend invitation',
    }
  }
}

/**
 * Server action para deletar usuário
 */
export async function deleteUser(userId: string) {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // TODO: Implementar validação de permissões e deleção no banco
    console.log('🗑️ Deleting user:', {
      userId,
      deletedBy: session.user.id,
      deletedAt: new Date(),
    })

    // Mock implementation
    // await prisma.user.delete({
    //   where: { id: userId },
    // })

    // Revalidar a página
    revalidatePath('/app/settings/user')

    return {
      success: true,
      message: 'User deleted successfully',
    }

  } catch (error) {
    console.error('Error deleting user:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    }
  }
}