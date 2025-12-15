import { ProjectRequestRepository } from "@/domains/project-requests/repositories/project-request.repository.interface"
import {
  ProjectRequestFilters,
  ProjectRequestListResult,
  ProjectRequestWithRelations
} from "@/domains/project-requests/entities/project-request.entity"

export class GetProjectRequestsUseCase {
  constructor(private readonly projectRequestRepository: ProjectRequestRepository) {}

  async execute(filters?: ProjectRequestFilters): Promise<ProjectRequestListResult> {
    // Validate filters
    this.validateFilters(filters)

    // Get project requests
    const result = await this.projectRequestRepository.findAll(filters)

    return result
  }

  async getPendingRequests(tenantId: string): Promise<ProjectRequestWithRelations[]> {
    const result = await this.projectRequestRepository.findAll({
      status: 'PENDING',
      page: 1,
      limit: 50,
    })

    return result.requests
  }

  async getRequestsByUser(createdById: string, filters?: ProjectRequestFilters): Promise<ProjectRequestListResult> {
    return this.projectRequestRepository.findByCreatedBy(createdById, filters)
  }

  async getAssignedRequests(assignedToId: string, filters?: ProjectRequestFilters): Promise<ProjectRequestListResult> {
    return this.projectRequestRepository.findByAssignedTo(assignedToId, filters)
  }

  private validateFilters(filters?: ProjectRequestFilters): void {
    if (!filters) return

    // Validate page and limit
    if (filters.page && filters.page < 1) {
      throw new Error('Page must be greater than 0')
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      throw new Error('Limit must be between 1 and 100')
    }

    // Validate date range
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
      throw new Error('Date from must be before date to')
    }

    // Validate search term length
    if (filters.search && filters.search.length < 2) {
      throw new Error('Search term must be at least 2 characters long')
    }
  }
}