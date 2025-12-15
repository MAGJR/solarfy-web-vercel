'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Label } from '@/presentation/components/ui/label'
import {
  Mail,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Phone,
  Video,
  MapPin,
  Plus,
  Send,
  History
} from 'lucide-react'
import { toast } from 'sonner'

interface EmailLog {
  id: string
  subject: string
  recipient: string
  sentAt: Date
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced'
  preview: string
}

interface MeetingSchedule {
  id: string
  title: string
  date: Date
  duration: number
  type: 'call' | 'video' | 'in-person'
  location?: string
  description?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  attendees?: string[]
}

interface LeadLogsScheduleProps {
  leadId: string
}

export default function LeadLogsSchedule({ leadId }: LeadLogsScheduleProps) {
  const [activeTab, setActiveTab] = useState<'emails' | 'schedule'>('emails')
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  // Mock data - would come from API
  const [emailLogs] = useState<EmailLog[]>([
    {
      id: '1',
      subject: 'Proposal for Solar Installation - Solarfy',
      recipient: 'john.doe@company.com',
      sentAt: new Date('2024-01-15T10:30:00'),
      status: 'opened',
      preview: 'Thank you for your interest in our solar solutions. Please find attached...'
    },
    {
      id: '2',
      subject: 'Follow-up: Solar Consultation',
      recipient: 'john.doe@company.com',
      sentAt: new Date('2024-01-16T14:20:00'),
      status: 'delivered',
      preview: 'I hope you had a chance to review our proposal. I would like to...'
    },
    {
      id: '3',
      subject: 'Site Visit Confirmation',
      recipient: 'john.doe@company.com',
      sentAt: new Date('2024-01-17T09:15:00'),
      status: 'sent',
      preview: 'This is to confirm our site visit scheduled for...'
    }
  ])

  const [meetings, setMeetings] = useState<MeetingSchedule[]>([
    {
      id: '1',
      title: 'Initial Solar Consultation',
      date: new Date('2024-01-20T14:00:00'),
      duration: 60,
      type: 'video',
      location: 'Zoom Meeting',
      status: 'scheduled',
      attendees: ['John Doe', 'Sarah Smith (Sales Rep)']
    },
    {
      id: '2',
      title: 'Site Visit',
      date: new Date('2024-01-22T10:00:00'),
      duration: 120,
      type: 'in-person',
      location: '123 Main St, City, State',
      status: 'scheduled',
      attendees: ['John Doe', 'Mike Johnson (Technical Specialist)']
    }
  ])

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    type: 'video' as 'call' | 'video' | 'in-person',
    location: '',
    description: '',
    attendees: ''
  })

  const getStatusColor = (status: EmailLog['status'] | MeetingSchedule['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'opened':
        return 'bg-purple-100 text-purple-800'
      case 'clicked':
        return 'bg-indigo-100 text-indigo-800'
      case 'bounced':
        return 'bg-red-100 text-red-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: MeetingSchedule['type']) => {
    switch (type) {
      case 'call':
        return Phone
      case 'video':
        return Video
      case 'in-person':
        return MapPin
      default:
        return Calendar
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return date < now ? 'Yesterday' : 'Tomorrow'
    if (diffDays < 7) return `${diffDays} days ${date < now ? 'ago' : 'from now'}`
    return formatDate(date)
  }

  const handleScheduleMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      toast.error('Please fill in all required fields')
      return
    }

    const meetingDate = new Date(`${newMeeting.date}T${newMeeting.time}`)
    const meeting: MeetingSchedule = {
      id: Date.now().toString(),
      title: newMeeting.title,
      date: meetingDate,
      duration: newMeeting.duration,
      type: newMeeting.type,
      location: newMeeting.location || undefined,
      description: newMeeting.description || undefined,
      status: 'scheduled',
      attendees: newMeeting.attendees ? newMeeting.attendees.split(',').map(a => a.trim()) : []
    }

    setMeetings(prev => [...prev, meeting])
    setNewMeeting({
      title: '',
      date: '',
      time: '',
      duration: 60,
      type: 'video',
      location: '',
      description: '',
      attendees: ''
    })
    setShowScheduleForm(false)
    toast.success('Meeting scheduled successfully!')
  }

  const tabs = [
    {
      id: 'emails' as const,
      label: 'Email Logs',
      icon: Mail,
      count: emailLogs.length
    },
    {
      id: 'schedule' as const,
      label: 'Schedule',
      icon: Calendar,
      count: meetings.filter(m => m.status === 'scheduled').length
    }
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-1 space-y-1 sm:space-y-0 p-1 bg-muted rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center justify-center sm:justify-start gap-2 h-8 w-full sm:w-auto"
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

      {/* Email Logs */}
      {activeTab === 'emails' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email Communication History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailLogs.length > 0 ? (
              <div className="space-y-4">
                {emailLogs.map((email) => (
                  <div
                    key={email.id}
                    className="p-3 lg:p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{email.subject}</h4>
                          <Badge className={getStatusColor(email.status)}>
                            {email.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            To: {email.recipient}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>{formatRelativeTime(email.sentAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.preview}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No emails sent yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meeting Schedule */}
      {activeTab === 'schedule' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Meeting Schedule
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowScheduleForm(!showScheduleForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Schedule Form */}
            {showScheduleForm && (
              <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-medium mb-3 lg:mb-4">Schedule New Meeting</h4>
                <div className="grid grid-cols-1 gap-3 lg:gap-4">
                  <div>
                    <Label htmlFor="title">Meeting Title *</Label>
                    <Input
                      id="title"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Follow-up Call"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newMeeting.duration}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                        min="15"
                        step="15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        value={newMeeting.type}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value as MeetingSchedule['type'] }))}
                        className="w-full p-2 border border-border rounded-md bg-background text-sm"
                      >
                        <option value="call">Phone Call</option>
                        <option value="video">Video Call</option>
                        <option value="in-person">In Person</option>
                      </select>
                    </div>
                  </div>
                  {(newMeeting.type === 'in-person' || newMeeting.type === 'video') && (
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newMeeting.location}
                        onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                        placeholder={newMeeting.type === 'video' ? 'Zoom/Teams link' : 'Address'}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="attendees">Attendees (comma separated)</Label>
                    <Input
                      id="attendees"
                      value={newMeeting.attendees}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, attendees: e.target.value }))}
                      placeholder="John Doe, Jane Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Meeting agenda or notes..."
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button onClick={handleScheduleMeeting}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowScheduleForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Meetings List */}
            {meetings.length > 0 ? (
              <div className="space-y-4">
                {meetings.map((meeting) => {
                  const Icon = getTypeIcon(meeting.type)
                  return (
                    <div
                      key={meeting.id}
                      className="p-3 lg:p-4 bg-muted/30 rounded-lg border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <h4 className="font-medium text-sm">{meeting.title}</h4>
                            <Badge className={getStatusColor(meeting.status)}>
                              {meeting.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatRelativeTime(meeting.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {meeting.duration} min
                            </span>
                            {meeting.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {meeting.location}
                              </span>
                            )}
                          </div>
                          {meeting.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {meeting.description}
                            </p>
                          )}
                          {meeting.attendees && meeting.attendees.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{meeting.attendees.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No meetings scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}