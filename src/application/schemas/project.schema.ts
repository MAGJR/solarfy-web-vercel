import { z } from 'zod'
import { ProjectStatus } from '../../domains/projects/types/project-status.enum'

// Project status validation
const projectStatusSchema = z.nativeEnum(ProjectStatus, {
  errorMap: () => {
    const validStatuses = Object.values(ProjectStatus).join(', ')
    return {
      message: `Invalid project status. Valid options are: ${validStatuses}`,
    }
  },
})

// Power validation (kW)
const powerSchema = z.number()
  .min(0.1, 'Power must be at least 0.1 kW')
  .max(10000, 'Power cannot exceed 10,000 kW')
  .positive('Power must be a positive number')

// Price validation (USD)
const priceSchema = z.number()
  .min(100, 'Price must be at least $100')
  .max(10000000, 'Price cannot exceed $10,000,000')
  .positive('Price must be a positive number')

// Address validation with better patterns
const addressSchema = z.string()
  .min(5, 'Address must be at least 5 characters long')
  .max(200, 'Address must be less than 200 characters')
  .trim()
  .refine(
    (addr) => {
      // More comprehensive address validation
      const hasNumber = /\d/.test(addr)
      const hasStreet = /[a-zA-Z]/.test(addr)
      const hasComma = addr.includes(',')

      return hasNumber && hasStreet && (hasComma || addr.length > 10)
    },
    {
      message: 'Please enter a valid street address (e.g., "123 Main St, City, State" or "1000 Brickell Ave, Miami, FL")'
    }
  )

// Email validation
const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(100, 'Email must be less than 100 characters')
  .optional()
  .or(z.literal(''))

// Phone validation (flexible for international formats)
const phoneSchema = z.string()
  .max(20, 'Phone number must be less than 20 characters')
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(
    (phone) => {
      if (!phone) return true // optional
      // Basic phone format validation
      const phoneRegex = /^[\d\s\-\+\(\)]+$/
      const hasDigits = /\d/.test(phone)
      return phoneRegex.test(phone) && hasDigits
    },
    {
      message: 'Please enter a valid phone number'
    }
  )


// Base project schema (updated for new CRM integration)
const baseProjectSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters long')
    .max(200, 'Project name must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s'-.,]+$/, 'Project name can only contain letters, numbers, spaces, and basic punctuation'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  status: projectStatusSchema.default(ProjectStatus.PLANNING),
  estimatedKw: powerSchema,
  estimatedPrice: priceSchema,

  // New CRM and location fields
  crmLeadId: z.string()
    .uuid('Invalid CRM lead ID format')
    .optional(),

  address: addressSchema.optional(),
  email: emailSchema,
  phone: phoneSchema,

  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90 degrees')
    .max(90, 'Latitude must be between -90 and 90 degrees')
    .optional(),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180 degrees')
    .max(180, 'Longitude must be between -180 and 180 degrees')
    .optional(),

  // Legacy customer field (optional now)
  customerId: z.string()
    .uuid('Invalid customer ID format')
    .optional(),

  createdById: z.string()
    .min(1, 'Created by user ID is required')
    .uuid('Invalid user ID format'),
})

// Create project schema with validation (requires CRM lead and location)
export const createProjectSchema = baseProjectSchema
  .extend({
    // CRM Lead is required for new projects
    crmLeadId: z.string({
      required_error: 'Please select a CRM lead for this project'
    })
      .uuid('Invalid CRM lead ID format'),

    // Address is required when creating a project
    address: addressSchema,

    // Coordinates are required (map selection is mandatory)
    latitude: z.number({
      required_error: 'Please select a location on the map'
    })
      .min(-90, 'Latitude must be between -90 and 90 degrees')
      .max(90, 'Latitude must be between -90 and 90 degrees'),
    longitude: z.number({
      required_error: 'Please select a location on the map'
    })
      .min(-180, 'Longitude must be between -180 and 180 degrees')
      .max(180, 'Longitude must be between -180 and 180 degrees'),
  })
  .refine((data) => {
    // Validate that coordinates are provided together
    return (data.latitude !== undefined) === (data.longitude !== undefined)
  }, {
    message: 'Both latitude and longitude must be provided together',
    path: ['latitude'],
  })
  .refine((data) => {
    // Calculate average price per kW to validate reasonableness
    const pricePerKw = data.estimatedPrice / data.estimatedKw
    return pricePerKw >= 1000 && pricePerKw <= 10000
  }, {
    message: 'Price per kW seems unrealistic. Typical solar projects cost between $1,000-$10,000 per kW',
    path: ['estimatedPrice'],
  })
  .refine((data) => {
    // Validate coordinates make sense for the address (basic check)
    if (data.latitude && data.longitude && data.address) {
      // Check if coordinates are within reasonable bounds for solar installations
      return !(
        (Math.abs(data.latitude) < 0.01 && Math.abs(data.longitude) < 0.01) || // Near 0,0 (invalid)
        (data.latitude > 85 || data.latitude < -85) // Too far north/south
      )
    }
    return true
  }, {
    message: 'Coordinates appear to be invalid. Please select a valid location on the map.',
    path: ['latitude'],
  })

