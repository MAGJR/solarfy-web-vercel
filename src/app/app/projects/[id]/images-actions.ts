'use server'

import { auth } from "@/infrastructure/auth/auth.config"
import { GetProjectImagesUseCase } from '@/application/use-cases/projects/get-project-images.usecase'
import { PrismaProjectImageRepository } from '@/infrastructure/repositories/prisma-project-image.repository'
import { headers } from "next/headers"

const projectImageRepository = new PrismaProjectImageRepository()
const getProjectImagesUseCase = new GetProjectImagesUseCase(projectImageRepository)

export async function getProjectImages(projectId: string) {
  try {
    const session = await auth.api.getSession({
          headers: await headers(),
        })

    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized'
      }
    }

    const images = await getProjectImagesUseCase.getAllByProjectId(projectId)

    return {
      success: true,
      data: images
    }
  } catch (error) {
    console.error('Error fetching project images:', error)
    return {
      success: false,
      message: 'Error fetching project images'
    }
  }
}