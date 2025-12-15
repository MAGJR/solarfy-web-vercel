'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/presentation/components/ui/badge'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { GripVertical, MessageSquare, Calendar } from 'lucide-react'
import { TicketStatus, TicketPriority } from '../actions'

interface TicketCardProps {
  ticket: {
    id: string
    subject: string
    description: string
    status: TicketStatus
    priority: TicketPriority
    category: string
    createdAt: Date
    responses: number | any[]
  }
  onClick: (ticket: any) => void
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="secondary" className="bg-blue-900/50 text-blue-400 border-blue-700 text-xs">Open</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-yellow-900/50 text-yellow-400 border-yellow-700 text-xs">In Progress</Badge>
      case 'RESOLVED':
        return <Badge variant="default" className="bg-green-900/50 text-green-400 border-green-700 text-xs">Resolved</Badge>
      case 'CLOSED':
        return <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">Closed</Badge>
      default:
        return <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive" className="bg-red-900/50 text-red-400 border-red-700 text-xs">Urgent</Badge>
      case 'HIGH':
        return <Badge variant="destructive" className="bg-orange-900/50 text-orange-400 border-orange-700 text-xs">High</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-600 text-xs">Medium</Badge>
      case 'LOW':
        return <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">Low</Badge>
      default:
        return <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">Unknown</Badge>
    }
  }

  const getPriorityBorderColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-4 border-l-red-600'
      case 'HIGH':
        return 'border-l-4 border-l-orange-600'
      case 'MEDIUM':
        return 'border-l-4 border-l-yellow-600'
      case 'LOW':
        return 'border-l-4 border-l-gray-500'
      default:
        return 'border-l-4 border-l-gray-500'
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-2 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${getPriorityBorderColor(ticket.priority)} bg-card border-border`}
      onClick={() => onClick(ticket)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <h4 className="font-medium text-sm line-clamp-1 flex-1 text-foreground">{ticket.subject}</h4>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            {getPriorityBadge(ticket.priority)}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {ticket.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded text-muted-foreground">#{ticket.id.slice(-6)}</span>
            <span className="bg-muted px-2 py-1 rounded text-muted-foreground">{ticket.category}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            <span>{Array.isArray(ticket.responses) ? ticket.responses.length : ticket.responses}</span>
            <Calendar className="w-3 h-3 ml-1" />
            <span>{new Date(ticket.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}