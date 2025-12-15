import { NextRequest, NextResponse } from 'next/server'
import { CreateProjectRequestUseCase } from '@/application/use-cases/project-requests/create-project-request.usecase'
import { GetProjectRequestsUseCase } from '@/application/use-cases/project-requests/get-project-requests.usecase'
import { PrismaProjectRequestRepository } from '@/infrastructure/repositories/prisma-project-request.repository'
import { CreateProjectRequestInput } from '@/domains/project-requests/entities/project-request.entity'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { headers } from 'next/headers'

// Initialize dependencies
const projectRequestRepository = new PrismaProjectRequestRepository(prisma)
const createProjectRequestUseCase = new CreateProjectRequestUseCase(projectRequestRepository)
const getProjectRequestsUseCase = new GetProjectRequestsUseCase(projectRequestRepository)

export async function GET(request: NextRequest) {
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

    // Get user information with role and tenant
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get('status') as any || undefined,
      priority: searchParams.get('priority') as any || undefined,
      serviceType: searchParams.get('serviceType') as any || undefined,
      assignedToId: searchParams.get('assignedToId') || undefined,
      createdById: searchParams.get('createdById') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    }

    // Authorization: Users can only see their own requests unless they're admin/manager
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      filters.createdById = session.user.id
    }

    // Add tenant filter
    // This would need to be added to the repository filter logic
    // For now, assuming it's handled at the repository level

    const result = await getProjectRequestsUseCase.execute({
      ...filters,
      tenantId: user.tenantId // Add tenant filter
    })

    return NextResponse.json({
      success: true,
      requests: result.requests,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })

  } catch (error) {
    console.error('Error fetching project requests:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch project requests'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Get user information with role and tenant
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

    // Authorization: Only VIEWER users can create project requests
    // This prevents admins from creating requests directly (they should create projects)
    if (user.role !== 'VIEWER') {
      return NextResponse.json(
        { success: false, error: 'Only viewers can create project requests' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()

    const createData: CreateProjectRequestInput = {
      ...body,
      createdById: session.user.id,
      tenantId: user.tenantId,
    }

    // Create the project request
    const projectRequest = await createProjectRequestUseCase.execute(createData)

    // TODO: Send notifications to admins
    // This would be implemented in the notification system

    return NextResponse.json({
      success: true,
      data: projectRequest,
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating project request:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project request'
      },
      { status: 400 }
    )
  }
}