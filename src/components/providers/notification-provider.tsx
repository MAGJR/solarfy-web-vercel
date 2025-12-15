'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationToastContainer } from '@/components/ui/notification-toast';
import { CreateNotificationInput } from '@/domains/notifications/entities/notification.entity';

interface NotificationItem {
  id: string;
  notification: Omit<CreateNotificationInput, 'userId'>;
}

interface NotificationContextType {
  addNotification: (notification: Omit<CreateNotificationInput, 'userId'>) => void;
  notifications: NotificationItem[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationToast() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationToast must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((notification: Omit<CreateNotificationInput, 'userId'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, notification }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification, notifications }}>
      {children}

      {/* Toast Container */}
      <NotificationToastContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

// Hook for custom notifications
export function useAppNotifications() {
  const { addNotification } = useNotificationToast();

  const notifySuccess = useCallback((title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'SYSTEM_ANNOUNCEMENT' as any,
      data: { variant: 'success' }
    });
  }, [addNotification]);

  const notifyError = useCallback((title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'SYSTEM_ANNOUNCEMENT' as any,
      data: { variant: 'error' }
    });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'SYSTEM_ANNOUNCEMENT' as any,
      data: { variant: 'info' }
    });
  }, [addNotification]);

  const notifyTicketCreated = useCallback((ticketId: string, subject: string) => {
    addNotification({
      title: 'New Ticket Created',
      message: `Ticket #${ticketId}: ${subject}`,
      type: 'TICKET_CREATED',
      data: { ticketId }
    });
  }, [addNotification]);

  const notifyTicketAssigned = useCallback((ticketId: string, subject: string) => {
    addNotification({
      title: 'Ticket Assigned',
      message: `Ticket #${ticketId}: ${subject} has been assigned to you`,
      type: 'TICKET_ASSIGNED',
      data: { ticketId }
    });
  }, [addNotification]);

  const notifyTicketResponse = useCallback((ticketId: string, respondentName: string) => {
    addNotification({
      title: 'New Ticket Response',
      message: `${respondentName} responded to your ticket #${ticketId}`,
      type: 'TICKET_RESPONSE',
      data: { ticketId, respondentName }
    });
  }, [addNotification]);

  const notifyTicketStatusChanged = useCallback((ticketId: string, newStatus: string) => {
    addNotification({
      title: 'Ticket Status Updated',
      message: `Ticket #${ticketId} has been updated to: ${newStatus}`,
      type: 'TICKET_STATUS_CHANGED',
      data: { ticketId, newStatus }
    });
  }, [addNotification]);

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyTicketCreated,
    notifyTicketAssigned,
    notifyTicketResponse,
    notifyTicketStatusChanged,
    addNotification,
  };
}