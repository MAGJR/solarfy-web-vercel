'use client'

import { useState } from 'react'

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

interface IntegrationStatusProps {
  user: User
  status: EnphaseStatus
  onUpdate: () => void
}

export default function IntegrationStatus({ user, status }: IntegrationStatusProps) {
  const [isRevoking, setIsRevoking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStatusColor = () => {
    switch (status.status) {
      case 'authorized':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'revoked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case 'authorized':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'expired':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'revoked':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getStatusText = () => {
    switch (status.status) {
      case 'authorized':
        return 'Connected'
      case 'expired':
        return 'Connection Expired'
      case 'revoked':
        return 'Connection Revoked'
      default:
        return 'Not Connected'
    }
  }

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke access to Enphase? This will disconnect all systems.')) {
      return
    }

    setIsRevoking(true)
    setError(null)

    try {
      const { revokeTenantAuthorization } = await import('../actions')
      const result = await revokeTenantAuthorization(user.tenantId!)

      if (!result.success) {
        throw new Error(result.error || 'Failed to revoke authorization')
      }

      // Recarregar página para mostrar novo status
      window.location.reload()

    } catch (error) {
      console.error('Revoke authorization error:', error)
      setError(error instanceof Error ? error.message : 'Failed to revoke authorization')
      setIsRevoking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-2 rounded-full ${getStatusColor()}`}>
                {getStatusIcon()}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-foreground">
                  Enphase Integration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Status: <span className="font-medium">{getStatusText()}</span>
                </p>
              </div>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {status.status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Connection Details
          </h3>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Tenant ID</dt>
              <dd className="mt-1 text-sm text-foreground font-mono">{status.tenantId}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">Connected Systems</dt>
              <dd className="mt-1 text-sm text-foreground">
                {status.systemIds.length > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {status.systemIds.length} system{status.systemIds.length !== 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-gray-500">No systems connected</span>
                )}
              </dd>
            </div>

            {status.authorizedAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Authorized At</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(status.authorizedAt).toLocaleDateString()} at{' '}
                  {new Date(status.authorizedAt).toLocaleTimeString()}
                </dd>
              </div>
            )}

            {status.lastRefresh && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Refresh</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {new Date(status.lastRefresh).toLocaleDateString()} at{' '}
                  {new Date(status.lastRefresh).toLocaleTimeString()}
                </dd>
              </div>
            )}

            {status.metadata?.companyName && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                <dd className="mt-1 text-sm text-foreground">{status.metadata.companyName}</dd>
              </div>
            )}

            {status.metadata?.adminEmail && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Admin Email</dt>
                <dd className="mt-1 text-sm text-foreground">{status.metadata.adminEmail}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Connected Systems */}
      {status.systemIds.length > 0 && (
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
              Connected Systems
            </h3>

            <div className="space-y-3">
              {status.systemIds.map((systemId) => (
                <div key={systemId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground">System {systemId}</p>
                      <p className="text-xs text-muted-foreground">Active and monitoring</p>
                    </div>
                  </div>
                  <button
                    className="text-sm text-violet-600 hover:text-violet-500 font-medium"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Capabilities */}
      {status.capabilities.length > 0 && (
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
              Available Capabilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {status.capabilities.map((capability) => (
                <div key={capability} className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-foreground capitalize">
                    {capability.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Actions
          </h3>

          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-950 border border-red-800 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Test Connection
              </button>

              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Refresh Data
              </button>

              {status.status === 'authorized' && (
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={isRevoking}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRevoking ? 'Revoking...' : 'Revoke Access'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}