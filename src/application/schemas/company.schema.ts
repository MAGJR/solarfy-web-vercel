import { z } from 'zod'

// Schema para validação das informações da empresa
export const companyInfoSchema = z.object({
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  phone: z.preprocess((val) => val === '' ? undefined : val,
    z.string()
      .min(10, 'Phone number must be at least 10 digits')
      .optional()),
  address: z.preprocess((val) => val === '' ? undefined : val,
    z.string()
      .min(5, 'Address must be at least 5 characters')
      .optional()),
  website: z.preprocess((val) => val === '' ? undefined : val,
    z.string()
      .url('Please enter a valid URL')
      .optional()),
  taxId: z.preprocess((val) => val === '' ? undefined : val,
    z.string()
      .min(5, 'Tax ID must be at least 5 characters')
      .optional()),
  description: z.preprocess((val) => val === '' ? undefined : val,
    z.string()
      .max(500, 'Description must be less than 500 characters')
      .optional()),
})

// Schema para validação de convite de usuário
export const inviteUserSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES_REP', 'TECHNICIAN', 'VIEWER'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
  message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional()
})

// Schema para validação de atualização de usuário
export const updateUserRoleSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES_REP', 'TECHNICIAN', 'VIEWER'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  })
})

// Schema para validação de status de usuário
export const updateUserStatusSchema = z.object({
  userId: z.string()
    .min(1, 'User ID is required'),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  })
})

// Tipos inferidos dos schemas
export type CompanyInfoInput = z.infer<typeof companyInfoSchema>
export type InviteUserInput = z.infer<typeof inviteUserSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>

// Funções de validação
export const validateCompanyInfo = (data: unknown) => {
  return companyInfoSchema.safeParse(data)
}

export const validateInviteUser = (data: unknown) => {
  return inviteUserSchema.safeParse(data)
}

export const validateUpdateUserRole = (data: unknown) => {
  return updateUserRoleSchema.safeParse(data)
}

export const validateUpdateUserStatus = (data: unknown) => {
  return updateUserStatusSchema.safeParse(data)
}