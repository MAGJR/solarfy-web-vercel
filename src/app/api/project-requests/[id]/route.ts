import { NextRequest, NextResponse } from 'next/server'
import { GetProjectRequestsUseCase } from '@/application/use-cases/project-requests/get-project-requests.usecase'
import { UpdateProjectRequestStatusUseCase } from '@/application/use-cases/project-requests/update-project-request-status.usecase'
import { AssignProjectRequestUseCase } from '@/application/use-cases/project-requests/assign-project-request.usecase'
import { PrismaProjectRequestRepository } from '@/infrastructure/repositories/prisma-project-request.repository'
import { UpdateStatusInput } from '@/domains/project-requests/entities/project-request.entity'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { headers } from 'next/headers'

// Initialize dependencies
const projectRequestRepository = new PrismaProjectRequestRepository(prisma)
const getProjectRequestsUseCase = new GetProjectRequestsUseCase(projectRequestRepository)
const updateStatusUseCase = new UpdateProjectRequestStatusUseCase(projectRequestRepository)
const assignUseCase = new AssignProjectRequestUseCase(projectRequestRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the project request
    const result = await getProjectRequestsUseCase.execute({})

    // Find the specific request in the results
    const projectRequest = result.requests.find(req => req.id === params.id)

    if (!projectRequest) {
      return NextResponse.json(
        { success: false, error: 'Project request not found' },
        { status: 404 }
      )
    }

    // Authorization: Users can only see their own requests unless they're admin/manager
    if (!['ADMIN', 'MANAGER'].includes(user.role) &&
        projectRequest.createdById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Tenant authorization
    if (projectRequest.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: projectRequest,
    })

  } catch (error) {
    console.error('Error fetching project request:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project request'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Only admins and managers can update project requests
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admins and managers can update requests' },
        { status: 403 }
      )
    }

    // Get the project request to verify it exists and belongs to the same tenant
    const getRequestResult = await getProjectRequestsUseCase.execute({})
    const projectRequest = getRequestResult.requests.find(req => req.id === params.id)

    if (!projectRequest) {
      return NextResponse.json(
        { success: false, error: 'Project request not found' },
        { status: 404 }
      )
    }

    if (projectRequest.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { action, ...updateData } = body

    let updatedRequest

    switch (action) {
      case 'updateStatus':
        updatedRequest = await updateStatusUseCase.execute(
          params.id,
          updateData as UpdateStatusInput,
          session.user.id
        )
        break

      case 'assign':
        if (!updateData.assignedToId) {
          return NextResponse.json(
            { success: false, error: 'assignedToId is required for assignment' },
            { status: 400 }
          )
        }
        updatedRequest = await assignUseCase.execute(
          params.id,
          updateData.assignedToId,
          session.user.id
        )
        break

      case 'unassign':
        updatedRequest = await assignUseCase.unassignRequest(
          params.id,
          session.user.id
        )
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    // TODO: Send notifications based on the action
    // This would be implemented in the notification system

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    })

  } catch (error) {
    console.error('Error updating project request:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update project request'
      },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Only admins can delete project requests
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admins can delete requests' },
        { status: 403 }
      )
    }

    // Get the project request to verify it exists and belongs to the same tenant
    const getRequestResult = await getProjectRequestsUseCase.execute({})
    const projectRequest = getRequestResult.requests.find(req => req.id === params.id)

    if (!projectRequest) {
      return NextResponse.json(
        { success: false, error: 'Project request not found' },
        { status: 404 }
      )
    }

    if (projectRequest.tenantId !== user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete the project request
    await projectRequestRepository.delete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Project request deleted successfully',
    })

  } catch (error) {
    console.error('Error deleting project request:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete project request'
      },
      { status: 500 }
    )
  }
}