import { ProjectRepository } from '@/domains/projects/repositories/project.repository.interface'

export class DeleteProjectUseCase {
  constructor(
    private projectRepository: ProjectRepository
  ) {}

  async execute(id: string): Promise<void> {
    // Check if project exists
    const project = await this.projectRepository.findById(id)
    if (!project) {
      throw new Error('Project not found')
    }

    // Delete the project
    await this.projectRepository.delete(id)
  }
}