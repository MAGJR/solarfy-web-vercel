import { PrismaClient } from "@prisma/client";
import { INotificationRepository } from "@/domains/notifications/repositories/notification.repository";
import { NotificationEntity, CreateNotificationInput, NotificationFilters } from "@/domains/notifications/entities/notification.entity";

export class PrismaNotificationRepository implements INotificationRepository {
    constructor(
        private prisma: PrismaClient
    ) {}

    async create(data: CreateNotificationInput): Promise<NotificationEntity> {
        return this.prisma.notification.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })
    }
    async findByUserId(filters: NotificationFilters): Promise<NotificationEntity[]> {
        return this.prisma.notification.findMany({
            where: {
                userId: filters.userId,
                ...(filters.unreadOnly && { isRead: false })
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
    }

    async markAsRead(id: string, userId: string): Promise<NotificationEntity> {
        return this.prisma.notification.update({
            where: { id, userId },
            data: { isRead: true },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
    }

    async markAllAsRead(userId: string): Promise<{ count: number }> {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }

    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });
    }

    async delete(id: string, userId: string): Promise<void> {
        await this.prisma.notification.delete({
            where: { id, userId }
        });
    }

    async findById(id: string, userId: string): Promise<NotificationEntity | null> {
        return this.prisma.notification.findFirst({
            where: { id, userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
    }
}