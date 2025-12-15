'use server'

import { CreateProjectRequestUseCase } from "@/application/use-cases/project-requests/create-project-request.usecase"
import { PrismaProjectRequestRepository } from "@/infrastructure/repositories/prisma-project-request.repository"
import { CreateProjectRequestInput } from "@/domains/project-requests/entities/project-request.entity"
import { auth } from "@/infrastructure/auth/auth.config"
import { prisma } from "@/infrastructure/database/prisma"
import { headers } from "next/headers"

// Initialize dependencies
const projectRequestRepository = new PrismaProjectRequestRepository(prisma)
const createProjectRequestUseCase = new CreateProjectRequestUseCase(projectRequestRepository)

export async function createProjectRequest(input: CreateProjectRequestInput) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Get user information with role and tenant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true }
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Authorization: Only VIEWER users can create project requests
    if (user.role !== 'VIEWER') {
      return {
        success: false,
        error: 'Only viewers can create project requests',
      }
    }

    // Find a default service for the given service type
    const defaultService = await prisma.service.findFirst({
      where: {
        category: input.serviceType === 'RESIDENTIAL_INSTALLATION' ? 'RESIDENTIAL' :
                input.serviceType === 'COMMERCIAL_INSTALLATION' ? 'COMMERCIAL' : 'OTHER',
        status: 'ACTIVE',
        tenantId: user.tenantId
      }
    })

    if (!defaultService) {
      return {
        success: false,
        error: 'No default service found for this request type',
      }
    }

    // Add user and tenant information to the input
    const createData: CreateProjectRequestInput = {
      ...input,
      serviceId: defaultService.id,
      createdById: session.user.id,
      tenantId: user.tenantId || '', // Ensure string type
    }

    // Create the project request
    const projectRequest = await createProjectRequestUseCase.execute(createData)

    // Send notifications to admins and managers
    if (user.tenantId) {
      await notifyAdminsAboutNewRequest(projectRequest, user.tenantId)
    }

    return {
      success: true,
      data: projectRequest,
    }

  } catch (error) {
    console.error('Error creating project request:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project request',
    }
  }
}

async function notifyAdminsAboutNewRequest(projectRequest: any, tenantId: string) {
  try {
    // Get all admins and managers for the tenant
    const admins = await prisma.user.findMany({
      where: {
        tenantId,
        role: {
          in: ['ADMIN', 'MANAGER']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })

    if (admins.length === 0) {
      console.log('No admins to notify about new project request')
      return
    }

    // Import notification service dynamically to avoid circular dependencies
    const { ProjectRequestNotificationService } = await import('@/domains/project-requests/services/project-request-notification.service')
    const { NotificationService } = await import('@/domains/notifications/services/notification.service')
    const { ResendEmailService } = await import('@/infrastructure/emails/resend-email.service')

    // Initialize notification service
    const emailService = new ResendEmailService()
    const notificationService = new NotificationService(emailService)
    const projectRequestNotificationService = new ProjectRequestNotificationService(notificationService)

    // Send notifications to all admins and managers
    await projectRequestNotificationService.notifyNewProjectRequest(projectRequest, admins)

    console.log(`Successfully sent notifications to ${admins.length} admins for project request ${projectRequest.id}`)

  } catch (error) {
    console.error('Error notifying admins about new project request:', error)
    // Don't throw the error to avoid breaking the main flow
  }
}