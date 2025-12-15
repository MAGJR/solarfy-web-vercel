import { CreateProjectInput, ProjectWithRelations } from '@/domains/projects/entities/project.entity'
import { ProjectRepository } from '@/domains/projects/repositories/project.repository.interface'

export class CreateProjectUseCase {
  constructor(
    private projectRepository: ProjectRepository
  ) {}

  async execute(data: CreateProjectInput): Promise<ProjectWithRelations> {
    // Validation
    this.validateProjectData(data)

    // If crmLeadId is provided, check if lead exists and doesn't have a project yet
    if (data.crmLeadId) {
      const existingProject = await this.projectRepository.findByCrmLeadId(data.crmLeadId)
      if (existingProject) {
        throw new Error('This CRM lead already has a project associated')
      }
    }

    // If coordinates are provided, both latitude and longitude must be present
    if ((data.latitude && !data.longitude) || (!data.latitude && data.longitude)) {
      throw new Error('Both latitude and longitude must be provided together')
    }

    // Create the project
    const project = await this.projectRepository.create(data)

    // Return the project with relations
    return await this.projectRepository.findById(project.id)
  }

  private validateProjectData(data: CreateProjectInput): void {
    // Required fields validation
    if (!data.name?.trim()) {
      throw new Error('Project name is required')
    }

    if (!data.estimatedKw || data.estimatedKw <= 0) {
      throw new Error('Estimated kW must be greater than 0')
    }

    if (!data.estimatedPrice || data.estimatedPrice <= 0) {
      throw new Error('Estimated price must be greater than 0')
    }

    if (!data.createdById?.trim()) {
      throw new Error('Created by user ID is required')
    }

    // Email validation if provided
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format')
    }

    // Coordinates validation if provided
    if (data.latitude && data.longitude) {
      if (data.latitude < -90 || data.latitude > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees')
      }
      if (data.longitude < -180 || data.longitude > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees')
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}