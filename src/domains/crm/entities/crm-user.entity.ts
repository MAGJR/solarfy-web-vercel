export interface CrmUser {
  id: string
  name: string
  email: string
  phone?: string
  status: CrmUserStatus
  score: number
  assignee?: string
  productService: ProductService
  startDate: Date
  company: string
  journey: UserJourneyStep[]
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

export enum CrmUserStatus {
  LEAD = 'LEAD',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
  ON_HOLD = 'ON_HOLD'
}

export enum ProductService {
  SOLAR_PANELS = 'SOLAR_PANELS',
  SOLAR_WATER_HEATER = 'SOLAR_WATER_HEATER',
  BATTERY_STORAGE = 'BATTERY_STORAGE',
  EV_CHARGING = 'EV_CHARGING',
  ENERGY_AUDIT = 'ENERGY_AUDIT',
  MAINTENANCE = 'MAINTENANCE',
  CONSULTING = 'CONSULTING'
}

export interface UserJourneyStep {
  id: string
  step: JourneyStepType
  status: StepStatus
  completedAt?: Date
  notes?: string
  assignedTo?: string
}

export enum JourneyStepType {
  INITIAL_CONTACT = 'INITIAL_CONTACT',
  SITE_VISIT_SCHEDULED = 'SITE_VISIT_SCHEDULED',
  SITE_VISIT_COMPLETED = 'SITE_VISIT_COMPLETED',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  INSTALLATION_SCHEDULED = 'INSTALLATION_SCHEDULED',
  INSTALLATION_COMPLETED = 'INSTALLATION_COMPLETED',
  SYSTEM_ACTIVATED = 'SYSTEM_ACTIVATED',
  FOLLOW_UP_SCHEDULED = 'FOLLOW_UP_SCHEDULED'
}

export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED'
}

export interface CreateCrmUserInput {
  name: string
  email: string
  phone?: string
  company: string
  productService: ProductService
  assignee?: string
  notes?: string
  createdBy: string
}

export interface UpdateCrmUserInput {
  name?: string
  phone?: string
  status?: CrmUserStatus
  score?: number
  assignee?: string
  productService?: ProductService
  notes?: string
}

export interface CrmUserQueryInput {
  page?: number
  limit?: number
  status?: CrmUserStatus
  assignee?: string
  productService?: ProductService
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
}