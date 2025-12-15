import { CreateNotificationInput, GetUserNotificationsInput, MarkNotificationAsReadInput, NotificationEntity } from "@/domains/notifications/entities/notification.entity";
import { INotificationRepository } from "@/domains/notifications/repositories/notification.repository";


export class NotificationUseCase {
    constructor(private notificationRespository: INotificationRepository) {}

    async createNotification(input: CreateNotificationInput): Promise<NotificationEntity> {
        return this.notificationRespository.create(input)
    }

    async getUserNotifications(input: GetUserNotificationsInput): Promise<NotificationEntity[]> {
        return this.notificationRespository.findByUserId(input)
    }

    async markNotificationAsRead(input: MarkNotificationAsReadInput): Promise<NotificationEntity> {
        return this.notificationRespository.markAsRead(input.notificationId, input.userId)
    }
}