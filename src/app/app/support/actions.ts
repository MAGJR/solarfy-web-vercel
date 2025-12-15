'use server'

import { auth } from '@/infrastructure/auth/auth.config'
import { headers } from 'next/headers'
import { prisma } from '@/infrastructure/database/prisma'
import { PrismaSupportRepository } from '@/infrastructure/repositories/prisma-support.repository'
import { CreateTicketUseCase } from '@/application/use-cases/support/create-ticket.usecase'
import { GetTicketsUseCase } from '@/application/use-cases/support/get-tickets.usecase'
import { AssignTicketUseCase } from '@/application/use-cases/support/assign-ticket.usecase'
import { AddTicketResponseUseCase } from '@/application/use-cases/support/add-response.usecase'
import { UpdateTicketStatusUseCase } from '@/application/use-cases/support/update-ticket-status.usecase'
import { UpdateTicketCategoryUseCase } from '@/application/use-cases/support/update-ticket-category.usecase'
import { GetTicketStatsUseCase } from '@/application/use-cases/support/get-ticket-stats.usecase'
import { revalidatePath } from 'next/cache'
import { TicketStatus, TicketPriority, TicketCategory } from '@/domains/support/entities/support-ticket.entity'

// Re-export types for component usage
export type { TicketStatus, TicketPriority, TicketCategory }

// Helper function to get authenticated session
async function getAuthenticatedSession() {
  try {
    // Use the same pattern as the working settings.ts file
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      console.log('Session not found or user ID missing', { session: !!session, userId: session?.user?.id })
      return {
        success: false,
        error: 'Unauthorized - No active session found',
        session: null,
      }
    }

    return {
      success: true,
      error: null,
      session,
    }
  } catch (error) {
    console.error('Error getting authenticated session:', error)
    return {
      success: false,
      error: 'Authentication error',
      session: null,
    }
  }
}

// Initialize repository and use cases
const supportRepository = new PrismaSupportRepository(prisma)
const createTicketUseCase = new CreateTicketUseCase(supportRepository)
const getTicketsUseCase = new GetTicketsUseCase(supportRepository)
const assignTicketUseCase = new AssignTicketUseCase(supportRepository)
const addTicketResponseUseCase = new AddTicketResponseUseCase(supportRepository)
const updateTicketStatusUseCase = new UpdateTicketStatusUseCase(supportRepository)
const updateTicketCategoryUseCase = new UpdateTicketCategoryUseCase(supportRepository)
const getTicketStatsUseCase = new GetTicketStatsUseCase(supportRepository)

/**
 * Server Action to create a new support ticket
 */
export async function createTicket(formData: FormData) {
  try {
    // Authenticate user
    const authResult = await getAuthenticatedSession()

    if (!authResult.success || !authResult.session) {
      return {
        success: false,
        error: authResult.error || 'Authentication failed',
      }
    }

    const session = authResult.session

    // Get user with tenant information
    const userWithTenant = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        tenantId: true,
        role: true,
      },
    })

    if (!userWithTenant?.tenantId) {
      return {
        success: false,
        error: 'User tenant not found',
      }
    }

    // Extract form data
    const subject = formData.get('subject') as string
    const description = formData.get('description') as string
    const priority = formData.get('priority') as TicketPriority
    const category = formData.get('category') as TicketCategory

    // Create ticket
    const ticket = await createTicketUseCase.execute(
      {
        subject,
        description,
        priority,
        category,
        createdById: userWithTenant.id,
        tenantId: userWithTenant.tenantId,
      },
      userWithTenant.role
    )

    // Revalidate the support page
    revalidatePath('/app/support')

    return {
      success: true,
      message: 'Ticket created successfully',
      ticket,
    }

  } catch (error) {
    console.error('Error creating ticket:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create ticket',
    }
  }
}

/**
 * Server Action to get tickets with filtering
 */
export async function getTickets(options?: {
  page?: number
  limit?: number
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  search?: string
}) {
  try {
    // Authenticate user - use same pattern as createTicket
    const authResult = await getAuthenticatedSession()

    if (!authResult.success || !authResult.session) {
      return {
        success: false,
        error: authResult.error || 'Authentication failed',
      }
    }

    const session = authResult.session

    // Get user with tenant information
    const userWithTenant = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        tenantId: true,
        role: true,
      },
    })

    if (!userWithTenant?.tenantId) {
      return {
        success: false,
        error: 'User tenant not found',
      }
    }

    // Get tickets using use case
    const result = await getTicketsUseCase.execute(
      {
        tenantId: userWithTenant.tenantId,
        userId: userWithTenant.id,
        userRole: userWithTenant.role,
        ...options,
      },
      userWithTenant.role,
      userWithTenant.id
    )

    return {
      success: true,
      data: result,
    }

  } catch (error) {
    console.error('Error fetching tickets:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tickets',
    }
  }
}

