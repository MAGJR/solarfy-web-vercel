import { NextRequest, NextResponse } from 'next/server'
import { UploadProjectImageUseCase } from '@/application/use-cases/projects/upload-project-image.usecase'
import { GetProjectImagesUseCase } from '@/application/use-cases/projects/get-project-images.usecase'
import { PrismaProjectImageRepository } from '@/infrastructure/repositories/prisma-project-image.repository'
import { auth } from '@/infrastructure/auth/auth.config'
import { headers } from 'next/headers'

const projectImageRepository = new PrismaProjectImageRepository()
const uploadProjectImageUseCase = new UploadProjectImageUseCase(projectImageRepository)
const getProjectImagesUseCase = new GetProjectImagesUseCase(projectImageRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    const images = await getProjectImagesUseCase.execute({
      projectId,
      page,
      limit,
      category,
      search
    })

    return NextResponse.json({
      success: true,
      data: images
    })
  } catch (error) {
    console.error('Error fetching project images:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || undefined
    const description = formData.get('description') as string || undefined

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    const image = await uploadProjectImageUseCase.execute({
      file,
      projectId,
      uploadedBy: session.user.id,
      category,
      description
    })

    return NextResponse.json({
      success: true,
      data: image
    })
  } catch (error) {
    console.error('Error uploading project image:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}