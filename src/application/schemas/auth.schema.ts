import { z } from 'zod'

// User validation schemas
export const baseUserSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
})

// Sign up schema
export const signUpSchema = baseUserSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Sign in schema
export const signInSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required'),
})

// Update user schema
export const updateUserSchema = baseUserSchema.partial()

// Types
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Validation utilities
export const validateSignUp = (data: unknown) => {
  return signUpSchema.safeParse(data)
}

export const validateSignIn = (data: unknown) => {
  return signInSchema.safeParse(data)
}

export const validateUpdateUser = (data: unknown) => {
  return updateUserSchema.safeParse(data)
}