import { z } from 'zod'
import { validatePhone, validateSSN, validateEIN, validateZIP, validateStateCode } from '@/shared/utils/validation'

// Phone validation
const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be less than 15 digits')
  .refine((phone) => validatePhone(phone), {
    message: 'Please enter a valid US phone number (e.g., (555) 123-4567)'
  })

// SSN validation
const ssnSchema = z.string()
  .regex(/^\d{3}-?\d{2}-?\d{4}$/, 'SSN must be in format XXX-XX-XXXX or XXXXXXXXX')
  .refine((ssn) => validateSSN(ssn), {
    message: 'Please enter a valid Social Security Number'
  })

// EIN validation
const einSchema = z.string()
  .regex(/^\d{2}-?\d{7}$/, 'EIN must be in format XX-XXXXXXX or XXXXXXXXX')
  .refine((ein) => validateEIN(ein), {
    message: 'Please enter a valid Employer Identification Number'
  })

// ZIP code validation
const zipCodeSchema = z.string()
  .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format XXXXX or XXXXX-XXXX')
  .refine((zip) => validateZIP(zip), {
    message: 'Please enter a valid US ZIP code'
  })

// State validation
const stateSchema = z.string()
  .length(2, 'State code must be exactly 2 characters')
  .refine((state) => validateStateCode(state), {
    message: 'Please enter a valid US state code (e.g., CA, NY, TX)'
  })

// Base customer schema
const baseCustomerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-.,]+$/, 'Name can only contain letters, spaces, and basic punctuation'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  phone: phoneSchema.optional(),
  ssn: ssnSchema.optional(),
  ein: einSchema.optional(),
  address: z.string()
    .max(255, 'Address must be less than 255 characters')
    .optional(),
  city: z.string()
    .max(100, 'City must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'City can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  state: stateSchema.optional(),
  zipCode: zipCodeSchema.optional(),
  createdBy: z.string()
    .min(1, 'Created by user ID is required')
    .uuid('Invalid user ID format'),
})

// Create customer schema with validation
export const createCustomerSchema = baseCustomerSchema.refine((data) => {
  // At least one of SSN or EIN should be provided for identification
  return data.ssn || data.ein
}, {
  message: 'Either SSN or EIN must be provided for customer identification',
  path: ['ssn'],
})

// Update customer schema
export const updateCustomerSchema = baseCustomerSchema.omit({
  createdBy: true,
}).partial().refine((data) => {
  // If both SSN and EIN are provided, at least one should be valid
  if (data.ssn || data.ein) {
    return true // If any is provided, it's valid for update
  }
  return true // If none provided, it's also valid for partial update
}, {
  message: 'Invalid SSN or EIN format',
  path: ['ssn'],
})

// Customer query schema
export const customerQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  search: z.string().optional(),
  state: stateSchema.optional(),
  city: z.string().optional(),
})

// Types
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>

// Validation utilities
export const validateCreateCustomer = (data: unknown) => {
  return createCustomerSchema.safeParse(data)
}

export const validateUpdateCustomer = (data: unknown) => {
  return updateCustomerSchema.safeParse(data)
}

export const validateCustomerQuery = (data: unknown) => {
  return customerQuerySchema.safeParse(data)
}