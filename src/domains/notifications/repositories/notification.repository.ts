import { NotificationEntity, CreateNotificationInput, NotificationFilters, UpdateNotificationInput } from '../types/notification.types';

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<NotificationEntity>;
  findByUserId(filters: NotificationFilters): Promise<NotificationEntity[]>;
  markAsRead(id: string, userId: string): Promise<NotificationEntity>;
  markAllAsRead(userId: string): Promise<{ count: number }>;
  getUnreadCount(userId: string): Promise<number>;
  delete(id: string, userId: string): Promise<void>;
  findById(id: string, userId: string): Promise<NotificationEntity | null>;
}