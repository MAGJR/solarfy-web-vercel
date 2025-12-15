import { NextRequest, NextResponse } from 'next/server'
import { DeleteProjectImageUseCase } from '@/application/use-cases/projects/delete-project-image.usecase'
import { UpdateProjectImageUseCase } from '@/application/use-cases/projects/update-project-image.usecase'
import { GetProjectImagesUseCase } from '@/application/use-cases/projects/get-project-images.usecase'
import { PrismaProjectImageRepository } from '@/infrastructure/repositories/prisma-project-image.repository'
import { auth } from '@/infrastructure/auth/auth.config'
import { headers } from 'next/headers'

const projectImageRepository = new PrismaProjectImageRepository()
const deleteProjectImageUseCase = new DeleteProjectImageUseCase(projectImageRepository)
const updateProjectImageUseCase = new UpdateProjectImageUseCase(projectImageRepository)
const getProjectImagesUseCase = new GetProjectImagesUseCase(projectImageRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { imageId } = await params
    const image = await getProjectImagesUseCase.getById(imageId)

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: image
    })
  } catch (error) {
    console.error('Error fetching project image:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { imageId } = await params

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
    const { category, description, order } = body

    const updateData: any = {}
    if (category !== undefined) updateData.category = category
    if (description !== undefined) updateData.description = description
    if (order !== undefined) updateData.order = order

    const image = await updateProjectImageUseCase.execute({
      imageId,
      data: updateData,
      uploadedBy: session.user.id
    })

    return NextResponse.json({
      success: true,
      data: image
    })
  } catch (error) {
    console.error('Error updating project image:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: projectId, imageId } = await params

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await deleteProjectImageUseCase.execute({
      imageId,
      projectId,
      uploadedBy: session.user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project image:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}