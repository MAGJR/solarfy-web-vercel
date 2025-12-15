"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserNotifications, markNotificationAsRead, createNotification } from '@/app/app/notifications/action';
import { useUserRole } from '@/hooks/use-user-role';

export function useNotification(unreadOnly: boolean = false) {
  const { user, isLoading: userLoading } = useUserRole();
  const queryClient = useQueryClient();

  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications', user?.id, unreadOnly],
    queryFn: async () => {
      if (!user?.id) return [];

      const result = await getUserNotifications({
        userId: user.id,
        unreadOnly,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ notificationId }: { notificationId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const result = await markNotificationAsRead({
        notificationId,
        userId: user.id,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications']
      });
    },
  });

  return {
    notifications,
    isLoading: isLoading || userLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
}