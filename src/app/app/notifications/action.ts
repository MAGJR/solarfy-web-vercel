'use server';

import { NotificationUseCase } from "@/application/use-cases/notifications/notification-usecase";
import { PrismaNotificationRepository } from "@/infrastructure/repositories/prisma-notification.repository";
import { GetUserNotificationsInput, MarkNotificationAsReadInput, CreateNotificationInput } from "@/domains/notifications/entities/notification.entity";
import { auth } from "@/infrastructure/auth/auth.config";
import { prisma } from "@/infrastructure/database/prisma";
import { headers } from "next/headers";

// Instanciar repositório e use case
const notificationRepository = new PrismaNotificationRepository(prisma);
const notificationUseCase = new NotificationUseCase(notificationRepository);

export async function getUserNotifications(input: GetUserNotificationsInput) {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Verificar se o usuário só pode ver suas próprias notificações
    if (input.userId !== session.user.id) {
      return {
        success: false,
        error: 'Forbidden',
      }
    }

    const result = await notificationUseCase.getUserNotifications(input)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get notifications',
    }
  }
}

export async function markNotificationAsRead(input: MarkNotificationAsReadInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Verificar se o usuário só pode marcar suas próprias notificações
    if (input.userId !== session.user.id) {
      return {
        success: false,
        error: 'Forbidden',
      }
    }

    const result = await notificationUseCase.markNotificationAsRead(input)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark notification as read',
    }
  }
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Verificar se tem permissão para criar notificações
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true }
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Apenas admins e managers podem criar notificações para outros usuários
    if (input.userId !== session.user.id &&
        !['ADMIN', 'MANAGER'].includes(user.role)) {
      return {
        success: false,
        error: 'Forbidden',
      }
    }

    // Garantir que a notificação seja do mesmo tenant
    const targetUser = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { tenantId: true }
    })

    if (targetUser?.tenantId !== user.tenantId) {
      return {
        success: false,
        error: 'Forbidden',
      }
    }

    const result = await notificationUseCase.createNotification(input)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notification',
    }
  }
}