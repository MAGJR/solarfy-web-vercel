'use client'

import { SubscriptionManager } from '@/presentation/components/app/components/subscription-manager'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  tenantId: string | null
  createdAt: string
  status: 'active' | 'inactive'
}

interface BillingSettingsProps {
  user: User
}

export default function BillingSettings({ user }: BillingSettingsProps) {
  return <SubscriptionManager />
}