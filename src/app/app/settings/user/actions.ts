'use server'

import { auth } from '@/infrastructure/auth/auth.config'
import { GetUsersUseCase } from '@/application/use-cases/users/get-users.usecase'
import { UpdateUserRoleUseCase } from '@/application/use-cases/users/update-user-role.usecase'
import { PrismaUserRepository } from '@/infrastructure/repositories/prisma-user.repository'
import { UserRole, UserStatus } from '@/domains/users/entities/user.entity'
import { revalidatePath } from 'next/cache'
import { DeleteUserUseCase } from '@/application/use-cases/users/delete-user-role.usecase'
import { UpdateUserUseCase } from '@/application/use-cases/users/update-user.usecase'
import { GetUserByIdUseCase } from '@/application/use-cases/users/get-user-by-id.usecase'

// Instâncias do repositório e use cases
const userRepository = new PrismaUserRepository()
const getUsersUseCase = new GetUsersUseCase(userRepository)
const updateUserRoleUseCase = new UpdateUserRoleUseCase(userRepository)
const deleteUseCase = new DeleteUserUseCase(userRepository)
const updateUserUseCase = new UpdateUserUseCase(userRepository)
const getUserByIdUseCase = new GetUserByIdUseCase(userRepository)
/**
 * Server action para buscar usuários do tenant
 */
export async function getUsers(options?: {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
  search?: string
}) {
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

    // Obter tenantId do usuário autenticado
    const userWithTenant = await userRepository.findById(session.user.id)
    if (!userWithTenant?.tenantId) {
      return {
        success: false,
        error: 'User tenant not found',
      }
    }

    // Buscar usuários usando o use case
    const result = await getUsersUseCase.execute({
      ...options,
      tenantId: userWithTenant.tenantId,
    })

    return {
      success: true,
      data: result,
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
 * Server action para atualizar o role de um usuário
 */
export async function updateUserRole(formData: FormData) {
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

    // Extrair dados do formulário
    const userId = formData.get('userId') as string
    const newRole = formData.get('role') as UserRole

    // Executar use case
    const result = await updateUserRoleUseCase.execute({
      userId,
      newRole,
      requestedBy: session.user.id,
    })

    // Revalidar a página
    revalidatePath('/app/settings/user')

    return {
      success: true,
      message: `User role updated to ${newRole}`,
      user: result,
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
 * Server action para ativar/desativar um usuário
 */
export async function toggleUserStatus(userId: string, currentStatus: UserStatus) {
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

    // Não permitir alterar o próprio status do solicitante
    if (userId === session.user.id) {
      return {
        success: false,
        error: 'Cannot change your own status',
      }
    }

    const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE

    // const result = await userRepository.update(userId, { status: newStatus })

    // Mock implementation
    console.log(`🔄 User ${userId} status changed from ${currentStatus} to ${newStatus}`)

    // Revalidar a página
    revalidatePath('/app/settings/user')

    return {
      success: true,
      message: `User ${newStatus === UserStatus.ACTIVE ? 'activated' : 'deactivated'} successfully`,
      status: newStatus,
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
 * Server action para deletar um usuário
 */
export async function deleteUser(userId: string, userEmail: string) {
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

    const result = await deleteUseCase.execute({
      userId,
      requestedBy: session.user.id,
    })

    // Revalidar a página
    revalidatePath('/app/settings/user')

    return {
      success: result.success,
      message: result.message,
    }

  } catch (error) {
    console.error('Error deleting user:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user',
    }
  }
}

/**
 * Server action para buscar um usuário específico por ID
 */
export async function getUserById(userId: string) {
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

    // Buscar usuário usando o use case
    const result = await getUserByIdUseCase.execute({
      userId,
      requestingUserId: session.user.id,
    })

    if (!result) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    return {
      success: true,
      data: result,
    }

  } catch (error) {
    console.error('Error fetching user:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
    }
  }
}

export interface UpdateUserFormData {
  name?: string
  phone?: string
  role?: string
  status?: string
  permissions?: string[]
}

/**
 * Server action para atualizar dados de um usuário
 */
export async function updateUser(userId: string, formData: UpdateUserFormData) {
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

    // Executar use case de atualização
    const result = await updateUserUseCase.execute({
      userId,
      name: formData.name,
      phone: formData.phone,
      role: formData.role as UserRole,
      status: formData.status as UserStatus,
      permissions: formData.permissions as any[],
      requestedBy: session.user.id,
    })

    // Revalidar páginas
    revalidatePath('/app/settings/user')
    revalidatePath(`/app/settings/user/${userId}/edit`)

    return {
      success: true,
      message: 'User updated successfully',
      data: result,
    }

  } catch (error) {
    console.error('Error updating user:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    }
  }
}