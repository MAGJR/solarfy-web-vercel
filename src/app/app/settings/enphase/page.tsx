'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import { redirect } from 'next/navigation'
import EnphaseSettings from './components/enphase-settings'
import OAuthNotification from './components/oauth-notification'
import { getTenantEnphaseStatus, getTenantOAuthUrl } from './actions'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  tenantId: string | null
  createdAt: string
  status: 'active' | 'inactive'
}

export default function EnphaseSettingsPage() {
  const { user } = useUserRole()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [enphaseStatus, setEnphaseStatus] = useState<any>(null)

  useEffect(() => {
    if (user && !['ADMIN', 'MANAGER'].includes(user.role)) {
      redirect('/app/settings')
    }
  }, [user, redirect])

  useEffect(() => {
    const loadEnphaseStatus = async () => {
      if (!user?.tenantId) {
        setIsLoading(false)
        return
      }

      try {
        const result = await getTenantEnphaseStatus(user.tenantId)
        if (result.success) {
          setEnphaseStatus(result.data)
        }
      } catch (error) {
        console.error('Error loading Enphase status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadEnphaseStatus()
    }
  }, [user])

  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  const fullUser: User = {
    id: user?.id || '',
    name: user?.name || null,
    email: user?.email || '',
    role: user?.role || '',
    tenantId: user?.tenantId || null,
    createdAt: new Date().toISOString(),
    status: 'active'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Enphase Integration
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your Enphase systems and monitor energy production
        </p>
      </div>

      <OAuthNotification />

      <EnphaseSettings
        user={fullUser}
        initialStatus={enphaseStatus}
      />
    </div>
  )
}