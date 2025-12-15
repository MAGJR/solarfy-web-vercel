'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import {
  History,
  Phone,
  Mail,
  User,
  MessageSquare,
  Clock,
  Plus,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface ActivityItem {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  title: string
  description?: string
  createdAt: Date
  createdBy: string
  duration?: number
  outcome?: string
}

interface LeadActivitiesViewProps {
  leadId: string
  initialActivities?: ActivityItem[]
  onActivityAdd?: (activity: Partial<ActivityItem>) => void
}

export default function LeadActivitiesView({
  leadId,
  initialActivities = [],
  onActivityAdd
}: LeadActivitiesViewProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)

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
        return History
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'call':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'email':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'meeting':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'note':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'task':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleQuickActivity = (type: ActivityItem['type'], title: string) => {
    const activity: ActivityItem = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      createdAt: new Date(),
      createdBy: 'Current User'
    }

    setActivities(prev => [activity, ...prev])
    onActivityAdd?.(activity)
    toast.success(`${title} logged successfully!`)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const quickActions = [
    {
      type: 'call' as const,
      title: 'Phone Call',
      description: 'Logged a phone call with the lead',
      icon: Phone,
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
    },
    {
      type: 'email' as const,
      title: 'Email Sent',
      description: 'Sent an email to the lead',
      icon: Mail,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
    },
    {
      type: 'meeting' as const,
      title: 'Meeting Scheduled',
      description: 'Scheduled or completed a meeting',
      icon: User,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Quick Log Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.type}
                  variant="outline"
                  className={`h-auto p-4 flex-col items-start gap-2 ${action.color}`}
                  onClick={() => handleQuickActivity(action.type, action.title)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <span className="text-xs text-left opacity-75">
                    {action.description}
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activities Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Activities Timeline ({activities.length})
            </div>
            {activities.length > 0 && (
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                Chronological order
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type)
                const colorClass = getActivityColor(activity.type)

                return (
                  <div key={activity.id}>
                    <div className={`flex gap-4 p-4 rounded-lg border ${colorClass}`}>
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{activity.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(activity.createdAt)}
                              </span>
                              {activity.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {formatDuration(activity.duration)}
                                </Badge>
                              )}
                              {activity.outcome && (
                                <Badge variant="secondary" className="text-xs">
                                  {activity.outcome}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Logged by {activity.createdBy}
                        </p>
                      </div>
                    </div>
                    {index < activities.length - 1 && <Separator className="my-4" />}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No activities yet</h3>
              <p className="text-muted-foreground mb-4">
                Start logging activities to track your interactions with this lead.
              </p>
              <div className="flex justify-center gap-2">
                {quickActions.slice(0, 2).map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.type}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickActivity(action.type, action.title)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {action.title}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}