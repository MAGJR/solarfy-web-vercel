export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  status: UserStatus
  tenantId: string
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

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum Permission {
  // User Management
  CREATE_USER = 'CREATE_USER',
  READ_USERS = 'READ_USERS',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  INVITE_USER = 'INVITE_USER',

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

  // Project Request Management
  CREATE_PROJECT_REQUEST = 'CREATE_PROJECT_REQUEST',
  READ_PROJECT_REQUESTS = 'READ_PROJECT_REQUESTS',
  UPDATE_PROJECT_REQUEST = 'UPDATE_PROJECT_REQUEST',
  DELETE_PROJECT_REQUEST = 'DELETE_PROJECT_REQUEST',
  MANAGE_PROJECT_REQUESTS = 'MANAGE_PROJECT_REQUESTS',

  // Equipment Management
  CREATE_EQUIPMENT = 'CREATE_EQUIPMENT',
  READ_EQUIPMENT = 'READ_EQUIPMENT',
  UPDATE_EQUIPMENT = 'UPDATE_EQUIPMENT',
  DELETE_EQUIPMENT = 'DELETE_EQUIPMENT',

  // Analytics
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',

  // System
  MANAGE_TENANT = 'MANAGE_TENANT',
  MANAGE_PERMISSIONS = 'MANAGE_PERMISSIONS'
}

export interface CreateTenantUserInput {
  name: string
  email: string
  phone?: string
  role: UserRole
  permissions: Permission[]
  tenantId: string
  invitedBy: string
}

export interface UpdateTenantUserInput {
  name?: string
  phone?: string
  role?: UserRole
  status?: UserStatus
  permissions?: Permission[]
}

export interface InviteUserInput {
  email: string
  role: UserRole
  permissions: Permission[]
  message?: string
  tenantId: string
  invitedBy: string
}