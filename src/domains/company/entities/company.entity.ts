export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  website?: string
  taxId?: string
  description?: string
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface CompanySettings {
  id: string
  companyId: string
  timezone: string
  currency: string
  dateFormat: string
  language: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  branding: {
    logo?: string
    primaryColor: string
    secondaryColor: string
  }
}

export interface Tenant {
  id: string
  name: string
  domain?: string
  settings: TenantSettings
  company?: Company
  owner: string
  users: User[]
  createdAt: Date
  updatedAt: Date
}

export interface TenantSettings {
  allowInvites: boolean
  requireEmailVerification: boolean
  sessionTimeout: number // in minutes
}

export interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  tenantId: string | null
  permissions: Permission[]
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES_REP = 'SALES_REP',
  TECHNICIAN = 'TECHNICIAN',
  VIEWER = 'VIEWER'
}

export enum Permission {
  // User Management
  CREATE_USER = 'CREATE_USER',
  READ_USERS = 'READ_USERS',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  INVITE_USER = 'INVITE_USER',

  // Company Management
  UPDATE_COMPANY_INFO = 'UPDATE_COMPANY_INFO',
  READ_COMPANY_INFO = 'READ_COMPANY_INFO',

  // Customer Management
  CREATE_CUSTOMER = 'CREATE_CUSTOMER',
  READ_CUSTOMERS = 'READ_CUSTOMERS',
  UPDATE_CUSTOMER = 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER = 'DELETE_CUSTOMER',

  // Project Management
  CREATE_PROJECT = 'CREATE_PROJECT',
  READ_PROJECTS = 'READ_PROJECTS',
  UPDATE_PROJECT = 'UPDATE_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',

  // Proposal Management
  CREATE_PROPOSAL = 'CREATE_PROPOSAL',
  READ_PROPOSALS = 'READ_PROPOSALS',
  UPDATE_PROPOSAL = 'UPDATE_PROPOSAL',
  DELETE_PROPOSAL = 'DELETE_PROPOSAL',

  // Installation Management
  CREATE_INSTALLATION = 'CREATE_INSTALLATION',
  READ_INSTALLATIONS = 'READ_INSTALLATIONS',
  UPDATE_INSTALLATION = 'UPDATE_INSTALLATION',
  DELETE_INSTALLATION = 'DELETE_INSTALLATION',

  // Monitoring
  READ_MONITORING = 'READ_MONITORING',
  EXPORT_DATA = 'EXPORT_DATA'
}

export interface Invitation {
  id: string
  email: string
  role: UserRole
  token: string
  message?: string
  status: InvitationStatus
  invitedBy: string
  tenantId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}