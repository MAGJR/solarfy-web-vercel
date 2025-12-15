'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import TicketCard from './ticket-card'
import { TicketStatus } from '../actions'

interface PipelineColumnProps {
  title: string
  status: TicketStatus
  columnId: string
  tickets: any[]
  color: string
  bgColor: string
  borderColor: string
  onTicketClick: (ticket: any) => void
  totalCount?: number
}

export default function PipelineColumn({
  title,
  status,
  columnId,
  tickets,
  color,
  bgColor,
  borderColor,
  onTicketClick,
  totalCount
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
  })

  return (
    <div className="flex-1 min-w-0">
      <Card className={`h-full min-h-[600px] border ${borderColor} ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} bg-card`}>
        <CardHeader className={`${bgColor} pb-3 border-b ${borderColor}`}>
          <CardTitle className={`text-sm font-semibold ${color} flex items-center justify-between`}>
            <span>{title}</span>
            <span className="bg-background/20 px-2 py-1 rounded-full text-xs border ${borderColor}">
              {totalCount ?? tickets.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 bg-card/50">
          <div
            ref={setNodeRef}
            className={`min-h-[500px] ${isOver ? 'bg-muted/50 rounded-lg p-2 border-2 border-dashed border-blue-500' : ''}`}
          >
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm">No tickets</div>
              </div>
            ) : (
              <SortableContext
                items={tickets.map(ticket => ticket.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={onTicketClick}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}