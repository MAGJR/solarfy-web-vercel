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

interface SystemManagementProps {
  user: User
  initialStatus: EnphaseStatus
  onSystemRemoved: (systemId: string) => void
}

export default function SystemManagement({ user, initialStatus, onSystemRemoved }: SystemManagementProps) {
  const [systems, setSystems] = useState<string[]>(initialStatus.systemIds)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRemoveSystem = async (systemId: string) => {
    if (!confirm(`Are you sure you want to remove system ${systemId}? This will stop monitoring for this system.`)) {
      return
    }

    setIsRemoving(systemId)
    setError(null)

    try {
      const { removeSystemFromTenant } = await import('../actions')
      const result = await removeSystemFromTenant(user.tenantId!, systemId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove system')
      }

      setSystems(prev => prev.filter(id => id !== systemId))
      onSystemRemoved(systemId)

    } catch (error) {
      console.error('Remove system error:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove system')
    } finally {
      setIsRemoving(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">System Management</h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Enphase systems are now managed directly when creating monitoring projects.
                System IDs should be entered in the monitoring form to associate them with specific projects.
              </p>
              <p className="mt-1">
                This section shows systems that are currently connected through your Enphase OAuth authorization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Systems */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-foreground">
              Connected Systems ({systems.length})
            </h3>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {systems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No systems connected</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding your first Enphase system above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {systems.map((systemId) => (
                <div key={systemId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        System {systemId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Connected and monitoring
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleRemoveSystem(systemId)}
                      disabled={isRemoving === systemId}
                      className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
                    >
                      {isRemoving === systemId ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Statistics */}
      {systems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Systems</p>
                <p className="text-2xl font-semibold text-foreground">{systems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20">
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Systems</p>
                <p className="text-2xl font-semibold text-foreground">{systems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                  <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Last Sync</p>
                <p className="text-2xl font-semibold text-foreground">Now</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}