/**
 * Server Action to add a response to a ticket
 */
export async function addTicketResponse(formData: FormData) {
  try {
    // Authenticate user
    const authResult = await getAuthenticatedSession()

    if (!authResult.success || !authResult.session) {
      return {
        success: false,
        error: authResult.error || 'Authentication failed',
      }
    }

    const session = authResult.session

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Extract form data
    const ticketId = formData.get('ticketId') as string
    const content = formData.get('content') as string
    const isInternal = formData.get('isInternal') === 'true'

    // Add response
    const response = await addTicketResponseUseCase.execute(
      {
        ticketId,
        content,
        isInternal,
        userId: session.user.id,
      },
      user.role
    )

    // Revalidate the support page
    revalidatePath('/app/support')

    return {
      success: true,
      message: 'Response added successfully',
      response,
    }

  } catch (error) {
    console.error('Error adding response:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add response',
    }
  }
}

/**
 * Server Action to assign a ticket to a technician
 */
export async function assignTicket(formData: FormData) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Extract form data
    const ticketId = formData.get('ticketId') as string
    const technicianId = formData.get('technicianId') as string

    // Assign ticket
    const ticket = await assignTicketUseCase.execute(
      {
        ticketId,
        technicianId,
        requestedBy: session.user.id,
      },
      user.role
    )

    // Revalidate the support page
    revalidatePath('/app/support')

    return {
      success: true,
      message: 'Ticket assigned successfully',
      ticket,
    }

  } catch (error) {
    console.error('Error assigning ticket:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign ticket',
    }
  }
}

/**
 * Server Action to update ticket status
 */
export async function updateTicketStatus(formData: FormData) {
  try {
    // Authenticate user - using the same pattern as other functions
    const authResult = await getAuthenticatedSession()

    if (!authResult.success || !authResult.session) {
      return {
        success: false,
        error: authResult.error || 'Authentication failed',
      }
    }

    const session = authResult.session

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Extract form data
    const ticketId = formData.get('ticketId') as string
    const status = formData.get('status') as TicketStatus

    // Update status
    const ticket = await updateTicketStatusUseCase.execute(
      {
        ticketId,
        status,
        updatedBy: session.user.id,
      },
      user.role
    )

    // Revalidate the support page
    revalidatePath('/app/support')

    return {
      success: true,
      message: 'Ticket status updated successfully',
      ticket,
    }

  } catch (error) {
    console.error('Error updating ticket status:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ticket status',
    }
  }
}

/**
 * Server Action to get ticket statistics
 */
export async function getTicketStats() {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get user with tenant information
    const userWithTenant = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        tenantId: true,
        role: true,
      },
    })

    if (!userWithTenant?.tenantId) {
      return {
        success: false,
        error: 'User tenant not found',
      }
    }

    // Get statistics
    const stats = await getTicketStatsUseCase.execute(
      userWithTenant.tenantId,
      userWithTenant.id,
      userWithTenant.role
    )

    return {
      success: true,
      data: stats,
    }

  } catch (error) {
    console.error('Error fetching ticket stats:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch ticket statistics',
    }
  }
}

/**
 * Server Action to get available technicians for assignment
 */
export async function getAvailableTechnicians() {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get user with tenant information
    const userWithTenant = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tenantId: true,
        role: true,
      },
    })

    if (!userWithTenant?.tenantId) {
      return {
        success: false,
        error: 'User tenant not found',
      }
    }

    // Only ADMIN and MANAGER can view technicians
    if (userWithTenant.role !== 'ADMIN' && userWithTenant.role !== 'MANAGER') {
      return {
        success: false,
        error: 'You do not have permission to view technicians',
      }
    }

    // Get active technicians from the same tenant
    const technicians = await prisma.user.findMany({
      where: {
        tenantId: userWithTenant.tenantId,
        role: 'TECHNICIAN',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return {
      success: true,
      data: technicians,
    }

  } catch (error) {
    console.error('Error fetching technicians:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch technicians',
    }
  }
}

/**
 * Server Action to update ticket category
 */
export async function updateTicketCategory(formData: FormData) {
  try {
    // Authenticate user using the same pattern as other functions
    const authResult = await getAuthenticatedSession()

    if (!authResult.success || !authResult.session) {
      return {
        success: false,
        error: authResult.error || 'Authentication failed',
      }
    }

    const session = authResult.session

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Extract form data
    const ticketId = formData.get('ticketId') as string
    const category = formData.get('category') as TicketCategory

    // Update ticket category
    const ticket = await updateTicketCategoryUseCase.execute(
      {
        ticketId,
        category,
        updatedBy: session.user.id,
      },
      user.role
    )

    // Revalidate the support page
    revalidatePath('/app/support')

    return {
      success: true,
      message: 'Ticket category updated successfully',
      ticket,
    }

  } catch (error) {
    console.error('Error updating ticket category:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ticket category',
    }
  }
}