import { createNotification } from '@/app/app/notifications/action';
import { NotificationType } from '@/domains/notifications/entities/notification.entity';
import { UserRole } from '@/domains/users/entities/user.entity';
import { prisma } from '@/infrastructure/database/prisma';

/**
 * Função para enviar notificações para múltiplos usuários
 */
export async function sendNotificationToUsers(
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType,
  data?: any
) {
  const results = [];

  for (const userId of userIds) {
    try {
      const result = await createNotification({
        title,
        message,
        type,
        userId,
        data,
      });

      results.push({ userId, success: result.success, error: result.error });
    } catch (error) {
      results.push({
        userId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Função para notificar sobre novo ticket
 */
export async function notifyNewTicket(ticket: {
  id: string;
  subject: string;
  tenantId: string;
  createdById: string;
}) {
  // Buscar técnicos, admins e managers do tenant (exceto quem criou)
  const usersToNotify = await prisma.user.findMany({
    where: {
      tenantId: ticket.tenantId,
      role: {
        in: [UserRole.TECHNICIAN, UserRole.ADMIN, UserRole.MANAGER]
      },
      id: {
        not: ticket.createdById // Não notificar quem criou
      }
    },
    select: { id: true }
  });

  const userIds = usersToNotify.map(user => user.id);

  if (userIds.length === 0) return [];

  return sendNotificationToUsers(
    userIds,
    'Novo Ticket de Suporte',
    `Ticket #${ticket.id}: ${ticket.subject}`,
    NotificationType.TICKET_CREATED,
    { ticketId: ticket.id }
  );
}

/**
 * Função para notificar sobre atribuição de ticket
 */
export async function notifyTicketAssignment(ticket: {
  id: string;
  subject: string;
  assignedToId: string;
  tenantId: string;
}) {
  // Notificar o técnico atribuído
  const result = await sendNotificationToUsers(
    [ticket.assignedToId],
    'Ticket Atribuído',
    `Ticket #${ticket.id}: ${ticket.subject} foi atribuído a você`,
    NotificationType.TICKET_ASSIGNED,
    { ticketId: ticket.id }
  );

  return result;
}

/**
 * Função para notificar sobre nova resposta em ticket
 */
export async function notifyTicketResponse(ticketResponse: {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  ticket: {
    subject: string;
    createdById: string;
    assignedToId?: string | null;
    tenantId: string;
  };
}) {
  const usersToNotify = new Set<string>();

  // Adicionar o criador do ticket (se não for quem respondeu)
  if (ticketResponse.ticket.createdById !== ticketResponse.userId) {
    usersToNotify.add(ticketResponse.ticket.createdById);
  }

  // Adicionar o técnico atribuído (se não for quem respondeu)
  if (
    ticketResponse.ticket.assignedToId &&
    ticketResponse.ticket.assignedToId !== ticketResponse.userId
  ) {
    usersToNotify.add(ticketResponse.ticket.assignedToId);
  }

  if (usersToNotify.size === 0) return [];

  // Limitar o tamanho da mensagem
  const content = ticketResponse.content.length > 100
    ? ticketResponse.content.substring(0, 100) + '...'
    : ticketResponse.content;

  return sendNotificationToUsers(
    Array.from(usersToNotify),
    'Nova Resposta no Ticket',
    `Nova resposta em #${ticketResponse.ticketId}: ${content}`,
    NotificationType.TICKET_RESPONSE,
    {
      ticketId: ticketResponse.ticketId,
      responseId: ticketResponse.id
    }
  );
}

/**
 * Função para notificar sobre mudança de status do ticket
 */
export async function notifyTicketStatusChange(ticket: {
  id: string;
  subject: string;
  status: string;
  createdById: string;
  assignedToId?: string | null;
  tenantId: string;
}) {
  const usersToNotify = new Set<string>();

  // Adicionar o criador do ticket
  usersToNotify.add(ticket.createdById);

  // Adicionar o técnico atribuído (se existir)
  if (ticket.assignedToId) {
    usersToNotify.add(ticket.assignedToId);
  }

  if (usersToNotify.size === 0) return [];

  // Traduzir o status para português
  const statusTranslations: Record<string, string> = {
    OPEN: 'Aberto',
    IN_PROGRESS: 'Em Andamento',
    RESOLVED: 'Resolvido',
    CLOSED: 'Fechado'
  };

  const statusText = statusTranslations[ticket.status] || ticket.status;

  return sendNotificationToUsers(
    Array.from(usersToNotify),
    'Status do Ticket Atualizado',
    `Ticket #${ticket.id}: ${ticket.subject} foi atualizado para: ${statusText}`,
    NotificationType.TICKET_STATUS_CHANGED,
    { ticketId: ticket.id, newStatus: ticket.status }
  );
}

/**
 * Função para notificar sobre atualização de projeto
 */
export async function notifyProjectStatusUpdate(project: {
  id: string;
  name: string;
  status: string;
  tenantId: string;
  customerId?: string | null;
}) {
  const usersToNotify = new Set<string>();

  // Adicionar o cliente do projeto (se existir)
  if (project.customerId) {
    usersToNotify.add(project.customerId);
  }

  // Buscar admins e managers do tenant
  const adminUsers = await prisma.user.findMany({
    where: {
      tenantId: project.tenantId,
      role: {
        in: [UserRole.ADMIN, UserRole.MANAGER]
      }
    },
    select: { id: true }
  });

  adminUsers.forEach(user => usersToNotify.add(user.id));

  if (usersToNotify.size === 0) return [];

  return sendNotificationToUsers(
    Array.from(usersToNotify),
    'Atualização de Projeto',
    `Projeto ${project.name} foi atualizado para: ${project.status}`,
    NotificationType.PROJECT_STATUS_UPDATE,
    { projectId: project.id, newStatus: project.status }
  );
}