import { NextRequest, NextResponse } from 'next/server'
import { UpdateProjectImageUseCase } from '@/application/use-cases/projects/update-project-image.usecase'
import { PrismaProjectImageRepository } from '@/infrastructure/repositories/prisma-project-image.repository'
import { auth } from '@/infrastructure/auth/auth.config'
import { headers } from 'next/headers'

const projectImageRepository = new PrismaProjectImageRepository()
const updateProjectImageUseCase = new UpdateProjectImageUseCase(projectImageRepository)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { imageOrders } = body

    if (!Array.isArray(imageOrders)) {
      return NextResponse.json(
        { success: false, error: 'imageOrders must be an array' },
        { status: 400 }
      )
    }

    // Validar estrutura do array
    for (const item of imageOrders) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Each item must have id and order fields' },
          { status: 400 }
        )
      }
    }

    await updateProjectImageUseCase.reorderProjectImages({
      projectId,
      imageOrders,
      uploadedBy: session.user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Images reordered successfully'
    })
  } catch (error) {
    console.error('Error reordering project images:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}