'use client'

import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, Check } from 'lucide-react'
import { useNotification } from '@/hooks/use-notification'

interface DashboardHeaderProps {
  pageTitle?: string
}

export default function DashboardHeader({ pageTitle = "Dashboard" }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { notifications, isLoading, markAsRead, isMarkingAsRead } = useNotification()

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - new Date(date).getTime()
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMins < 60) return `${diffInMins} min ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-card border border-border rounded-lg shadow-lg p-2 w-96 max-h-96 overflow-y-auto z-50"
                sideOffset={5}
                align="end"
              >
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                      onClick={() => {
                        // TODO: Implement mark all as read
                      }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Loading notifications...
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No notifications
                  </div>
                ) : (
                  <div className="py-1">
                    {notifications.map((notification) => (
                      <DropdownMenu.Item
                        key={notification.id}
                        className="relative p-3 hover:bg-muted transition-colors cursor-pointer outline-none"
                        onClick={() => markAsRead({ notificationId: notification.id })}
                        disabled={isMarkingAsRead}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.isRead ? 'bg-transparent' : 'bg-primary'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-foreground ${
                              notification.isRead ? 'font-normal' : ''
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <button
                              className="p-1 hover:bg-muted rounded transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead({ notificationId: notification.id })
                              }}
                              disabled={isMarkingAsRead}
                            >
                              <Check className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      </DropdownMenu.Item>
                    ))}
                  </div>
                )}

                {notifications && notifications.length > 0 && (
                  <div className="p-2 border-t border-border">
                    <button className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                      View all notifications
                    </button>
                  </div>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}