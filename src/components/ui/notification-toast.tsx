'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateNotificationInput } from '@/domains/notifications/entities/notification.entity';
import { useCreateNotification } from '@/hooks/use-create-notification';

interface NotificationToastProps {
  notification: Omit<CreateNotificationInput, 'userId'>;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function NotificationToast({
  notification,
  onClose,
  autoClose = true,
  duration = 5000,
}: NotificationToastProps) {
  const { createNotification } = useCreateNotification();

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'TICKET_CREATED':
      case 'PROJECT_STATUS_UPDATE':
        return 'border-blue-200 bg-blue-50';
      case 'TICKET_ASSIGNED':
      case 'TICKET_RESPONSE':
        return 'border-green-200 bg-green-50';
      case 'TICKET_STATUS_CHANGED':
        return 'border-yellow-200 bg-yellow-50';
      case 'MAINTENANCE_REMINDER':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50
      max-w-sm w-full
      border rounded-lg shadow-lg p-4
      transition-all duration-300 ease-in-out
      animate-in slide-in-from-right
      ${getNotificationColor(notification.type)}
    `}>
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-600">
            {notification.message}
          </p>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Container para múltiplos toasts
interface NotificationToastContainerProps {
  notifications: Array<{
    id: string;
    notification: Omit<CreateNotificationInput, 'userId'>;
  }>;
  onClose: (id: string) => void;
}

export function NotificationToastContainer({
  notifications,
  onClose,
}: NotificationToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(({ id, notification }) => (
        <NotificationToast
          key={id}
          notification={notification}
          onClose={() => onClose(id)}
        />
      ))}
    </div>
  );
}