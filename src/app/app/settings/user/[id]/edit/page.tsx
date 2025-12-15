'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Badge } from '@/presentation/components/ui/badge'
import { Checkbox } from '@/presentation/components/ui/checkbox'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Settings,
  Activity,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react'
import { UserRole, UserStatus, Permission } from '@/domains/users/entities/user.entity'
import { getUserById, updateUser, type UpdateUserFormData } from '../../actions'

interface UserEditState {
  errors?: {
    name?: string[]
    phone?: string[]
    role?: string[]
    status?: string[]
    permissions?: string[]
    _form?: string[]
  }
  message?: string | null
  success?: boolean
  data?: any
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<UpdateUserFormData>({
    name: '',
    phone: '',
    role: '',
    status: '',
    permissions: []
  })

  useEffect(() => {
    if (userId) {
      loadUser()
    }
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      const result = await getUserById(userId)

      if (result.success && result.data) {
        const userData = result.data
        setUser(userData)
        setFormData({
          name: userData.name,
          phone: userData.phone || '',
          role: userData.role,
          status: userData.status,
          permissions: userData.permissions
        })
      } else {
        toast.error(result.error || 'Error loading user')
        router.push('/app/settings/user')
      }
    } catch (error) {
      console.error('Error loading user:', error)
      toast.error('Error loading user')
      router.push('/app/settings/user')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof UpdateUserFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.name?.trim()) {
      errors.push('Name is required')
    }

    if (!formData.role) {
      errors.push('Role is required')
    }

    if (!formData.status) {
      errors.push('Status is required')
    }

    if (!formData.permissions || formData.permissions.length === 0) {
      errors.push('At least one permission is required')
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateUser(userId, formData)

      if (result.success) {
        toast.success(result.message || 'User updated successfully!')
        // Update local user data
        if (result.data) {
          setUser(result.data)
        }
      } else {
        toast.error(result.error || 'Error updating user')
      }
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error('Error updating user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    const roleColors = {
      [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.MANAGER]: 'bg-blue-100 text-blue-800',
      [UserRole.SALES_REP]: 'bg-green-100 text-green-800',
      [UserRole.TECHNICIAN]: 'bg-yellow-100 text-yellow-800',
      [UserRole.VIEWER]: 'bg-gray-100 text-gray-800'
    }
    return roleColors[role as UserRole] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      [UserStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [UserStatus.INACTIVE]: 'bg-red-100 text-red-800',
      [UserStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [UserStatus.SUSPENDED]: 'bg-orange-100 text-orange-800'
    }
    return statusColors[status as UserStatus] || 'bg-gray-100 text-gray-800'
  }

  const getPermissionDescription = (permission: Permission): string => {
    const descriptions: Record<Permission, string> = {
      [Permission.CREATE_USER]: 'Create new users',
      [Permission.READ_USERS]: 'View user information',
      [Permission.UPDATE_USER]: 'Modify user details',
      [Permission.DELETE_USER]: 'Remove users',
      [Permission.INVITE_USER]: 'Send user invitations',
      [Permission.CREATE_CUSTOMER]: 'Create customer records',
      [Permission.READ_CUSTOMERS]: 'View customer information',
      [Permission.UPDATE_CUSTOMER]: 'Modify customer details',
      [Permission.DELETE_CUSTOMER]: 'Remove customers',
      [Permission.CREATE_PROJECT]: 'Create new projects',
      [Permission.READ_PROJECTS]: 'View project information',
      [Permission.UPDATE_PROJECT]: 'Modify project details',
      [Permission.DELETE_PROJECT]: 'Remove projects',
      [Permission.CREATE_PROJECT_REQUEST]: 'Create project requests',
      [Permission.READ_PROJECT_REQUESTS]: 'View project requests',
      [Permission.UPDATE_PROJECT_REQUEST]: 'Modify project requests',
      [Permission.DELETE_PROJECT_REQUEST]: 'Remove project requests',
      [Permission.MANAGE_PROJECT_REQUESTS]: 'Manage all project requests',
      [Permission.CREATE_EQUIPMENT]: 'Create equipment records',
      [Permission.READ_EQUIPMENT]: 'View equipment information',
      [Permission.UPDATE_EQUIPMENT]: 'Modify equipment details',
      [Permission.DELETE_EQUIPMENT]: 'Remove equipment',
      [Permission.VIEW_ANALYTICS]: 'View analytics and reports',
      [Permission.EXPORT_REPORTS]: 'Export data and reports',
      [Permission.MANAGE_TENANT]: 'Manage tenant settings',
      [Permission.MANAGE_PERMISSIONS]: 'Manage user permissions'
    }
    return descriptions[permission] || permission
  }

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    if (checked) {
      updateFormData('permissions', [...(formData.permissions || []), permission])
    } else {
      updateFormData('permissions', (formData.permissions || []).filter(p => p !== permission))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-muted-foreground mb-4">The user you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/app/settings/user')}>
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-6 space-y-6">
      {/* Settings Navigation Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <a
            href="/app/settings/user"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
            <p className="text-muted-foreground">Update {user.name}'s information and permissions</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(formData.status)}>
              {formData.status.replace('_', ' ')}
            </Badge>
            <Badge className={getRoleColor(formData.role)}>
              {formData.role.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update user's personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Enter user's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="pl-10 bg-muted"
                      placeholder="user@example.com"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role and Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Role & Status
                </CardTitle>
                <CardDescription>
                  Manage user's role and account status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">User Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => updateFormData("role", value as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.VIEWER}>
                        <Badge className="bg-gray-100 text-gray-800 mr-2">Viewer</Badge>
                        Read-only access
                      </SelectItem>
                      <SelectItem value={UserRole.TECHNICIAN}>
                        <Badge className="bg-yellow-100 text-yellow-800 mr-2">Technician</Badge>
                        Technical operations
                      </SelectItem>
                      <SelectItem value={UserRole.SALES_REP}>
                        <Badge className="bg-green-100 text-green-800 mr-2">Sales Rep</Badge>
                        Sales and customer management
                      </SelectItem>
                      <SelectItem value={UserRole.MANAGER}>
                        <Badge className="bg-blue-100 text-blue-800 mr-2">Manager</Badge>
                        Team and operations management
                      </SelectItem>
                      <SelectItem value={UserRole.ADMIN}>
                        <Badge className="bg-purple-100 text-purple-800 mr-2">Admin</Badge>
                        Full system access
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Account Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateFormData("status", value as UserStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserStatus.ACTIVE}>
                        <Badge className="bg-green-100 text-green-800 mr-2 flex items-center">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                        User can access the system
                      </SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>
                        <Badge className="bg-red-100 text-red-800 mr-2 flex items-center">
                          <UserX className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                        User cannot access the system
                      </SelectItem>
                      <SelectItem value={UserStatus.PENDING}>
                        <Badge className="bg-yellow-100 text-yellow-800 mr-2">Pending</Badge>
                        User activation pending
                      </SelectItem>
                      <SelectItem value={UserStatus.SUSPENDED}>
                        <Badge className="bg-orange-100 text-orange-800 mr-2">Suspended</Badge>
                        User temporarily suspended
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Account Information</Label>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-600" />
                Permissions
              </CardTitle>
              <CardDescription>
                Manage user permissions for different system features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User Management
                  </h4>
                  <div className="space-y-2">
                    {[
                      Permission.CREATE_USER,
                      Permission.READ_USERS,
                      Permission.UPDATE_USER,
                      Permission.DELETE_USER,
                      Permission.INVITE_USER
                    ].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission) || false}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {getPermissionDescription(permission)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Customer Management</h4>
                  <div className="space-y-2">
                    {[
                      Permission.CREATE_CUSTOMER,
                      Permission.READ_CUSTOMERS,
                      Permission.UPDATE_CUSTOMER,
                      Permission.DELETE_CUSTOMER
                    ].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission) || false}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {getPermissionDescription(permission)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Project Management</h4>
                  <div className="space-y-2">
                    {[
                      Permission.CREATE_PROJECT,
                      Permission.READ_PROJECTS,
                      Permission.UPDATE_PROJECT,
                      Permission.DELETE_PROJECT,
                      Permission.CREATE_PROJECT_REQUEST,
                      Permission.READ_PROJECT_REQUESTS,
                      Permission.UPDATE_PROJECT_REQUEST,
                      Permission.DELETE_PROJECT_REQUEST,
                      Permission.MANAGE_PROJECT_REQUESTS
                    ].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission) || false}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {getPermissionDescription(permission)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Equipment Management</h4>
                  <div className="space-y-2">
                    {[
                      Permission.CREATE_EQUIPMENT,
                      Permission.READ_EQUIPMENT,
                      Permission.UPDATE_EQUIPMENT,
                      Permission.DELETE_EQUIPMENT
                    ].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission) || false}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {getPermissionDescription(permission)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Analytics & Reports</h4>
                  <div className="space-y-2">
                    {[
                      Permission.VIEW_ANALYTICS,
                      Permission.EXPORT_REPORTS
                    ].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission) || false}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {getPermissionDescription(permission)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">System</h4>
                  <div className="space-y-2">
                    {[
                      Permission.MANAGE_TENANT,
                      Permission.MANAGE_PERMISSIONS
                    ].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={formData.permissions?.includes(permission) || false}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {getPermissionDescription(permission)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/app/settings/user')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}