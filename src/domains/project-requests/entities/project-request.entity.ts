export enum ProjectRequestStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONVERTED_TO_PROJECT = 'CONVERTED_TO_PROJECT'
}

export enum ProjectRequestPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ServiceType {
  RESIDENTIAL_INSTALLATION = 'RESIDENTIAL_INSTALLATION',
  COMMERCIAL_INSTALLATION = 'COMMERCIAL_INSTALLATION',
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  UPGRADE = 'UPGRADE',
  CONSULTATION = 'CONSULTATION',
  MONITORING_SETUP = 'MONITORING_SETUP',
  OTHER = 'OTHER'
}

export interface ProjectRequest {
  id: string
  serviceType: ServiceType
  status: ProjectRequestStatus
  priority: ProjectRequestPriority

  // Client Information
  clientName: string
  clientEmail: string
  clientPhone: string
  companyName?: string

  // Location Information
  address: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number

  // Project Details
  title: string
  description: string
  estimatedBudget?: number
  preferredTimeline?: string
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'OTHER'
  roofType?: string
  estimatedSize?: number // in kW or m²

  // Files and Attachments
  attachments?: Array<{
    id: string
    filename: string
    url: string
    type: string
    size: number
    uploadedAt: Date
  }>

  // Review and Assignment
  assignedToId?: string
  assignedAt?: Date
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
  adminNotes?: string

  // Conversion to Project
  convertedToProjectId?: string
  convertedAt?: Date

  // Metadata
  createdById: string
  createdAt: Date
  updatedAt: Date
  tenantId: string
}

export interface CreateProjectRequestInput {
  serviceType: ServiceType
  serviceId: string
  priority: ProjectRequestPriority

  // Client Information
  clientName: string
  clientEmail: string
  clientPhone: string
  companyName?: string

  // Location Information
  address: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number

  // Project Details
  title: string
  description: string
  estimatedBudget?: number
  preferredTimeline?: string
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'OTHER'
  roofType?: string
  estimatedSize?: number

  // Service-specific data
  serviceData?: any

  // Metadata
  createdById: string
  tenantId: string
}

export interface UpdateProjectRequestInput {
  serviceType?: ServiceType
  priority?: ProjectRequestPriority
  status?: ProjectRequestStatus

  clientName?: string
  clientEmail?: string
  clientPhone?: string
  companyName?: string

  address?: string
  address2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  latitude?: number
  longitude?: number

  title?: string
  description?: string
  estimatedBudget?: number
  preferredTimeline?: string
  propertyType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'OTHER'
  roofType?: string
  estimatedSize?: number

  assignedToId?: string
  adminNotes?: string
  rejectionReason?: string
}

export interface UpdateStatusInput {
  status: ProjectRequestStatus
  reviewedBy?: string
  rejectionReason?: string
  adminNotes?: string
}

export interface ProjectRequestWithRelations extends ProjectRequest {
  createdBy: {
    id: string
    name: string
    email: string
    role: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
    role: string
  }
  convertedToProject?: {
    id: string
    name: string
    status: string
  }
  _count?: {
    attachments: number
    comments?: number
  }
}

export interface ProjectRequestFilters {
  status?: ProjectRequestStatus
  priority?: ProjectRequestPriority
  serviceType?: ServiceType
  assignedToId?: string
  createdById?: string
  search?: string
  dateFrom?: Date
  dateTo?: Date
  tenantId?: string
  page?: number
  limit?: number
}

export interface ProjectRequestListResult {
  requests: ProjectRequestWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}