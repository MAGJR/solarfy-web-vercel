'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function OAuthNotification() {
  const searchParams = useSearchParams()
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null
    message: string
    visible: boolean
  }>({ type: null, message: '', visible: false })

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const tenantId = searchParams.get('tenantId')

    if (success === 'true') {
      setNotification({
        type: 'success',
        message: `Enphase authorization completed successfully!${tenantId ? ` Tenant: ${tenantId}` : ''}`,
        visible: true
      })
    } else if (error) {
      const errorMessages: Record<string, string> = {
        'missing_code': 'Authorization code not received',
        'missing_state': 'State parameter not received',
        'invalid_state': 'Invalid state parameter',
        'missing_tenant': 'Tenant ID not found',
        'invalid_session': 'Authorization session expired or invalid',
        'token_exchange_failed': 'Failed to exchange authorization code for tokens',
        'processing_failed': 'An error occurred during OAuth processing',
        'invalid_params': 'Invalid callback parameters',
        'authorization_failed': 'Failed to complete authorization',
        'processing_error': 'An error occurred during authorization'
      }

      const message = errorMessages[error] || `Authorization failed: ${error}`
      setNotification({
        type: 'error',
        message,
        visible: true
      })
    }

    // Auto-hide notification after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }))
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!notification.visible || !notification.type) {
    return null
  }

  return (
    <div className={`rounded-md p-4 mb-6 ${
      notification.type === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    }`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {notification.type === 'success' ? (
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${
            notification.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {notification.message}
          </p>
          <p className={`text-xs mt-1 ${
            notification.type === 'success'
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {notification.type === 'success'
              ? 'Your system can now monitor Enphase energy production data.'
              : 'Please try authorizing again or contact support if the issue persists.'
            }
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                notification.type === 'success'
                  ? 'bg-green-50 text-green-600 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50'
              }`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}