'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import TicketCard from './ticket-card'
import PipelineColumn from './pipeline-column'
import { updateTicketStatus } from '../actions'
import { TicketStatus } from '../actions'
import type { TicketStatus as TicketStatusType } from '../actions'

interface Ticket {
  id: string
  subject: string
  description: string
  status: TicketStatusType
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  createdAt: Date
  responses: number | any[]
}

interface SupportPipelineProps {
  tickets: Ticket[]
  onTicketClick: (ticket: Ticket) => void
  onRefresh: () => void
  onStatusUpdate: (ticketId: string, newStatus: TicketStatusType) => void
}

const COLUMNS = [
  {
    id: 'column-OPEN',
    status: 'OPEN' as TicketStatusType,
    title: 'Open',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950',
    borderColor: 'border-blue-800'
  },
  {
    id: 'column-IN_PROGRESS',
    status: 'IN_PROGRESS' as TicketStatusType,
    title: 'In Progress',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-950',
    borderColor: 'border-yellow-800'
  },
  {
    id: 'column-RESOLVED',
    status: 'RESOLVED' as TicketStatusType,
    title: 'Resolved',
    color: 'text-green-400',
    bgColor: 'bg-green-950',
    borderColor: 'border-green-800'
  },
  {
    id: 'column-CLOSED',
    status: 'CLOSED' as TicketStatusType,
    title: 'Closed',
    color: 'text-gray-400',
    bgColor: 'bg-gray-900',
    borderColor: 'border-gray-700'
  },
]

export default function SupportPipeline({ tickets, onTicketClick, onRefresh, onStatusUpdate }: SupportPipelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Group tickets by status
  const ticketsByStatus = COLUMNS.reduce((acc, column) => {
    acc[column.status] = tickets.filter(ticket => ticket.status === column.status)
    return acc
  }, {} as Record<TicketStatusType, Ticket[]>)

  // Count total tickets for each status
  const statusCounts = COLUMNS.reduce((acc, column) => {
    acc[column.status] = ticketsByStatus[column.status].length
    return acc
  }, {} as Record<TicketStatusType, number>)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTicket = tickets.find(ticket => ticket.id === active.id)
    if (!activeTicket) return

    // Check if the drop target is one of our columns
    const targetColumn = COLUMNS.find(column => column.id === over.id)
    if (!targetColumn) return

    const newStatus = targetColumn.status

    // Check if status actually changed
    if (activeTicket.status === newStatus) return

    // Optimistically update the UI immediately
    onStatusUpdate(activeTicket.id, newStatus)
    toast.success(`Ticket moved to ${newStatus.replace('_', ' ').toLowerCase()}`)

    try {
      // Create FormData for server action
      const formData = new FormData()
      formData.append('ticketId', activeTicket.id)
      formData.append('status', newStatus)

      // Update ticket status on server
      const result = await updateTicketStatus(formData)

      if (!result.success) {
        // If server update fails, revert the optimistic update
        toast.error('Failed to update ticket status. Please refresh.')
        onRefresh()
      }
      // If successful, the optimistic update is already in place
    } catch (error) {
      console.error('Error updating ticket status:', error)
      toast.error('Failed to update ticket status. Please refresh.')
      onRefresh()
    }
  }

  
  const activeTicket = tickets.find(ticket => ticket.id === activeId)

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => (
            <PipelineColumn
              key={column.id}
              title={column.title}
              status={column.status}
              columnId={column.id}
              tickets={ticketsByStatus[column.status]}
              color={column.color}
              bgColor={column.bgColor}
              borderColor={column.borderColor}
              onTicketClick={onTicketClick}
              totalCount={statusCounts[column.status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && activeTicket ? (
            <div className="rotate-3 shadow-2xl">
              <TicketCard
                ticket={activeTicket}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}