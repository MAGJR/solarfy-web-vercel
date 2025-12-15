export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT'
}

export enum ServiceCategory {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  MAINTENANCE = 'MAINTENANCE',
  CONSULTING = 'CONSULTING',
  OTHER = 'OTHER'
}

export interface Service {
  id: string
  title: string
  description: string
  category: ServiceCategory
  status: ServiceStatus

  // Pricing Information
  basePrice?: number
  priceRange?: {
    min: number
    max: number
  }
  pricingDescription?: string

  // Service Details
  estimatedDuration?: string // e.g., "2-3 days", "1 week"
  includesWarranty?: boolean
  warrantyDescription?: string

  // Requirements & Information
  requiredFields: ServiceField[]
  propertyTypes: ('RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL')[]
  estimatedSizeRequired?: boolean

  // Media & Content
  imageUrl?: string
  gallery?: string[]
  features?: string[]
  benefits?: string[]

  // Availability
  isAvailable: boolean
  requiresSiteVisit: boolean

  // Metadata
  tenantId: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface ServiceField {
  id: string
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'select' | 'multiselect' | 'checkbox'
  required: boolean
  options?: string[] // for select/multiselect
  placeholder?: string
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  defaultValue?: any
  order: number
}

export interface CreateServiceInput {
  title: string
  description: string
  category: ServiceCategory
  basePrice?: number
  priceRange?: {
    min: number
    max: number
  }
  pricingDescription?: string
  estimatedDuration?: string
  includesWarranty?: boolean
  warrantyDescription?: string
  requiredFields: Omit<ServiceField, 'id'>[]
  propertyTypes: ('RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL')[]
  estimatedSizeRequired?: boolean
  imageUrl?: string
  gallery?: string[]
  features?: string[]
  benefits?: string[]
  isAvailable: boolean
  requiresSiteVisit: boolean
  tenantId: string
  createdById: string
}

export interface UpdateServiceInput {
  title?: string
  description?: string
  category?: ServiceCategory
  status?: ServiceStatus
  basePrice?: number
  priceRange?: {
    min: number
    max: number
  }
  pricingDescription?: string
  estimatedDuration?: string
  includesWarranty?: boolean
  warrantyDescription?: string
  requiredFields?: Omit<ServiceField, 'id'>[]
  propertyTypes?: ('RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL')[]
  estimatedSizeRequired?: boolean
  imageUrl?: string
  gallery?: string[]
  features?: string[]
  benefits?: string[]
  isAvailable?: boolean
  requiresSiteVisit?: boolean
}

export interface ServiceWithRelations extends Service {
  createdBy: {
    id: string
    name: string
    email: string
    role: string
  }
  _count?: {
    projectRequests: number
  }
}

export interface ServiceFilters {
  category?: ServiceCategory
  status?: ServiceStatus
  isAvailable?: boolean
  propertyType?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

export interface ServiceListResult {
  services: ServiceWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}