import { NextRequest, NextResponse } from 'next/server'
import { validateCreateProject, validateProjectQuery } from '@/application/schemas'
import { GetProjectsUseCase } from '@/application/use-cases/projects/get-projects.usecase'
import { CreateProjectUseCase } from '@/application/use-cases/projects/create-project.usecase'
import { PrismaProjectRepository } from '@/infrastructure/repositories/prisma-project.repository'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { headers } from 'next/headers'

// Initialize dependencies
const projectRepository = new PrismaProjectRepository(prisma)
const getProjectsUseCase = new GetProjectsUseCase(projectRepository)
const createProjectUseCase = new CreateProjectUseCase(projectRepository)

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

    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams)

    const validation = validateProjectQuery(query)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Build filters
    const filters = {
      ...validation.data,
      // For VIEWER users, only show their own projects
      createdBy: user.role === 'VIEWER' ? session.user.id : validation.data.createdBy,
      tenantId: user.tenantId
    }

    const result = await getProjectsUseCase.execute(filters)

    return NextResponse.json({
      success: true,
      projects: result.projects,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = validateCreateProject(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    // TODO: Implement CreateProjectUseCase
    return NextResponse.json({
      success: true,
      data: validation.data,
      message: 'Project validation successful - not yet implemented'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating project:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}