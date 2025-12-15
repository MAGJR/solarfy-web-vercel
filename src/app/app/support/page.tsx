'use client'

import { useUserRole } from '@/hooks/use-user-role'
import { AccessGate } from '@/presentation/components/app/components/access-gate'
import SupportDashboard from './components/support-dashboard'

export default function SupportPage() {
  const { user } = useUserRole()

  if (!user) {
    return null
  }

  return (
    <AccessGate feature="support">
      <SupportDashboard user={user} />
    </AccessGate>
  )
}