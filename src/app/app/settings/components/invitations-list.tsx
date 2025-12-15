'use client'

import { useState, useEffect } from 'react'

interface Invitation {
  id: string
  email: string
  role: string
  message?: string
  status: string
  createdAt: string
  expiresAt: string
}

export default function InvitationsList() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/invitations/pending')
      const data = await response.json()

      if (data.success) {
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/cancel`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Reload invitations list
        loadInvitations()
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/resend`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('Invitation resent successfully!')
      }
    } catch (error) {
      console.error('Error resending invitation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending invitations</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Pending Invitations</h3>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {invitations.map((invitation) => (
            <li key={invitation.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {invitation.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Role: {invitation.role.toLowerCase()}
                  </p>
                  {invitation.message && (
                    <p className="text-sm text-gray-500 mt-1">
                      "{invitation.message}"
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Sent {new Date(invitation.createdAt).toLocaleDateString()} •
                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleResendInvitation(invitation.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                  >
                    Resend
                  </button>
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}