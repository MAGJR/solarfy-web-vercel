import {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceWithRelations,
  ServiceFilters,
  ServiceListResult
} from "../entities/service.entity"

export interface ServiceRepository {
  // Basic CRUD operations
  create(data: CreateServiceInput): Promise<Service>
  findById(id: string): Promise<ServiceWithRelations | null>
  update(id: string, data: UpdateServiceInput): Promise<Service>
  delete(id: string): Promise<void>

  // List and search
  findAll(filters?: ServiceFilters): Promise<ServiceListResult>
  findAvailable(tenantId: string, filters?: ServiceFilters): Promise<ServiceListResult>
  findByCategory(category: string, tenantId: string): Promise<ServiceWithRelations[]>

  // Property type filtering
  findByPropertyType(propertyType: string, tenantId: string): Promise<ServiceWithRelations[]>

  // Search operations
  searchByTitle(title: string, tenantId: string): Promise<Service[]>
  searchByDescription(query: string, tenantId: string): Promise<Service[]>

  // Status management
  activateService(id: string): Promise<Service>
  deactivateService(id: string): Promise<Service>

  // Analytics and stats
  getStats(tenantId: string): Promise<{
    total: number
    active: number
    inactive: number
    byCategory: Record<string, number>
    avgPrice?: number
    mostRequested?: string[]
  }>

  // Popular services
  getMostPopular(tenantId: string, limit?: number): Promise<ServiceWithRelations[]>
}