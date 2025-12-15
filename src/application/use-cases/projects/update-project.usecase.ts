import { ProjectRepository } from '@/domains/projects/repositories/project.repository.interface'
import { UpdateProjectInput } from '@/domains/projects/entities/project.entity'

export class UpdateProjectUseCase {
  constructor(
    private projectRepository: ProjectRepository
  ) {}

  async execute(id: string, data: UpdateProjectInput): Promise<void> {
    if (!id) {
      throw new Error('Project ID is required')
    }

    // Check if project exists
    const existingProject = await this.projectRepository.findById(id)
    if (!existingProject) {
      throw new Error('Project not found')
    }

    // Validate update data
    this.validateUpdateData(data)

    // Update the project
    await this.projectRepository.update(id, data)
  }

  private validateUpdateData(data: UpdateProjectInput): void {
    // Basic validation
    if (data.name && data.name.trim().length < 3) {
      throw new Error('Project name must be at least 3 characters long')
    }

    if (data.estimatedKw !== undefined && data.estimatedKw <= 0) {
      throw new Error('Estimated power must be greater than 0')
    }

    if (data.estimatedPrice !== undefined && data.estimatedPrice <= 0) {
      throw new Error('Estimated price must be greater than 0')
    }

    // Email validation if provided
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format')
    }

    // Coordinates validation if provided
    if ((data.latitude && !data.longitude) || (!data.latitude && data.longitude)) {
      throw new Error('Both latitude and longitude must be provided together')
    }

    if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
      throw new Error('Latitude must be between -90 and 90 degrees')
    }

    if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
      throw new Error('Longitude must be between -180 and 180 degrees')
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}