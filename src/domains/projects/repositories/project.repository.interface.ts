import { Project, CreateProjectInput, UpdateProjectInput, ProjectWithRelations } from "@/domains/projects/entities/project.entity"

export interface ProjectRepository {
  // Basic CRUD
  create(data: CreateProjectInput): Promise<Project>
  findById(id: string): Promise<ProjectWithRelations | null>
  findAll(filters?: {
    status?: string
    search?: string
    page?: number
    limit?: number
    createdBy?: string
  }): Promise<{ projects: ProjectWithRelations[]; total: number }>
  update(id: string, data: UpdateProjectInput): Promise<Project>
  delete(id: string): Promise<void>

  // Lead integration
  findByCrmLeadId(crmLeadId: string): Promise<ProjectWithRelations | null>
  findAvailableLeads(): Promise<Array<{
    id: string
    name: string
    email: string
    company: string
    status: string
  }>>

  // Search and filters
  searchByAddress(address: string): Promise<Project[]>
  findByCoordinates(latitude: number, longitude: number, radiusKm?: number): Promise<Project[]>
}