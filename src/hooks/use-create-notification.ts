"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNotification } from '@/app/app/notifications/action';
import { CreateNotificationInput } from '@/domains/notifications/entities/notification.entity';
import { useUserRole } from '@/hooks/use-user-role';

export function useCreateNotification() {
  const { user } = useUserRole();
  const queryClient = useQueryClient();

  const createNotificationMutation = useMutation({
    mutationFn: async (input: Omit<CreateNotificationInput, 'userId'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const result = await createNotification({
        ...input,
        userId: user.id,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidar queries de notificações para atualizar a UI
      queryClient.invalidateQueries({
        queryKey: ['notifications']
      });
    },
  });

  return {
    createNotification: createNotificationMutation.mutate,
    isCreatingNotification: createNotificationMutation.isPending,
    error: createNotificationMutation.error,
  };
}