import {
  ProjectRequest,
  CreateProjectRequestInput,
  UpdateProjectRequestInput,
  UpdateStatusInput,
  ProjectRequestWithRelations,
  ProjectRequestFilters,
  ProjectRequestListResult
} from "../entities/project-request.entity"

export interface ProjectRequestRepository {
  // Basic CRUD operations
  create(data: CreateProjectRequestInput): Promise<ProjectRequest>
  findById(id: string): Promise<ProjectRequestWithRelations | null>
  update(id: string, data: UpdateProjectRequestInput): Promise<ProjectRequest>
  delete(id: string): Promise<void>

  // Status management
  updateStatus(id: string, input: UpdateStatusInput): Promise<ProjectRequest>

  // List and search
  findAll(filters?: ProjectRequestFilters): Promise<ProjectRequestListResult>
  findByCreatedBy(createdById: string, filters?: ProjectRequestFilters): Promise<ProjectRequestListResult>
  findByAssignedTo(assignedToId: string, filters?: ProjectRequestFilters): Promise<ProjectRequestListResult>

  // Assignment operations
  assignToAdmin(requestId: string, adminId: string): Promise<ProjectRequest>
  unassign(requestId: string): Promise<ProjectRequest>

  // Conversion to project
  convertToProject(requestId: string, projectId: string): Promise<ProjectRequest>

  // Analytics and stats
  getStats(tenantId: string): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    converted: number
    byServiceType: Record<string, number>
    byPriority: Record<string, number>
    avgResponseTime?: number
  }>

  // Search operations
  searchByAddress(address: string, tenantId: string): Promise<ProjectRequest[]>
  searchByClientName(name: string, tenantId: string): Promise<ProjectRequest[]>
  searchByEmail(email: string, tenantId: string): Promise<ProjectRequest[]>

  // Date-based queries
  findRequestsInDateRange(startDate: Date, endDate: Date, tenantId: string): Promise<ProjectRequest[]>
  findPendingRequestsOlderThan(days: number, tenantId: string): Promise<ProjectRequest[]>
}