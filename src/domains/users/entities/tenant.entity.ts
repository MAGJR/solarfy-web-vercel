export interface Tenant {
  id: string
  name: string
  domain?: string
  settings: TenantSettings
  createdAt: Date
  updatedAt: Date
  owner: User
  users: User[]
}

export interface TenantSettings {
  maxUsers: number
  allowInvites: boolean
  requireApproval: boolean
  defaultRole: UserRole
  features: string[]
  subscriptionPlan: SubscriptionPlan
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE'
}

export interface CreateTenantInput {
  name: string
  domain?: string
  ownerName: string
  ownerEmail: string
  ownerPhone?: string
  plan?: SubscriptionPlan
}

import { User, UserRole } from './user.entity'