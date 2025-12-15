export enum NotificationType {
    TICKET_CREATED = 'TICKET_CREATED',
    TICKET_ASSIGNED = 'TICKET_ASSIGNED',
    TICKET_RESPONSE = 'TICKET_RESPONSE',
    TICKET_STATUS_CHANGED = 'TICKET_STATUS_CHANGED',
    PROPOSAL_SENT = 'PROPOSAL_SENT',
    INSTALLATION_SCHEDULED = 'INSTALLATION_SCHEDULED',
    MAINTENANCE_REMINDER = 'MAINTENANCE_REMINDER',
    PROJECT_REQUEST_CREATED = 'PROJECT_REQUEST_CREATED',
    PROJECT_REQUEST_ASSIGNED = 'PROJECT_REQUEST_ASSIGNED',
    PROJECT_REQUEST_APPROVED = 'PROJECT_REQUEST_APPROVED',
    PROJECT_REQUEST_REJECTED = 'PROJECT_REQUEST_REJECTED'

}

export interface NotificationEntity {
    id: string
    title: string
    message: string
    type: NotificationType
    userId: string
    isRead: boolean
    data?: any
    createdAt: Date
    updatedAt: Date
}

export interface CreateNotificationInput {
    title: string
    message: string
    type: NotificationType
    userId: string
    data?: any
}

export interface GetUserNotificationsInput {
    userId: string
    unreadOnly?: boolean
}

export interface MarkNotificationAsReadInput {
    notificationId: string
    userId: string
}