// Update project schema
export const updateProjectSchema = baseProjectSchema.omit({
  createdById: true,
}).partial().refine((data) => {
  // If both estimatedKw and estimatedPrice are provided, validate price per kW
  if (data.estimatedKw && data.estimatedPrice) {
    const pricePerKw = data.estimatedPrice / data.estimatedKw
    return pricePerKw >= 1000 && pricePerKw <= 10000
  }
  return true
}, {
  message: 'Price per kW seems unrealistic. Typical solar projects cost between $1,000-$10,000 per kW',
  path: ['estimatedPrice'],
})

// Project query schema
export const projectQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  status: projectStatusSchema.optional(),
  customerId: z.string().uuid('Invalid customer ID format').optional(),
  search: z.string().optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  minKw: powerSchema.optional(),
  maxKw: powerSchema.optional(),
}).refine((data) => {
  // Validate price range
  if (data.minPrice && data.maxPrice && data.minPrice > data.maxPrice) {
    return false
  }
  // Validate power range
  if (data.minKw && data.maxKw && data.minKw > data.maxKw) {
    return false
  }
  return true
}, {
  message: 'Minimum values must be less than or equal to maximum values',
})

// Project equipment assignment schema
export const projectEquipmentSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
  equipmentId: z.string().uuid('Invalid equipment ID format'),
  quantity: z.number()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity cannot exceed 1000')
    .int('Quantity must be an integer'),
})

// Types
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>
export type ProjectEquipmentInput = z.infer<typeof projectEquipmentSchema>

// Additional types for location and address validation
export type AddressInput = z.infer<typeof addressSchema>
export type EmailInput = z.infer<typeof emailSchema>
export type PhoneInput = z.infer<typeof phoneSchema>

// Validation utilities
export const validateCreateProject = (data: unknown) => {
  return createProjectSchema.safeParse(data)
}

export const validateUpdateProject = (data: unknown) => {
  return updateProjectSchema.safeParse(data)
}

export const validateProjectQuery = (data: unknown) => {
  return projectQuerySchema.safeParse(data)
}

export const validateProjectEquipment = (data: unknown) => {
  return projectEquipmentSchema.safeParse(data)
}

// Additional validation utilities for address and coordinates
export const validateAddress = (data: unknown) => {
  return addressSchema.safeParse(data)
}

export const validateEmail = (data: unknown) => {
  return emailSchema.safeParse(data)
}

export const validatePhone = (data: unknown) => {
  return phoneSchema.safeParse(data)
}

// Validate coordinates pair
export const validateCoordinates = (latitude: unknown, longitude: unknown) => {
  const latResult = z.number().min(-90).max(90).safeParse(latitude)
  const lngResult = z.number().min(-180).max(180).safeParse(longitude)

  if (!latResult.success || !lngResult.success) {
    return {
      success: false,
      error: {
        latitude: latResult.success ? undefined : latResult.error.issues[0]?.message,
        longitude: lngResult.success ? undefined : lngResult.error.issues[0]?.message,
      }
    }
  }

  // Additional validation for reasonable bounds
  const lat = latResult.data
  const lng = lngResult.data

  if (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01) {
    return {
      success: false,
      error: 'Coordinates appear to be invalid. Please select a location on the map.'
    }
  }

  if (lat > 85 || lat < -85) {
    return {
      success: false,
      error: 'Coordinates are too far north or south for typical solar installations.'
    }
  }

  return {
    success: true,
    data: { latitude: lat, longitude: lng }
  }
}