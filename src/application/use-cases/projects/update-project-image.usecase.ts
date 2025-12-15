import { ProjectImage, UpdateProjectImageInput } from '@/domains/projects/entities/project-image.entity'
import { PrismaProjectImageRepository } from '@/infrastructure/repositories/prisma-project-image.repository'

export interface UpdateProjectImageData {
  imageId: string
  data: UpdateProjectImageInput
  uploadedBy?: string // Opcional, para validação de permissão
}

export interface ReorderProjectImagesData {
  projectId: string
  imageOrders: Array<{
    id: string
    order: number
  }>
  uploadedBy?: string // Opcional, para validação de permissão
}

export class UpdateProjectImageUseCase {
  constructor(private readonly projectImageRepository: PrismaProjectImageRepository) {}

  async execute(data: UpdateProjectImageData): Promise<ProjectImage> {
    // Buscar a imagem para validação de permissão
    const existingImage = await this.projectImageRepository.findById(data.imageId)

    if (!existingImage) {
      throw new Error('Image not found')
    }

    // Validação de segurança opcional
    if (data.uploadedBy && existingImage.uploader?.id !== data.uploadedBy) {
      throw new Error('You do not have permission to update this image')
    }

    return this.projectImageRepository.update(data.imageId, data.data)
  }

  async updateImageOrder(imageId: string, order: number): Promise<ProjectImage> {
    return this.projectImageRepository.updateOrder(imageId, order)
  }

  async reorderProjectImages(data: ReorderProjectImagesData): Promise<void> {
    // Verificar se todas as imagens pertencem ao projeto informado
    const images = await this.projectImageRepository.findByProjectId(data.projectId)
    const imageIds = images.map(img => img.id)

    for (const { id } of data.imageOrders) {
      if (!imageIds.includes(id)) {
        throw new Error(`Image ${id} does not belong to project ${data.projectId}`)
      }
    }

    // Reordenar as imagens
    await this.projectImageRepository.reorderImages(data.projectId, data.imageOrders)
  }

  async updateImageInfo(
    imageId: string,
    updates: {
      category?: string
      description?: string
    },
    uploadedBy?: string
  ): Promise<ProjectImage> {
    return this.execute({
      imageId,
      data: updates,
      uploadedBy
    })
  }
}