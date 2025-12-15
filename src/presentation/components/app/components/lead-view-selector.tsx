'use client'

import { useState } from 'react'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu'
import {
  User,
  Target,
  Activity,
  FileText,
  StickyNote,
  History,
  Building2,
  ChevronDown,
  Settings
} from 'lucide-react'

export type ViewType = 'overview' | 'details' | 'journey' | 'documents' | 'notes' | 'activities' | 'projects'

interface ViewOption {
  id: ViewType
  label: string
  icon: any
  description: string
  badge?: string
}

interface LeadViewSelectorProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  leadStatus?: string
  documentsCount?: number
  notesCount?: number
  activitiesCount?: number
}

export default function LeadViewSelector({
  currentView,
  onViewChange,
  leadStatus,
  documentsCount = 0,
  notesCount = 0,
  activitiesCount = 0
}: LeadViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const viewOptions: ViewOption[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: User,
      description: 'Basic lead information'
    },
    {
      id: 'details',
      label: 'Lead Details',
      icon: Target,
      description: 'Service, score, and qualification'
    },
    {
      id: 'journey',
      label: 'Customer Journey',
      icon: Activity,
      description: 'Sales funnel progress'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      description: 'Upload and manage files',
      badge: documentsCount > 0 ? documentsCount.toString() : undefined
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: StickyNote,
      description: 'Internal notes and comments',
      badge: notesCount > 0 ? notesCount.toString() : undefined
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: History,
      description: 'Calls, emails, and meetings',
      badge: activitiesCount > 0 ? activitiesCount.toString() : undefined
    },
    {
      id: 'projects',
      label: 'Related Projects',
      icon: Building2,
      description: 'Converted projects'
    }
  ]

  const currentViewOption = viewOptions.find(option => option.id === currentView) || viewOptions[0]
  const CurrentIcon = currentViewOption.icon

  return (
    <div className="flex items-center gap-4">
      {/* Current View Badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
        <CurrentIcon className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium text-sm">{currentViewOption.label}</span>
        {leadStatus && (
          <Badge variant="outline" className="text-xs">
            {leadStatus}
          </Badge>
        )}
      </div>

      {/* View Selector Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {viewOptions.map((option) => {
            const Icon = option.icon
            const isActive = option.id === currentView

            return (
              <DropdownMenuItem
                key={option.id}
                onClick={() => {
                  onViewChange(option.id)
                  setIsOpen(false)
                }}
                className={`flex items-center gap-3 p-3 cursor-pointer ${
                  isActive ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{option.label}</span>
                    {option.badge && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                        {option.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </p>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}