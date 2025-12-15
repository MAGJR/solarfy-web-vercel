import {
  SupportTicket,
  TicketResponse,
  CreateTicketInput,
  UpdateTicketInput,
  AddTicketResponseInput,
  GetTicketsOptions,
  TicketStats
} from '../entities/support-ticket.entity'

// Re-export types for use in other modules
export type {
  SupportTicket,
  TicketResponse,
  CreateTicketInput,
  UpdateTicketInput,
  AddTicketResponseInput,
  GetTicketsOptions,
  TicketStats
}

export interface ISupportRepository {
  // Ticket CRUD operations
  create(input: CreateTicketInput): Promise<SupportTicket>
  findById(id: string): Promise<SupportTicket | null>
  update(id: string, input: UpdateTicketInput): Promise<SupportTicket>
  delete(id: string): Promise<void>

  // Ticket listing and filtering
  findMany(options: GetTicketsOptions): Promise<{
    tickets: SupportTicket[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>

  // Response operations
  addResponse(input: AddTicketResponseInput): Promise<TicketResponse>
  updateResponse(id: string, content: string): Promise<TicketResponse>
  deleteResponse(id: string): Promise<void>

  // Statistics
  getStats(tenantId: string, userId?: string, userRole?: string): Promise<TicketStats>

  // Assignment operations
  findUnassignedTickets(tenantId: string): Promise<SupportTicket[]>
  assignTicket(ticketId: string, technicianId: string): Promise<SupportTicket>

  // Search operations
  searchTickets(tenantId: string, query: string, limit?: number): Promise<SupportTicket[]>

  // User-specific operations
  findUserTickets(userId: string, tenantId: string, options?: Partial<GetTicketsOptions>): Promise<SupportTicket[]>
  findAssignedTickets(technicianId: string, tenantId: string): Promise<SupportTicket[]>
}