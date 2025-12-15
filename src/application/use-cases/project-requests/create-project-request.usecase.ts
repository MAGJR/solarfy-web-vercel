import { ProjectRequestRepository } from "@/domains/project-requests/repositories/project-request.repository.interface"
import { CreateProjectRequestInput, ProjectRequest } from "@/domains/project-requests/entities/project-request.entity"

export class CreateProjectRequestUseCase {
  constructor(private readonly projectRequestRepository: ProjectRequestRepository) {}

  async execute(input: CreateProjectRequestInput): Promise<ProjectRequest> {
    // Validate required fields
    this.validateInput(input)

    // Check if user already has a similar pending request
    await this.checkForDuplicateRequests(input)

    // Create the project request
    const projectRequest = await this.projectRequestRepository.create(input)

    return projectRequest
  }

  private validateInput(input: CreateProjectRequestInput): void {
    // Required fields validation
    if (!input.serviceType) {
      throw new Error('Service type is required')
    }

    if (!input.clientName || input.clientName.trim().length < 2) {
      throw new Error('Client name must be at least 2 characters long')
    }

    if (!input.clientEmail || !this.isValidEmail(input.clientEmail)) {
      throw new Error('Valid client email is required')
    }

    if (!input.clientPhone || input.clientPhone.trim().length < 10) {
      throw new Error('Valid client phone number is required')
    }

    if (!input.address || input.address.trim().length < 5) {
      throw new Error('Address is required')
    }

    if (!input.city || input.city.trim().length < 2) {
      throw new Error('City is required')
    }

    if (!input.state || input.state.trim().length < 2) {
      throw new Error('State is required')
    }

    if (!input.zipCode || input.zipCode.trim().length < 3) {
      throw new Error('Zip code is required')
    }

    if (!input.country || input.country.trim().length < 2) {
      throw new Error('Country is required')
    }

    if (!input.title || input.title.trim().length < 5) {
      throw new Error('Title must be at least 5 characters long')
    }

    if (!input.description || input.description.trim().length < 20) {
      throw new Error('Description must be at least 20 characters long')
    }

    if (!input.propertyType) {
      throw new Error('Property type is required')
    }

    // Budget validation
    if (input.estimatedBudget && input.estimatedBudget < 0) {
      throw new Error('Estimated budget must be a positive number')
    }

    // Size validation
    if (input.estimatedSize && input.estimatedSize < 0) {
      throw new Error('Estimated size must be a positive number')
    }

    // Timeline validation
    if (input.preferredTimeline && input.preferredTimeline.trim().length < 3) {
      throw new Error('Preferred timeline must be at least 3 characters long')
    }
  }

  private async checkForDuplicateRequests(input: CreateProjectRequestInput): Promise<void> {
    // Check for existing requests with same email and address in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // This would require adding a method to the repository
    // For now, we'll skip duplicate checking to keep it simple
    // In a real implementation, you might want to check for:
    // - Same email + same address within last X days
    // - Same phone number within last X days
    // - Multiple pending requests from same user
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhone(phone: string): boolean {
    // Simple phone validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
}