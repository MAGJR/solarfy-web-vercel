import { z } from 'zod'
import { UserRole, UserStatus, Permission } from '@/domains/users/entities/user.entity'

// Role validation
const roleSchema = z.nativeEnum(UserRole, {
  errorMap: () => {
    const validRoles = Object.values(UserRole).join(', ')
    return {
      message: `Invalid role. Valid options are: ${validRoles}`,
    }
  },
})

// Status validation
const statusSchema = z.nativeEnum(UserStatus, {
  errorMap: () => {
    const validStatuses = Object.values(UserStatus).join(', ')
    return {
      message: `Invalid status. Valid options are: ${validStatuses}`,
    }
  },
})

// Permission validation
const permissionSchema = z.nativeEnum(Permission, {
  errorMap: () => {
    const validPermissions = Object.values(Permission).join(', ')
    return {
      message: `Invalid permission. Valid options are: ${validPermissions}`,
    }
  },
})

// Base tenant user schema
const baseTenantUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-.,]+$/, 'Name can only contain letters, spaces, and basic punctuation'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .optional(),
  role: roleSchema,
  permissions: z.array(permissionSchema).min(1, 'At least one permission is required'),
  tenantId: z.string()
    .min(1, 'Tenant ID is required')
    .uuid('Invalid tenant ID format'),
  invitedBy: z.string()
    .min(1, 'Invited by user ID is required')
    .uuid('Invalid user ID format'),
})

// Create tenant user schema
export const createTenantUserSchema = baseTenantUserSchema

// Update tenant user schema
export const updateTenantUserSchema = baseTenantUserSchema.omit({
  tenantId: true,
  invitedBy: true,
}).partial()

// Invite user schema
export const inviteUserSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  role: roleSchema,
  permissions: z.array(permissionSchema).min(1, 'At least one permission is required'),
  message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  tenantId: z.string()
    .min(1, 'Tenant ID is required')
    .uuid('Invalid tenant ID format'),
  invitedBy: z.string()
    .min(1, 'Invited by user ID is required')
    .uuid('Invalid user ID format'),
})

// User query schema
export const userQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  role: roleSchema.optional(),
  status: statusSchema.optional(),
  search: z.string().optional(),
})

// Update user role schema
export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  newRole: roleSchema,
  requestedBy: z.string().uuid('Invalid requester ID format'),
})

// Delete user schema
export const deleteUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  requestedBy: z.string().uuid('Invalid requester ID format'),
})

// Types
export type CreateTenantUserInput = z.infer<typeof createTenantUserSchema>
export type UpdateTenantUserInput = z.infer<typeof updateTenantUserSchema>
export type InviteUserInput = z.infer<typeof inviteUserSchema>
export type UserQueryInput = z.infer<typeof userQuerySchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type DeleteUserInput = z.infer<typeof deleteUserSchema>

// Validation utilities
export const validateCreateTenantUser = (data: unknown) => {
  return createTenantUserSchema.safeParse(data)
}

export const validateUpdateTenantUser = (data: unknown) => {
  return updateTenantUserSchema.safeParse(data)
}

export const validateInviteUser = (data: unknown) => {
  return inviteUserSchema.safeParse(data)
}

export const validateUserQuery = (data: unknown) => {
  return userQuerySchema.safeParse(data)
}

export const validateUpdateUserRole = (data: unknown) => {
  return updateUserRoleSchema.safeParse(data)
}

export const validateDeleteUser = (data: unknown) => {
  return deleteUserSchema.safeParse(data)
}