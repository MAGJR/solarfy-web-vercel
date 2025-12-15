"use client"

import { useStripeSubscription } from './use-stripe-subscription'
import { useUserRole } from '@/hooks/use-user-role'
import { RolePermissionsService } from '@/domains/users/services/role-permissions.service'
import { UserRole } from '@/domains/users/entities/user.entity'

export interface UserAccessLevel {
  hasActiveSubscription: boolean
  canAccessDashboard: boolean
  canAccessMonitoring: boolean
  canAccessSupport: boolean
  canAccessSettings: boolean
  isExpired: boolean
  daysUntilExpiration: number
}

export function useUserAccess(): UserAccessLevel {
  const { isSubscribed, isCancelled, daysUntilRenewal } = useStripeSubscription()
  const { user } = useUserRole()

  const hasActiveSubscription = isSubscribed && !isCancelled
  const isExpired = isCancelled && daysUntilRenewal <= 0

  // Apenas VIEWERS precisam de assinatura para acessar features
  // Demais roles têm acesso baseado em suas permissões
  let canAccessDashboard = false
  let canAccessMonitoring = false
  let canAccessSupport = false

  if (user) {
    const userRole = user.role as any
    const navPermissions = RolePermissionsService.getNavigationPermissions(userRole)

    if (userRole === 'VIEWER') {
      // VIEWERS precisam de assinatura para acessar dashboard e support
      canAccessDashboard = hasActiveSubscription
      canAccessMonitoring = navPermissions.canViewMonitoring // Monitoring é redirecionado na página
      canAccessSupport = hasActiveSubscription
    } else {
      // Admins, Managers, Sales Reps, Technicians têm acesso baseado em permissões
      canAccessDashboard = navPermissions.canViewDashboard
      canAccessMonitoring = navPermissions.canViewMonitoring
      canAccessSupport = navPermissions.canViewSupport
    }
  }

  return {
    hasActiveSubscription,
    canAccessDashboard,
    canAccessMonitoring,
    canAccessSupport,
    canAccessSettings: true, // Sempre pode acessar settings para assinar
    isExpired,
    daysUntilExpiration: daysUntilRenewal
  }
}