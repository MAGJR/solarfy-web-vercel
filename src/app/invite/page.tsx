'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Alert, AlertDescription } from '@/presentation/components/ui/alert'
import { Loader2, Mail, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

function InviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [invitation, setInvitation] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'accepted'>('loading')
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setLoading(false)
      return
    }

    validateInvitation()
  }, [token])

  const validateInvitation = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/invitations/validate?token=${token}`)
      const data = await response.json()

      if (!response.ok) {
        setStatus(data.status === 'expired' ? 'expired' : 'invalid')
        return
      }

      setInvitation(data.invitation)
      setStatus(data.invitation.status === 'ACCEPTED' ? 'accepted' : 'valid')

    } catch (error) {
      console.error('Error validating invitation:', error)
      setStatus('invalid')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setRegistering(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setErrors(['Passwords do not match'])
        setRegistering(false)
        return
      }

      if (formData.password.length < 8) {
        setErrors(['Password must be at least 8 characters'])
        setRegistering(false)
        return
      }

      if (!formData.name.trim()) {
        setErrors(['Name is required'])
        setRegistering(false)
        return
      }

      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          name: formData.name.trim(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors([data.error || 'Failed to create account'])
        setRegistering(false)
        return
      }

      // Account created successfully, redirect to login
      router.push('/login?message=account-created-successfully')

    } catch (error) {
      console.error('Error accepting invitation:', error)
      setErrors(['Failed to create account. Please try again.'])
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600 mb-4" />
            <p className="text-gray-600">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'invalid' || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 text-center">
              This invitation link is not valid or has been cancelled.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Expired</h2>
            <p className="text-gray-600 text-center">
              This invitation has expired. Please contact your administrator for a new invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Accepted</h2>
            <p className="text-gray-600 text-center mb-4">
              This invitation has already been accepted.
            </p>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-violet-600" />
          </div>
          <CardTitle className="text-xl">Join {invitation?.tenant?.name || 'the Team'}</CardTitle>
          <CardDescription>
            You've been invited to join as a <strong>{invitation?.role?.toLowerCase()}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <p className="text-sm text-gray-900 mt-1">{invitation?.email}</p>
            </div>

            {invitation?.message && (
              <div className="bg-blue-50 p-3 rounded-md">
                <Label className="text-sm font-medium text-blue-700">Message from inviter</Label>
                <p className="text-sm text-blue-900 mt-1">{invitation.message}</p>
              </div>
            )}

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Create a password (min. 8 characters)"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                required
              />
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={registering}
            >
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account & Join Team'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    }>
      <InviteContent />
    </Suspense>
  )
}