'use client'

import { useState, useEffect } from 'react'
import { useUserRole } from '@/hooks/use-user-role'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/presentation/components/app/dashboard-layout'
import SettingsNavigation from '@/presentation/components/app/components/settings-navigation'
import { getUsers, updateUserRole, toggleUserStatus, deleteUser } from './actions'
import { UserRole, UserStatus } from '@/domains/users/entities/user.entity'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  lastLogin?: string
  status: 'active' | 'inactive'
}

export default function ManageUsers() {
  const { user, isLoading } = useUserRole()
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'company' | 'invite' | 'users' | 'profile' | 'billing'>('users')

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') {
      redirect('/app')
    }
  }, [user, isLoading, redirect])

  useEffect(() => {
    fetchUsers()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

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
          lastLogin: '2024-01-20T10:30:00Z',
          status: 'active'
        },
        {
          id: '2',
          name: 'John Manager',
          email: 'john@solarfy.com',
          role: 'MANAGER',
          createdAt: '2024-01-05T00:00:00Z',
          lastLogin: '2024-01-19T15:45:00Z',
          status: 'active'
        },
        {
          id: '3',
          name: 'Jane Sales',
          email: 'jane@solarfy.com',
          role: 'SALES_REP',
          createdAt: '2024-01-10T00:00:00Z',
          lastLogin: '2024-01-18T09:20:00Z',
          status: 'active'
        },
        {
          id: '4',
          name: 'Bob Tech',
          email: 'bob@solarfy.com',
          role: 'TECHNICIAN',
          createdAt: '2024-01-12T00:00:00Z',
          lastLogin: '2024-01-15T14:10:00Z',
          status: 'inactive'
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
      setSelectedUser(null)
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
    <DashboardLayout>
      <SettingsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
        {/* Status Message */}
        {statusMessage && (
          <div className={`rounded-md p-4 ${
            statusMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {statusMessage.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
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
                  statusMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {statusMessage.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Team Members
                </h3>
                <p className="mt-2 text-sm text-gray-700">
                  A list of all users in your company including their role and status.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <a
                  href="/app/settings/invite"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Invite User
                </a>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              User
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Role
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Status
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Joined
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Last Login
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {users.map((userItem) => (
                            <tr key={userItem.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-sm font-medium text-gray-700">
                                        {userItem.name?.charAt(0) || userItem.email.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {userItem.name || 'No Name'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {userItem.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                {userItem.id === user.id ? (
                                  <div className="flex items-center">
                                    {getRoleBadge(userItem.role)}
                                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                                  </div>
                                ) : (
                                  <select
                                    value={userItem.role}
                                    onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                                    disabled={isUpdating || userItem.id === user.id}
                                    className="text-sm border-gray-300 rounded-md p-1 border"
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
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {new Date(userItem.createdAt).toLocaleDateString()}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {userItem.lastLogin
                                  ? new Date(userItem.lastLogin).toLocaleDateString()
                                  : 'Never'
                                }
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <div className="flex items-center justify-end space-x-2">
                                  <a
                                    href={`/app/settings/user/${userItem.id}/edit`}
                                    className="text-violet-600 hover:text-violet-900"
                                  >
                                    Edit
                                  </a>
                                  <span className="text-gray-300">|</span>
                                  {userItem.id !== user.id ? (
                                    <>
                                      <button
                                        onClick={() => handleStatusToggle(userItem.id, userItem.status)}
                                        disabled={isUpdating}
                                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                      >
                                        {userItem.status === 'active' ? 'Deactivate' : 'Activate'}
                                      </button>
                                      <span className="text-gray-300">|</span>
                                      <button
                                        onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                                        disabled={isUpdating}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-gray-400 text-xs">Your account</span>
                                  )}
                                </div>
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
      </div>
    </DashboardLayout>
  )
}