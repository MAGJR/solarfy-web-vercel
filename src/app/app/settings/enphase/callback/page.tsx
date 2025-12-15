'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Prevent multiple executions
    if (isProcessing) return
    setIsProcessing(true)

    const handleCallback = async () => {
      console.log('🔐 Callback page loaded, checking OAuth flow type...')

      // Check if it's a direct redirect from backend (new optimized flow)
      const success = searchParams.get('success')
      const error = searchParams.get('error')
      const description = searchParams.get('description')
      const tenantId = searchParams.get('tenantId')
      const systemId = searchParams.get('systemId')
      const expiresAt = searchParams.get('expiresAt')

      if (success === 'true') {
        // New optimized flow - backend already processed OAuth
        console.log('✅ Using optimized OAuth flow - backend processed successfully')
        setStatus('success')
        setMessage(`Authorization completed successfully for tenant ${tenantId}`)
        setTimeout(() => {
          router.push('/app/settings/enphase?success=true&tenantId=' + tenantId)
        }, 2000)
        return
      }

      if (error) {
        // Error from backend (new flow) or direct error (old flow)
        console.log('❌ OAuth error received:', { error, description })
        setStatus('error')
        setMessage(`Authorization failed: ${error}${description ? ` - ${description}` : ''}`)
        setTimeout(() => {
          router.push('/app/settings/enphase?error=' + encodeURIComponent(error))
        }, 3000)
        return
      }

      // Old flow - process callback via server actions
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      console.log('📝 Using legacy OAuth flow with callback params:', {
        code: code?.substring(0, 10) + '...',
        state: state?.substring(0, 20) + '...'
      })

      if (!code || !state) {
        setStatus('error')
        setMessage('Invalid callback parameters - missing code or state')
        setTimeout(() => {
          router.push('/app/settings/enphase?error=invalid_params')
        }, 3000)
        return
      }

      try {
        // Decode state to get tenant information
        let stateData = {}
        try {
          stateData = JSON.parse(atob(state))
          console.log('✅ State decoded successfully:', stateData)
        } catch (decodeError) {
          console.error('❌ Failed to decode state:', decodeError)
          setStatus('error')
          setMessage('Invalid state parameter')
          setTimeout(() => {
            router.push('/app/settings/enphase?error=invalid_state')
          }, 3000)
          return
        }

        const { tenantId } = stateData
        if (!tenantId) {
          setStatus('error')
          setMessage('Missing tenant ID in state')
          setTimeout(() => {
            router.push('/app/settings/enphase?error=missing_tenant')
          }, 3000)
          return
        }

        console.log('🔄 [FRONTEND-OAUTH] Using new frontend token exchange approach...')
        const { exchangeTokenFromFrontend } = await import('../actions')
        const result = await exchangeTokenFromFrontend(code, tenantId)

        console.log('📊 [FRONTEND-OAUTH] Token exchange result:', result)

        if (result.success) {
          setStatus('success')
          setMessage('Authorization completed successfully! Tokens have been stored.')
          setTimeout(() => {
            router.push(`/app/settings/enphase?success=true&tenantId=${tenantId}`)
          }, 2000)
        } else {
          setStatus('error')
          setMessage(result.error || 'Failed to complete authorization')
          setTimeout(() => {
            router.push('/app/settings/enphase?error=' + encodeURIComponent(result.error || 'authorization_failed'))
          }, 3000)
        }

      } catch (error) {
        console.error('❌ [FRONTEND-OAUTH] Token exchange error:', error)
        setStatus('error')
        setMessage('An error occurred during authorization')
        setTimeout(() => {
          router.push('/app/settings/enphase?error=processing_error')
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, router, isProcessing])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Completing Authorization
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exchanging authorization code for access tokens...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Authorization Successful!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Redirecting you back...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Authorization Failed
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Redirecting you back...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}