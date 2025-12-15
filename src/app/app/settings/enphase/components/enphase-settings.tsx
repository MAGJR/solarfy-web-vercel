'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IntegrationStatus from './integration-status'
import OAuthFlow from './oauth-flow'
import SystemManagement from './system-management'
import TeamPermissions from './team-permissions'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  tenantId: string | null
  createdAt: string
  status: 'active' | 'inactive'
}

interface EnphaseStatus {
  tenantId: string
  status: 'not_authorized' | 'authorized' | 'expired' | 'revoked'
  systemIds: string[]
  authorizedAt?: string
  lastRefresh?: string
  metadata?: {
    companyName?: string
    adminEmail?: string
    permissions?: string[]
  }
  capabilities: string[]
}

interface EnphaseSettingsProps {
  user: User
  initialStatus?: EnphaseStatus | null
}

export default function EnphaseSettings({ user, initialStatus }: EnphaseSettingsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'status' | 'systems' | 'permissions'>('status')
  const [enphaseStatus, setEnphaseStatus] = useState<EnphaseStatus | null>(initialStatus || null)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Forçar refresh de componentes

  const handleOAuthSuccess = async (tenantId: string) => {
    setIsLoading(true)
    try {
      // Recarregar status após OAuth bem-sucedido
      const { getTenantEnphaseStatus } = await import('../actions')
      const result = await getTenantEnphaseStatus(tenantId)

      if (result.success) {
        setEnphaseStatus(result.data)
        setRefreshKey(prev => prev + 1) // Forçar refresh dos componentes
      }
    } catch (error) {
      console.error('Error refreshing status after OAuth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  
  const handleSystemRemoved = (systemId: string) => {
    if (enphaseStatus) {
      setEnphaseStatus({
        ...enphaseStatus,
        systemIds: enphaseStatus.systemIds.filter(id => id !== systemId)
      })
    }
  }

  const isAuthorized = enphaseStatus?.status === 'authorized'
  const hasSystems = enphaseStatus?.systemIds && enphaseStatus.systemIds.length > 0

  if (!user.tenantId) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.82 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Tenant Not Available
          </h3>
          <p className="text-sm text-muted-foreground">
            You need to be associated with a tenant to configure Enphase integration.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="flex items-center space-x-4 pb-4">
        <div className="flex-shrink-0">
          <img
            src="/enphaseLogo.png"
            alt="Enphase"
            className="h-10 w-auto object-contain"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Enphase Integration</h1>
          <p className="text-sm text-muted-foreground">
            Manage your Enphase system monitoring and integration settings
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'status'
                ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            Integration Status
          </button>

          {isAuthorized && (
            <button
              onClick={() => setActiveTab('systems')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'systems'
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Systems ({enphaseStatus?.systemIds.length || 0})
            </button>
          )}

          {isAuthorized && hasSystems && (
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'permissions'
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              Team Permissions
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-64">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {activeTab === 'status' && (
              <div key={`status-${refreshKey}`} className="space-y-6">
                {!isAuthorized ? (
                  <OAuthFlow
                    user={user}
                    onSuccess={() => handleOAuthSuccess(user.tenantId!)}
                  />
                ) : (
                  <IntegrationStatus
                    user={user}
                    status={enphaseStatus!}
                    onUpdate={handleStatusUpdate}
                  />
                )}
              </div>
            )}

            {activeTab === 'systems' && isAuthorized && (
              <SystemManagement
                key={`systems-${refreshKey}`}
                user={user}
                initialStatus={enphaseStatus!}
                onSystemRemoved={handleSystemRemoved}
              />
            )}

            {activeTab === 'permissions' && isAuthorized && hasSystems && (
              <TeamPermissions
                key={`permissions-${refreshKey}`}
                user={user}
                tenantId={user.tenantId!}
                availableSystems={enphaseStatus!.systemIds}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}