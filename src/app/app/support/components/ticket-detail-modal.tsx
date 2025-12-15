'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Badge } from '@/presentation/components/ui/badge'
import {
  MessageSquare,
  Send,
  X,
  Clock,
  User,
  AlertCircle
} from 'lucide-react'
import { type TicketStatus, type TicketPriority, type TicketCategory, updateTicketStatus, updateTicketCategory } from '../actions'

// Define the ticket interface locally to avoid import issues
interface SupportTicket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: Date
  updatedAt: Date
  category: TicketCategory
  responses: TicketResponse[] | number
  createdBy?: {
    id: string
    name?: string
    email: string
    role: string
  }
  assignedTo?: {
    id: string
    name?: string
    email: string
    role: string
  }
}

interface TicketResponse {
  id: string
  content: string
  isInternal: boolean
  ticketId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name?: string
    email: string
    role: string
  }
}

interface TicketDetailModalProps {
  ticket: SupportTicket | null
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  currentUserRole: string
  onResponseSent?: () => void
}

export default function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  currentUserId,
  currentUserRole,
  onResponseSent
}: TicketDetailModalProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<TicketStatus | null>(null)
  const [currentCategory, setCurrentCategory] = useState<TicketCategory | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>(Array.isArray(ticket?.responses) ? ticket.responses : [])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setResponses(Array.isArray(ticket?.responses) ? ticket.responses : [])
    if (ticket?.status) {
      setCurrentStatus(ticket.status)
    }
    if (ticket?.category) {
      setCurrentCategory(ticket.category)
    }
  }, [ticket])

  useEffect(() => {
    scrollToBottom()
  }, [responses])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return

    setIsUpdatingStatus(true)

    try {
      const formData = new FormData()
      formData.append('ticketId', ticket.id)
      formData.append('status', newStatus)

      const result = await updateTicketStatus(formData)

      if (result.success) {
        setCurrentStatus(newStatus)
        onResponseSent?.()
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCategoryChange = async (newCategory: TicketCategory) => {
    if (!ticket) return

    setIsUpdatingCategory(true)

    try {
      const formData = new FormData()
      formData.append('ticketId', ticket.id)
      formData.append('category', newCategory)

      const result = await updateTicketCategory(formData)

      if (result.success) {
        setCurrentCategory(newCategory)
        onResponseSent?.()
      }
    } catch (error) {
      console.error('Error updating ticket category:', error)
    } finally {
      setIsUpdatingCategory(false)
    }
  }

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !ticket) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('ticketId', ticket.id)
      formData.append('content', newMessage)
      formData.append('isInternal', 'false')

      const response = await fetch('/app/support/add-response', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setNewMessage('')
          // Add the new response to the local state
          const newResponse: TicketResponse = {
            id: result.response.id,
            content: newMessage,
            isInternal: false,
            ticketId: ticket.id,
            userId: currentUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: currentUserId,
              name: ticket.createdBy?.name || 'You',
              email: ticket.createdBy?.email || '',
              role: currentUserRole
            }
          }
          setResponses(prev => [...prev, newResponse])
          onResponseSent?.()
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isCurrentUserMessage = (response: TicketResponse) => {
    return response.userId === currentUserId
  }

  const canChangeStatus = true // All users can change status

  const getParticipantColor = (response: TicketResponse) => {
    if (isCurrentUserMessage(response)) {
      return 'bg-blue-500 text-white'
    }

    // Different colors based on role
    switch (response.user?.role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-900 border-purple-200'
      case 'MANAGER':
        return 'bg-green-100 text-green-900 border-green-200'
      case 'TECHNICIAN':
        return 'bg-orange-100 text-orange-900 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-900 border-gray-200'
    }
  }

  const getParticipantLabel = (response: TicketResponse) => {
    if (isCurrentUserMessage(response)) {
      return 'You'
    }

    switch (response.user?.role) {
      case 'ADMIN':
        return `${response.user.name} (Admin)`
      case 'MANAGER':
        return `${response.user.name} (Manager)`
      case 'TECHNICIAN':
        return `${response.user.name} (Technician)`
      default:
        return response.user?.name || 'Support'
    }
  }

  if (!ticket) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {ticket.subject}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">#{ticket.id}</span>
                {canChangeStatus ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={currentStatus || ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                      disabled={isUpdatingStatus}
                      className="px-2 py-1 text-xs border border-input rounded-md bg-background"
                    >
                      {currentUserRole === 'VIEWER' ? (
                        // VIEWER sees OPEN and CLOSE options
                        <>
                          <option value="OPEN">Open</option>
                          <option value="CLOSED">Close</option>
                        </>
                      ) : (
                        // Other roles see all status options
                        <>
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </>
                      )}
                    </select>
                    {isUpdatingStatus && (
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                ) : (
                  getStatusBadge(currentStatus || ticket.status)
                )}
                {getPriorityBadge(ticket.priority)}
                {currentUserRole === 'ADMIN' ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={currentCategory || ticket.category}
                      onChange={(e) => handleCategoryChange(e.target.value as TicketCategory)}
                      disabled={isUpdatingCategory}
                      className="px-2 py-1 text-xs border border-input rounded-md bg-background"
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
                    {isUpdatingCategory && (
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline">{ticket.category}</Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Ticket Description */}
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Ticket Description
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ticket.description}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Created on {formatDate(ticket.createdAt)}
            </div>
          </div>

          
          {/* Messages */}
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Conversation ({responses.length} messages)
            </h4>

            <div className="flex-1 pr-4 overflow-y-auto max-h-96">
              <div className="space-y-4">
                {responses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  responses.map((response, index) => (
                    <div
                      key={response.id}
                      className={`flex ${isCurrentUserMessage(response) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isCurrentUserMessage(response) ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg p-3 border ${getParticipantColor(response)}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {getParticipantLabel(response)}
                            </span>
                            <span className="text-xs opacity-70 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(response.createdAt)}
                            </span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">
                            {response.content}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 px-1">
                          {formatDate(response.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="mt-4 pt-4 border-t">
            <form onSubmit={handleSubmitMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isSubmitting || (currentStatus || ticket.status) === 'CLOSED'}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !newMessage.trim() || (currentStatus || ticket.status) === 'CLOSED'}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            {(currentStatus || ticket.status) === 'CLOSED' && (
              <p className="text-sm text-muted-foreground mt-2">
                This ticket is closed. No new messages can be added.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}