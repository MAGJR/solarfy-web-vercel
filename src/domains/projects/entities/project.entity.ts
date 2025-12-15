import { ProjectStatus } from "../types/project-status.enum"
import { EnphaseStatus } from "../types/enphase-status.enum"

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  estimatedKw: number
  estimatedPrice: number
  createdAt: Date
  updatedAt: Date
  customerId?: string
  createdById: string

  // New fields for Lead integration and Map
  crmLeadId?: string
  address?: string
  email?: string
  phone?: string
  latitude?: number
  longitude?: number

  // Enphase Integration Fields
  enphaseSystemId?: string
  enphaseStatus?: EnphaseStatus
  enphaseLastSync?: Date
  enphaseApiKey?: string
  enphaseEnabled?: boolean
  enphaseJwtToken?: string
  enphaseExpiresAt?: Date
}

export interface CreateProjectInput {
  name: string
  description?: string
  estimatedKw: number
  estimatedPrice: number
  customerId?: string
  createdById: string

  // New fields for Lead integration and Map
  crmLeadId?: string
  address?: string
  email?: string
  phone?: string
  latitude?: number
  longitude?: number

  // Enphase Integration Fields (optional during creation)
  enphaseSystemId?: string
  enphaseApiKey?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  status?: ProjectStatus
  estimatedKw?: number
  estimatedPrice?: number

  // New fields for Lead integration and Map
  crmLeadId?: string
  address?: string
  email?: string
  phone?: string
  latitude?: number
  longitude?: number

  // Enphase Integration Fields
  enphaseSystemId?: string
  enphaseStatus?: EnphaseStatus
  enphaseApiKey?: string
  enphaseEnabled?: boolean
}

export interface ProjectWithRelations extends Project {
  crmLead?: {
    id: string
    name: string
    email: string
    company: string
    status: string
  }
  customer?: {
    id: string
    name: string
    email: string
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  monitoringData?: {
    id: string
    systemStatus: string
    currentPowerW?: number
    energyTodayKwh?: number
    energyLifetimeKwh?: number
    lastUpdateTime: string
    production7Days?: any
    production30Days?: any
    activeAlerts?: any
    cacheValidUntil: string
    lastSyncAt: string
  }
}