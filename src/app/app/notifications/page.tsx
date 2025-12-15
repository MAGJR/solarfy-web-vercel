'use client';

import { useState } from 'react';
import { Bell, Check, CheckCircle, Filter, Trash2 } from 'lucide-react';
import { useNotification } from '@/hooks/use-notification';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { notifications, isLoading, markAsRead, isMarkingAsRead } = useNotification(filter === 'unread');

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TICKET_CREATED':
        return '🎫';
      case 'TICKET_ASSIGNED':
        return '👤';
      case 'TICKET_RESPONSE':
        return '💬';
      case 'TICKET_STATUS_CHANGED':
        return '📊';
      case 'PROJECT_STATUS_UPDATE':
        return '🏗️';
      case 'PROPOSAL_SENT':
        return '📄';
      case 'INSTALLATION_SCHEDULED':
        return '📅';
      case 'MAINTENANCE_REMINDER':
        return '🔧';
      default:
        return '🔔';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm font-medium">
                {unreadCount} novas
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{filter === 'unread' ? 'Apenas não lidas' : 'Todas'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Carregando notificações...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!notifications || notifications.length === 0) && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'unread'
              ? 'Todas as suas notificações já foram lidas.'
              : 'Você não tem notificações no momento.'}
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-card border rounded-lg p-4 transition-all hover:shadow-md ${
                !notification.isRead
                  ? 'border-primary/20 bg-primary/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium text-foreground mb-1 ${
                        !notification.isRead ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead({ notificationId: notification.id })}
                          disabled={isMarkingAsRead}
                          className="flex items-center space-x-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Marcar como lida</span>
                        </button>
                      )}

                      <button
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Excluir notificação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notification Type Badge */}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                      {notification.type.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      {unreadCount > 0 && (
        <div className="mt-6 flex justify-center">
          <button className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
            <Check className="w-4 h-4" />
            <span>Marcar todas como lidas</span>
          </button>
        </div>
      )}
    </div>
  );
}