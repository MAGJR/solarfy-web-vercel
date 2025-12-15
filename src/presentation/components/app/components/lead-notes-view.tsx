'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import {
  StickyNote,
  Plus,
  User,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface LeadNote {
  id: string
  content: string
  createdAt: Date
  createdBy: string
}

interface LeadNotesViewProps {
  leadId: string
  initialNotes?: LeadNote[]
  onNoteAdd?: (note: string) => void
}

export default function LeadNotesView({
  leadId,
  initialNotes = [],
  onNoteAdd
}: LeadNotesViewProps) {
  const [notes, setNotes] = useState<LeadNote[]>(initialNotes)
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    setIsSubmitting(true)
    try {
      const note: LeadNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: newNote.trim(),
        createdAt: new Date(),
        createdBy: 'Current User' // TODO: Get from auth context
      }

      setNotes(prev => [note, ...prev])
      onNoteAdd?.(note.content)
      setNewNote('')
      toast.success('Note added successfully!')
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setIsSubmitting(false)
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
    <div className="space-y-6">
      {/* Add Note Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-orange-600" />
            Add New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note here... This could include important information about the lead, next steps, conversation details, etc."
            className="min-h-[120px]"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {newNote.length} characters
            </span>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || isSubmitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-orange-600" />
              Notes History ({notes.length})
            </div>
            {notes.length > 0 && (
              <Badge variant="outline">
                Most recent first
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={note.id}>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{note.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                  {index < notes.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <StickyNote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-4">
                Start adding notes to keep track of important information about this lead.
              </p>
              <Button
                variant="outline"
                onClick={() => document.querySelector('textarea')?.focus()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Note
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}