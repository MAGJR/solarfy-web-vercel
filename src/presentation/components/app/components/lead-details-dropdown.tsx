'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import {
  ChevronDown,
  ChevronUp,
  FileText,
  StickyNote,
  History,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  User,
  Paperclip
} from 'lucide-react'
import DocumentUpload from './document-upload'
import { toast } from 'sonner'

interface LeadNote {
  id: string
  content: string
  createdAt: Date
  createdBy: string
}

interface ActivityItem {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  title: string
  description: string
  createdAt: Date
  createdBy: string
}

interface LeadDetailsDropdownProps {
  leadId: string
  notes?: LeadNote[]
  activities?: ActivityItem[]
  onNoteAdd?: (note: string) => void
  onActivityAdd?: (activity: Partial<ActivityItem>) => void
}

export default function LeadDetailsDropdown({
  leadId,
  notes = [],
  activities = [],
  onNoteAdd,
  onActivityAdd
}: LeadDetailsDropdownProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'notes' | 'activities'>('documents')
  const [isExpanded, setIsExpanded] = useState(false)
  const [newNote, setNewNote] = useState('')

  const tabs = [
    {
      id: 'documents' as const,
      label: 'Documents',
      icon: FileText,
      count: 0 // Will be updated dynamically
    },
    {
      id: 'notes' as const,
      label: 'Notes',
      icon: StickyNote,
      count: notes.length
    },
    {
      id: 'activities' as const,
      label: 'Activities',
      icon: History,
      count: activities.length
    }
  ]

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    onNoteAdd?.(newNote.trim())
    setNewNote('')
    toast.success('Note added successfully!')
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'call':
        return Phone
      case 'email':
        return Mail
      case 'meeting':
        return User
      case 'note':
        return MessageSquare
      case 'task':
        return Clock
      default:
        return Activity
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'call':
        return 'text-green-600 bg-green-50'
      case 'email':
        return 'text-blue-600 bg-blue-50'
      case 'meeting':
        return 'text-purple-600 bg-purple-50'
      case 'note':
        return 'text-orange-600 bg-orange-50'
      case 'task':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-indigo-600" />
            Additional Information
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-muted rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 h-8"
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>
      </CardHeader>

      {/* Content */}
      {isExpanded && (
        <CardContent className="pt-0">
          {activeTab === 'documents' && (
            <DocumentUpload
              leadId={leadId}
              onDocumentUpload={(document) => {
                console.log('Document uploaded:', document)
                // Update documents count
                tabs[0].count++
              }}
              onDocumentDelete={(documentId) => {
                console.log('Document deleted:', documentId)
                // Update documents count
                tabs[0].count = Math.max(0, tabs[0].count - 1)
              }}
            />
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Add New Note</h4>
                <div className="flex gap-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter your note here..."
                    className="flex-1 min-h-[80px] px-3 py-2 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <StickyNote className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>

              <Separator />

              {/* Notes List */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recent Notes</h4>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm">{note.createdBy}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notes added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-4">
              {/* Quick Add Activity */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onActivityAdd?.({ type: 'call', title: 'Phone Call' })
                      toast.info('Call logged successfully!')
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Log Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onActivityAdd?.({ type: 'email', title: 'Email Sent' })
                      toast.info('Email logged successfully!')
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Log Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onActivityAdd?.({ type: 'meeting', title: 'Meeting Scheduled' })
                      toast.info('Meeting logged successfully!')
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Log Meeting
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Activities Timeline */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recent Activities</h4>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type)
                      const colorClass = getActivityColor(activity.type)

                      return (
                        <div key={activity.id} className="flex gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-sm">{activity.title}</h5>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(activity.createdAt)}
                              </span>
                            </div>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground">
                                {activity.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              by {activity.createdBy}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No activities logged yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}