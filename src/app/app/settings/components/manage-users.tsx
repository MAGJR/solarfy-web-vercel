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

interface ManageUsersProps {
  user: User
}

export default function ManageUsers({ user }: ManageUsersProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // TODO: Implement API call to fetch users
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@solarfy.com',
          role: 'ADMIN',
          createdAt: '2024-01-01T00:00:00Z',
          tenantId: '1',
          status: 'active',
                  },
        {
          id: '2',
          name: 'John Manager',
          email: 'john@solarfy.com',
          role: 'MANAGER',
          createdAt: '2024-01-05T00:00:00Z',
          tenantId: '1',
          status: 'active',
                  },
        {
          id: '3',
          name: 'Jane Sales',
          email: 'jane@solarfy.com',
          role: 'SALES_REP',
          createdAt: '2024-01-10T00:00:00Z',
          tenantId: '1',
          status: 'active',
                  },
        {
          id: '4',
          name: 'Bob Tech',
          email: 'bob@solarfy.com',
          role: 'TECHNICIAN',
          createdAt: '2024-01-12T00:00:00Z',
          tenantId: '1',
          status: 'inactive',
                  }
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(true)
    setStatusMessage(null)

    try {
      // TODO: Implement API call to update user role
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      )

      setStatusMessage({ type: 'success', text: 'User role updated successfully!' })
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Failed to update user role.' })
      setTimeout(() => setStatusMessage(null), 3000)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}? This action cannot be undone.`)) {
      return
    }

    setIsUpdating(true)
    setStatusMessage(null)

    try {
      // TODO: Implement API call to delete user
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setUsers(prev => prev.filter(user => user.id !== userId))
      setStatusMessage({ type: 'success', text: 'User deleted successfully!' })
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Failed to delete user.' })
      setTimeout(() => setStatusMessage(null), 3000)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusToggle = async (userId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    setIsUpdating(true)

    try {
      // TODO: Implement API call to update user status
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      )

      setStatusMessage({ type: 'success', text: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!` })
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Failed to update user status.' })
      setTimeout(() => setStatusMessage(null), 3000)
    } finally {
      setIsUpdating(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      ADMIN: 'bg-purple-100 text-purple-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      SALES_REP: 'bg-green-100 text-green-800',
      TECHNICIAN: 'bg-yellow-100 text-yellow-800',
      VIEWER: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyles[role as keyof typeof roleStyles]}`}>
        {role.replace('_', ' ')}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {statusMessage && (
        <div className={`rounded-md p-4 ${
          statusMessage.type === 'success' ? 'bg-emerald-950 border border-emerald-800' : 'bg-red-950 border border-red-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {statusMessage.type === 'success' ? (
                <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                statusMessage.type === 'success' ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {statusMessage.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-lg leading-6 font-medium text-foreground">
                Team Members
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A list of all users in your company including their role and status.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                onClick={() => {
                  // This would normally be handled by the parent layout
                  window.location.href = '/app/settings/invite'
                }}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors"
              >
                Invite User
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-border ring-opacity-20 md:rounded-lg">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-foreground sm:pl-6">
                            User
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                            Role
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                            Joined
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                            Last Login
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {users.map((userItem) => (
                          <tr key={userItem.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-sm font-medium text-foreground">
                                      {userItem.name?.charAt(0) || userItem.email.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-foreground">
                                    {userItem.name || 'No Name'}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {userItem.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              {userItem.id === user.id ? (
                                <div className="flex items-center">
                                  {getRoleBadge(userItem.role)}
                                  <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                                </div>
                              ) : (
                                <select
                                  value={userItem.role}
                                  onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                                  disabled={isUpdating || userItem.id === user.id}
                                  className="text-sm border-border rounded-md p-1 bg-background text-foreground border"
                                >
                                  <option value="VIEWER">Viewer</option>
                                  <option value="TECHNICIAN">Technician</option>
                                  <option value="SALES_REP">Sales Rep</option>
                                  <option value="MANAGER">Manager</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              {getStatusBadge(userItem.status)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                              {new Date(userItem.createdAt).toLocaleDateString()}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              {userItem.id !== user.id && (
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleStatusToggle(userItem.id, userItem.status === 'active' ? 'inactive' : 'active')}
                                    disabled={isUpdating}
                                    className="text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors"
                                  >
                                    {userItem.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <span className="text-muted-foreground">|</span>
                                  <button
                                    onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                                    disabled={isUpdating}
                                    className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}