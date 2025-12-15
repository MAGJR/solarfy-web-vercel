'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  tenantId: string | null
  createdAt: string
  status: 'active' | 'inactive'
}

interface TeamMember {
  id: string
  name: string | null
  email: string
  role: string
}

interface Delegation {
  userId: string
  systemId: string
  permissions: string[]
  delegatedBy: string
  delegatedAt: string
  expiresAt?: string
  userName?: string
}

interface TeamPermissionsProps {
  user: User
  tenantId: string
  availableSystems: string[]
}

export default function TeamPermissions({ user, tenantId, availableSystems }: TeamPermissionsProps) {
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedSystemId, setSelectedSystemId] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar delegações existentes
      const { getTenantDelegations } = await import('../actions')
      const delegationsResult = await getTenantDelegations(tenantId)

      if (delegationsResult.success) {
        // Simular dados de delegações (em implementação real viria da API)
        const mockDelegations: Delegation[] = [
          {
            userId: 'user1',
            systemId: availableSystems[0] || '12345',
            permissions: ['read_system', 'read_inventory'],
            delegatedBy: user.id,
            delegatedAt: new Date().toISOString(),
            userName: 'John Doe'
          }
        ]
        setDelegations(mockDelegations)
      }

      // Simular dados de team members (em implementação real viria da API)
      const mockTeamMembers: TeamMember[] = [
        { id: 'user1', name: 'John Doe', email: 'john@example.com', role: 'TECHNICIAN' },
        { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'MANAGER' },
        { id: 'user3', name: 'Bob Wilson', email: 'bob@example.com', role: 'VIEWER' }
      ]
      setTeamMembers(mockTeamMembers)

    } catch (error) {
      console.error('Error loading permissions data:', error)
      setError('Failed to load permissions data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDelegation = async () => {
    if (!selectedUserId || !selectedSystemId || selectedPermissions.length === 0) {
      setError('Please fill all required fields')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const { delegateSystemAccess } = await import('../actions')
      const result = await delegateSystemAccess(
        tenantId,
        selectedUserId,
        selectedSystemId,
        selectedPermissions,
        user.id,
        expiresAt || undefined
      )

      if (!result.success) {
        throw new Error(result.error || 'Failed to create delegation')
      }

      // Adicionar nova delegação à lista
      const selectedUser = teamMembers.find(m => m.id === selectedUserId)
      const newDelegation: Delegation = {
        userId: selectedUserId,
        systemId: selectedSystemId,
        permissions: selectedPermissions,
        delegatedBy: user.id,
        delegatedAt: new Date().toISOString(),
        expiresAt: expiresAt || undefined,
        userName: selectedUser?.name || selectedUser?.email
      }
      setDelegations(prev => [...prev, newDelegation])

      // Reset form
      setSelectedUserId('')
      setSelectedSystemId('')
      setSelectedPermissions([])
      setExpiresAt('')

    } catch (error) {
      console.error('Create delegation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create delegation')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRevokeDelegation = async (userId: string, systemId: string) => {
    if (!confirm('Are you sure you want to revoke this access delegation?')) {
      return
    }

    setIsRevoking(`${userId}-${systemId}`)
    setError(null)

    try {
      const { revokeTenantAuthorization } = await import('../actions')
      // Em implementação real, usaria função específica para revogar delegação
      // const result = await revokeDelegation(tenantId, userId, systemId)

      // Remover delegação da lista
      setDelegations(prev =>
        prev.filter(d => !(d.userId === userId && d.systemId === systemId))
      )

    } catch (error) {
      console.error('Revoke delegation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to revoke delegation')
    } finally {
      setIsRevoking(null)
    }
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    )
  }

  const availablePermissions = [
    { id: 'read_system', label: 'Read System Status', description: 'View system status and basic information' },
    { id: 'read_inventory', label: 'Read Inventory', description: 'View system equipment and inventory' },
    { id: 'read_meter', label: 'Read Meter Data', description: 'View energy production and consumption data' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create New Delegation */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Grant System Access
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Team Member Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Team Member
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="block w-full shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm border-border rounded-md p-2 bg-background text-foreground"
                  disabled={isCreating}
                >
                  <option value="">Select a team member</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.email} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* System Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  System
                </label>
                <select
                  value={selectedSystemId}
                  onChange={(e) => setSelectedSystemId(e.target.value)}
                  className="block w-full shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm border-border rounded-md p-2 bg-background text-foreground"
                  disabled={isCreating}
                >
                  <option value="">Select a system</option>
                  {availableSystems.map((systemId) => (
                    <option key={systemId} value={systemId}>
                      System {systemId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Permissions Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Permissions
              </label>
              <div className="space-y-2">
                {availablePermissions.map((permission) => (
                  <label key={permission.id} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="mt-1 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                      disabled={isCreating}
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-foreground">{permission.label}</span>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="block w-full shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm border-border rounded-md p-2 bg-background text-foreground"
                disabled={isCreating}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave empty for no expiration
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleCreateDelegation}
                disabled={isCreating || !selectedUserId || !selectedSystemId || selectedPermissions.length === 0}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Granting Access...' : 'Grant Access'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Delegations */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Current Access Delegations ({delegations.length})
          </h3>

          {delegations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No access delegations</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Grant system access to team members using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {delegations.map((delegation) => (
                <div key={`${delegation.userId}-${delegation.systemId}`} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/20">
                        <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {delegation.userName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        System {delegation.systemId} • {delegation.permissions.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Granted on {new Date(delegation.delegatedAt).toLocaleDateString()}
                        {delegation.expiresAt && ` • Expires ${new Date(delegation.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      delegation.expiresAt && new Date(delegation.expiresAt) < new Date()
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {delegation.expiresAt && new Date(delegation.expiresAt) < new Date() ? 'Expired' : 'Active'}
                    </span>
                    <button
                      onClick={() => handleRevokeDelegation(delegation.userId, delegation.systemId)}
                      disabled={isRevoking === `${delegation.userId}-${delegation.systemId}`}
                      className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
                    >
                      {isRevoking === `${delegation.userId}-${delegation.systemId}` ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}