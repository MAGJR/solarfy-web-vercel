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

interface OAuthFlowProps {
  user: User
  onSuccess: () => void
}

export default function OAuthFlow({ user, onSuccess }: OAuthFlowProps) {
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuthorizeClick = async () => {
    setError(null)
    setIsAuthorizing(true)

    try {
      const tenantId = user.tenantId

      if (!tenantId) {
        setError('User tenant information is missing.')
        setIsAuthorizing(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_ENPHASE_API_URL}/api/v1/enphase/oauth/authorize?tenantId=${tenantId}&systemId=default`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate authorization URL')
      }

      window.location.href = data.data.authorizationUrl

    } catch (error) {
      console.error('OAuth authorization error:', error)
      setError(error instanceof Error ? error.message : 'Failed to start authorization')
      setIsAuthorizing(false)
    }
  }

  return (
    <div className="space-y-6">
      {process.env.NEXT_PUBLIC_ENPHASE_API_URL ? (
        <div className="bg-card border border-border rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
              Authorization Details
            </h3>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Account Information</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground">Account:</dt>
                    <dd className="text-foreground">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Tenant:</dt>
                    <dd className="text-foreground">{user.tenantId}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground">Permissions:</dt>
                    <dd className="text-foreground">
                      Read system status, inventory, and energy production data
                    </dd>
                  </div>
                </dl>
              </div>

              {error && (
                <div className="rounded-md bg-red-950 border border-red-800 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleAuthorizeClick}
                  disabled={isAuthorizing}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthorizing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Authorize with Enphase
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Configuration Required</h3>
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                <p>
                  <strong>For administrators:</strong> Please configure the Enphase API URL in the environment variables:
                </p>
                <code className="mt-2 block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                  NEXT_PUBLIC_ENPHASE_API_URL=http://localhost:3005
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}