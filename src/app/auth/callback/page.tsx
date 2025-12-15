'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/infrastructure/auth/auth-client.config'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        return
      }

      if (token) {
        // Handle email verification
        try {
          const result = await authClient.verifyEmail({
            query: { token }
          })

          if (result.error) {
            setStatus('error')
            setMessage(result.error.message || 'Email verification failed')
          } else {
            setStatus('success')
            setMessage('Email verified successfully! Redirecting to your dashboard...')

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/app')
            }, 2000)
          }
        } catch (err) {
          setStatus('error')
          setMessage('An error occurred during email verification')
        }
      } else {
        // Handle OAuth callback
        try {
          // The Better-Auth client should handle the OAuth callback automatically
          // Check if we have a session
          const session = await authClient.getSession()

          if (session.data) {
            setStatus('success')
            setMessage('Authentication successful! Redirecting to your dashboard...')

            setTimeout(() => {
              router.push('/app')
            }, 2000)
          } else {
            setStatus('error')
            setMessage('Authentication failed. Please try again.')
          }
        } catch (err) {
          setStatus('error')
          setMessage('An error occurred during authentication')
        }
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="flex justify-center mb-8">
          <span className="text-3xl font-bold text-purple-600">Solarfy</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Verifying your account...
              </h2>
              <p className="text-gray-600">
                Please wait while we complete the authentication process.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Success!
              </h2>
              <p className="text-green-600">
                {message}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-3">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Authentication Failed
              </h2>
              <p className="text-red-600">
                {message}
              </p>
              <div className="pt-4 space-y-2">
                <Link
                  href="/auth/signin"
                  className="block w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>

        {status === 'loading' && (
          <p className="mt-4 text-sm text-gray-500">
            If you're not redirected automatically,{' '}
            <Link href="/auth/signin" className="text-purple-600 hover:text-purple-500">
              click here
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}