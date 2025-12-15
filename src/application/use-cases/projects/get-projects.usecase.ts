import { ProjectWithRelations } from '@/domains/projects/entities/project.entity'
import { ProjectRepository } from '@/domains/projects/repositories/project.repository.interface'

export interface GetProjectsFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
  createdBy?: string
}

export class GetProjectsUseCase {
  constructor(
    private projectRepository: ProjectRepository
  ) {}

  async execute(filters?: GetProjectsFilters): Promise<{
    projects: ProjectWithRelations[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 50 } = filters || {}

    const result = await this.projectRepository.findAll(filters)

    return {
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    }
  }

  async getAvailableLeads(): Promise<Array<{
    id: string
    name: string
    email: string
    phone?: string
    company: string
    status: string
  }>> {
    return this.projectRepository.findAvailableLeads()
  }
}