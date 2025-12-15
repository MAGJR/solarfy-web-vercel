'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
import {
  MessageSquare,
  Plus,
  Search,
  Headphones,
  Phone,
  Mail,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react'
import { createTicket, getTickets, getTicketStats, type TicketStatus, type TicketPriority, type TicketCategory } from '../actions'
import TicketDetailModal from './ticket-detail-modal'
import SupportPipeline from './support-pipeline'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  tenantId: string | null
}

interface Ticket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: Date
  updatedAt: Date
  category: TicketCategory
  responses: number | any[]
}

interface SupportDashboardProps {
  user: User
}


export default function SupportDashboard({ user }: SupportDashboardProps) {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showTicketDetail, setShowTicketDetail] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list')

  // Role checks
  const isViewer = user.role === 'VIEWER'
  const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER'
  const isTechnician = user.role === 'TECHNICIAN'

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'TECHNICAL' as TicketCategory,
    priority: 'MEDIUM' as TicketPriority
  })

  // Server action states
  const [isCreateTicketPending, startCreateTicketTransition] = useTransition()
  const [createTicketState, setCreateTicketState] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load stats on mount
  useEffect(() => {
    loadStats()
  }, [])

  // Load tickets on mount and when filters change (only for list view)
  useEffect(() => {
    if (viewMode === 'list') {
      loadTickets()
    }
  }, [searchTerm, selectedStatus, currentPage, viewMode])

  // Load all tickets when switching to pipeline view
  useEffect(() => {
    if (viewMode === 'pipeline') {
      loadAllTicketsForPipeline()
    }
  }, [viewMode])

  
  const loadTickets = async () => {
    setLoading(true)
    try {
      const result = await getTickets({
        page: currentPage,
        limit: 10,
        status: selectedStatus === 'all' ? undefined : selectedStatus as TicketStatus,
        search: searchTerm || undefined,
      })

      if (result.success && result.data) {
        setTickets(result.data.tickets as Ticket[])
        setTotalPages(result.data.totalPages)
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load all tickets for pipeline mode (no filters)
  const loadAllTicketsForPipeline = async () => {
    setLoading(true)
    try {
      const result = await getTickets({
        page: 1,
        limit: 1000, // Load all tickets
      })

      if (result.success && result.data) {
        setTickets(result.data.tickets as Ticket[])
      }
    } catch (error) {
      console.error('Failed to load tickets for pipeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getTicketStats()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  // Filter tickets based on search and status (client-side filtering as backup)
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Open</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case 'RESOLVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>
      case 'CLOSED':
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>
      case 'HIGH':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">High</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary">Medium</Badge>
      case 'LOW':
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleCreateTicket = async (formData: FormData) => {
    startCreateTicketTransition(async () => {
      try {
        const result = await createTicket(formData)
        setCreateTicketState(result)

        if (result.success) {
          // Reset form and close modal
          setShowNewTicketForm(false)
          setNewTicket({
            subject: '',
            description: '',
            category: 'TECHNICAL' as TicketCategory,
            priority: 'MEDIUM' as TicketPriority
          })
          // Reload tickets and stats
          loadTickets()
          loadStats()
        }
      } catch (error) {
        setCreateTicketState({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create ticket'
        })
      }
    })
  }

  const handleOpenTicketDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDetail(true)
  }

  const handleCloseTicketDetail = () => {
    setShowTicketDetail(false)
    setSelectedTicket(null)
  }

  const handleResponseSent = () => {
    // Reload tickets to show the new message count
    if (viewMode === 'pipeline') {
      loadAllTicketsForPipeline()
    } else {
      loadTickets()
    }
  }

  const handlePipelineRefresh = () => {
    loadAllTicketsForPipeline()
    loadStats()
  }

  // Optimistically update ticket status locally
  const updateTicketStatusOptimistically = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus, updatedAt: new Date() }
          : ticket
      )
    )

    // Update stats optimistically
    setStats(prevStats => {
      if (!prevStats) return prevStats

      const oldStatus = tickets.find(t => t.id === ticketId)?.status
      if (!oldStatus) return prevStats

      const newStats = { ...prevStats }

      // Decrease old status count
      const oldStatusKey = oldStatus.toLowerCase().replace('_', '') as keyof typeof prevStats
      if (newStats[oldStatusKey] > 0) {
        newStats[oldStatusKey]--
      }

      // Increase new status count
      const newStatusKey = newStatus.toLowerCase().replace('_', '') as keyof typeof prevStats
      newStats[newStatusKey]++

      return newStats
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <Headphones className="w-6 h-6 mr-2" />
            {isViewer ? 'My Support Tickets' : isAdminOrManager ? 'Support Management' : 'Technical Support'}
          </h1>
          <p className="text-muted-foreground">
            {isViewer
              ? 'Manage your support tickets and track progress'
              : isAdminOrManager
                ? 'Manage and respond to customer support tickets'
                : 'View and respond to assigned support tickets'
            }
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggle - Only for Admin/Manager */}
          {isAdminOrManager && (
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center space-x-1"
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </Button>
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
                className="flex items-center space-x-1"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Pipeline</span>
              </Button>
            </div>
          )}

          {/* Only show "New Ticket" button for VIEWER */}
          {isViewer && (
            <Button
              onClick={() => setShowNewTicketForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Ticket</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards for Admin/Manager/Technician */}
      {!isViewer && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">!</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">⟳</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isTechnician ? 'Assigned to Me' : 'Urgent'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {isTechnician ? stats.myAssigned : stats.urgent}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600">!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Contact Cards - Only for VIEWER */}
      {isViewer && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">+1 (800) 123-4567</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">support@solarfy.com</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Online Chat</p>
                <p className="text-sm text-muted-foreground">Mon-Fri 8am-6pm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Search and Filters - Only show in list view */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isViewer
                ? 'My Tickets'
                : isAdminOrManager
                  ? 'All Tickets'
                  : 'Assigned Tickets'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                  isViewer
                    ? 'Search my tickets...'
                    : isAdminOrManager
                      ? 'Search all tickets...'
                      : 'Search assigned tickets...'
                }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Area - Different views based on mode */}
      {viewMode === 'list' ? (
        <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleOpenTicketDetail(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Category: {ticket.category}</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>{Array.isArray(ticket.responses) ? ticket.responses.length : ticket.responses} responses</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                </div>
              ))}

              {filteredTickets.length === 0 && !loading && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isViewer
                      ? 'No tickets found'
                      : isAdminOrManager
                        ? 'No tickets found'
                        : 'No assigned tickets found'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      ) : (
        /* Pipeline View */
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading pipeline...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SupportPipeline
              tickets={tickets}
              onTicketClick={handleOpenTicketDetail}
              onRefresh={handlePipelineRefresh}
              onStatusUpdate={updateTicketStatusOptimistically}
            />
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>New Support Ticket</CardTitle>
              {createTicketState?.error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{createTicketState.error}</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form action={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Briefly describe the problem"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as TicketCategory }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="TECHNICAL">Technical</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="BILLING">Billing</option>
                    <option value="INSTALLATION">Installation</option>
                    <option value="PERFORMANCE">Performance</option>
                    <option value="QUESTION">Question</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as TicketPriority }))}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe in detail your problem or question..."
                    rows={5}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTicketForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreateTicketPending}>
                    {isCreateTicketPending ? 'Submitting...' : 'Open Ticket'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketDetail && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={showTicketDetail}
          onClose={handleCloseTicketDetail}
          currentUserId={user.id}
          currentUserRole={user.role}
          onResponseSent={handleResponseSent}
        />
      )}
    </div>
  )
}