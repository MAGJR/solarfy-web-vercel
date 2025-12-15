import {
  ProjectImageWithRelations,
  ProjectImageFilters,
  ProjectImageListResult
} from '@/domains/projects/entities/project-image.entity'
import { PrismaProjectImageRepository } from '@/infrastructure/repositories/prisma-project-image.repository'

export interface GetProjectImagesData extends Omit<ProjectImageFilters, 'projectId'> {
  projectId: string
}

export class GetProjectImagesUseCase {
  constructor(private readonly projectImageRepository: PrismaProjectImageRepository) {}

  async execute(data: GetProjectImagesData): Promise<ProjectImageListResult> {
    const filters: ProjectImageFilters = {
      projectId: data.projectId,
      category: data.category,
      uploadedBy: data.uploadedBy,
      search: data.search,
      page: data.page,
      limit: data.limit
    }

    return this.projectImageRepository.findMany(filters)
  }

  async getAllByProjectId(projectId: string): Promise<ProjectImageWithRelations[]> {
    return this.projectImageRepository.findByProjectId(projectId)
  }

  async getById(id: string): Promise<ProjectImageWithRelations | null> {
    return this.projectImageRepository.findById(id)
  }

  async getProjectImageStats(projectId: string): Promise<{
    count: number
    totalSize: number
    categories: Array<{
      category: string
      count: number
    }>
  }> {
    const [count, totalSize, images] = await Promise.all([
      this.projectImageRepository.countByProjectId(projectId),
      this.projectImageRepository.getTotalSizeByProjectId(projectId),
      this.projectImageRepository.findByProjectId(projectId)
    ])

    // Agrupar por categoria
    const categoryMap = new Map<string, number>()
    images.forEach(image => {
      const category = image.category || 'other'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const categories = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }))

    return {
      count,
      totalSize,
      categories
    }
  }
}