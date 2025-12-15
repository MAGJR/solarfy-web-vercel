export interface SupportTicket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  tenantId: string
  createdById: string
  assignedToId?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
  responses?: TicketResponse[]
  createdBy?: User
  assignedTo?: User
}

export interface TicketResponse {
  id: string
  content: string
  isInternal: boolean
  ticketId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface User {
  id: string
  name?: string
  email: string
  role: string
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TicketCategory {
  TECHNICAL = 'TECHNICAL',
  FINANCIAL = 'FINANCIAL',
  MAINTENANCE = 'MAINTENANCE',
  QUESTION = 'QUESTION',
  BILLING = 'BILLING',
  INSTALLATION = 'INSTALLATION',
  PERFORMANCE = 'PERFORMANCE',
  OTHER = 'OTHER'
}

// Input Types
export interface CreateTicketInput {
  subject: string
  description: string
  priority: TicketPriority
  category: TicketCategory
  createdById: string
  tenantId: string
}

export interface UpdateTicketInput {
  subject?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  assignedToId?: string
  resolvedAt?: Date
}

export interface AddTicketResponseInput {
  content: string
  isInternal?: boolean
  ticketId: string
  userId: string
}

export interface GetTicketsOptions {
  tenantId: string
  userId?: string
  userRole?: string
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  assignedToId?: string
  createdById?: string
  page?: number
  limit?: number
  search?: string
}

export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  urgent: number
  myAssigned: number
}