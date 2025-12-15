import { ProjectRepository } from '@/domains/projects/repositories/project.repository.interface'
import { ProjectWithRelations } from '@/domains/projects/entities/project.entity'

export class GetProjectByIdUseCase {
  constructor(
    private projectRepository: ProjectRepository
  ) {}

  async execute(id: string): Promise<ProjectWithRelations> {
    if (!id) {
      throw new Error('Project ID is required')
    }

    const project = await this.projectRepository.findById(id)

    if (!project) {
      throw new Error('Project not found')
    }

    return project
  }
}