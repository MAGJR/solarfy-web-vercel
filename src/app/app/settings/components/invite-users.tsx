'use client'

import { useState, useEffect } from 'react'
import { inviteUser, getPendingInvitations, cancelInvitation, resendInvitation } from '../actions'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  tenantId: string | null
  createdAt: string
  status: 'active' | 'inactive'
}

interface InviteFormData {
  email: string
  role: 'ADMIN' | 'MANAGER' | 'SALES_REP' | 'TECHNICIAN' | 'VIEWER'
  message: string
}

interface InvitedUser {
  id: string
  email: string
  role: string
  invitedAt: string
  expiresAt: string
  invitedBy: string
  message?: string
  status: 'pending' | 'accepted' | 'expired'
}

interface InviteUsersProps {
  user: User
}

export default function InviteUsers({ user }: InviteUsersProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([])
  const [formData, setFormData] = useState<InviteFormData>({
    email: '',
    role: 'VIEWER',
    message: ''
  })

  // Carregar convites pendentes
  const loadInvitations = async () => {
    try {
      const result = await getPendingInvitations()
      if (result.success) {
        setInvitedUsers(result.invitations?.map(inv => ({
          ...inv,
          message: inv.message || undefined
        })) || [])
      }
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInvitations()
  }, [])

  // Ações nos convites
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const result = await cancelInvitation(invitationId)
      if (result.success) {
        await loadInvitations() // Recarregar lista
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const result = await resendInvitation(invitationId)
      if (result.success) {
        // Opcional: mostrar mensagem de sucesso
      }
    } catch (error) {
      console.error('Error resending invitation:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await inviteUser(formData)

      if (result.success) {
        setSubmitStatus('success')
        setErrorMessage('')
        setFormData({ email: '', role: 'VIEWER', message: '' })
        await loadInvitations() // Recarregar lista de convites
        setTimeout(() => setSubmitStatus(null), 3000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to send invitation. Please check the email address and try again.')
        setTimeout(() => {
          setSubmitStatus(null)
          setErrorMessage('')
        }, 5000)
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('An unexpected error occurred. Please try again.')
      setTimeout(() => {
        setSubmitStatus(null)
        setErrorMessage('')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof InviteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getStatusBadge = (status: string, expiresAt: string) => {
    // Verificar se o convite expirou
    const isExpired = new Date(expiresAt) < new Date()
    const actualStatus = isExpired ? 'expired' : status

    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[actualStatus as keyof typeof statusStyles]}`}>
        {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
        {isExpired && ' (Expired)'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Invite New User
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                    placeholder="colleague@company.com"
                  />
                </div>
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="role" className="block text-sm font-medium text-foreground">
                  Role
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                  >
                    <option value="VIEWER">Viewer - Read only access</option>
                    <option value="TECHNICIAN">Technician - Can manage installations</option>
                    <option value="SALES_REP">Sales Rep - Can manage customers and proposals</option>
                    <option value="MANAGER">Manager - Full access to team operations</option>
                    <option value="ADMIN">Admin - Full system access</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-1">
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">
                    The user will receive an email with instructions to join your team.
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  Personal Message (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    name="message"
                    id="message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="shadow-sm focus:ring-violet-500 focus:border-violet-500 block w-full sm:text-sm border-border rounded-md p-2 bg-background text-foreground"
                    placeholder="Add a personal note to the invitation..."
                  />
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="rounded-md bg-emerald-950 border border-emerald-800 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-emerald-300">
                      Invitation sent successfully to {formData.email}!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="rounded-md bg-red-950 border border-red-800 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-300">
                      {errorMessage || 'Failed to send invitation. Please check the email address and try again.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.email}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Pending Invitations
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading invitations...</p>
            </div>
          ) : invitedUsers.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">No pending invitations</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                When you invite new users, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Invited By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Invited
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {invitedUsers.map((invitedUser) => (
                    <tr key={invitedUser.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{invitedUser.email}</div>
                        {invitedUser.message && (
                          <div className="text-xs text-muted-foreground italic">"{invitedUser.message}"</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {invitedUser.role.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {invitedUser.invitedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(invitedUser.invitedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invitedUser.status, invitedUser.expiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {invitedUser.status === 'pending' && new Date(invitedUser.expiresAt) > new Date() && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleResendInvitation(invitedUser.id)}
                              className="text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelInvitation(invitedUser.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}