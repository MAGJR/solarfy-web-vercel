import { z } from 'zod'
import { CrmUserStatus, ProductService } from '@/domains/crm/entities/crm-user.entity'
import { LeadCustomerType } from '@prisma/client'

// CRM User Status validation
const crmStatusSchema = z.nativeEnum(CrmUserStatus, {
  errorMap: () => {
    const validStatuses = Object.values(CrmUserStatus).join(', ')
    return {
      message: `Invalid status. Valid options are: ${validStatuses}`,
    }
  },
})

// Product/Service validation
const productServiceSchema = z.nativeEnum(ProductService, {
  errorMap: () => {
    const validServices = Object.values(ProductService).join(', ')
    return {
      message: `Invalid product/service. Valid options are: ${validServices}`,
    }
  },
})

// Base CRM user schema
const baseCrmUserSchema = z.object({
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
  company: z.string()
    .min(2, 'Company name must be at least 2 characters long')
    .max(100, 'Company name must be less than 100 characters'),
  productService: productServiceSchema,
  assignee: z.string()
    .min(1, 'Assignee ID is required')
    .uuid('Invalid assignee ID format')
    .optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  createdBy: z.string()
    .min(1, 'Created by user ID is required')
    .uuid('Invalid user ID format'),
})

// Create CRM user schema
export const createCrmUserSchema = baseCrmUserSchema

// Update CRM user schema
export const updateCrmUserSchema = baseCrmUserSchema.omit({
  company: true,
  createdBy: true,
}).partial()

// CRM user query schema
export const crmUserQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  status: crmStatusSchema.optional(),
  assignee: z.string().uuid('Invalid assignee ID format').optional(),
  productService: productServiceSchema.optional(),
  search: z.string().optional(),
  dateRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).optional(),
}).refine((data) => {
  if (data.dateRange && data.dateRange.start > data.dateRange.end) {
    return false
  }
  return true
}, {
  message: 'Start date must be before end date',
})

// Types
export type CreateCrmUserInput = z.infer<typeof createCrmUserSchema>
export type UpdateCrmUserInput = z.infer<typeof updateCrmUserSchema>
export type CrmUserQueryInput = z.infer<typeof crmUserQuerySchema>

// Validation utilities
export const validateCreateCrmUser = (data: unknown) => {
  return createCrmUserSchema.safeParse(data)
}

export const validateUpdateCrmUser = (data: unknown) => {
  return updateCrmUserSchema.safeParse(data)
}

export const validateCrmUserQuery = (data: unknown) => {
  return crmUserQuerySchema.safeParse(data)
}

// Customer Type validation
const customerTypeSchema = z.nativeEnum(LeadCustomerType, {
  errorMap: () => {
    const validTypes = Object.values(LeadCustomerType).join(', ')
    return {
      message: `Invalid customer type. Valid options are: ${validTypes}`,
    }
  },
})

// CSV Lead validation schema
export const csvLeadSchema = z.object({
  rowNumber: z.number(),
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-'/.,#&áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/, 'Name contains invalid characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .optional()
    .transform(val => {
      if (!val) return undefined
      // Clean phone number
      const cleaned = val.replace(/[^\d+]/g, '')
      return cleaned.length >= 10 ? cleaned : undefined
    })
    .refine(val => !val || val.length >= 10, {
      message: 'Phone number must have at least 10 digits'
    }),
  referenceId: z.string()
    .optional()
    .transform(val => val?.trim() || undefined),
  customerType: customerTypeSchema.default('OWNER'),
})

// CSV structure validation schema
export const csvStructureSchema = z.object({
  headers: z.array(z.string()).min(1, 'CSV must have headers'),
  requiredColumns: z.object({
    name: z.number().int().min(0, 'Name column index must be valid'),
    email: z.number().int().min(0, 'Email column index must be valid'),
  }),
  optionalColumns: z.object({
    phone: z.number().int().min(0).optional(),
    referenceId: z.number().int().min(0).optional(),
  }),
  totalRows: z.number().int().min(0, 'Row count must be valid'),
})

// CSV file validation schema
export const csvFileSchema = z.object({
  file: z.instanceof(File, {
    message: 'Please select a valid file'
  }),
  size: z.number()
    .max(10 * 1024 * 1024, 'File size exceeds 10MB limit')
    .min(1, 'File cannot be empty'),
  type: z.string().refine(type => type === 'text/csv' || type === 'application/csv', {
    message: 'Only CSV files are allowed'
  }),
  name: z.string().refine(name => name.toLowerCase().endsWith('.csv'), {
    message: 'File must have .csv extension'
  }),
})

// CSV Parse Result validation
export const csvParseResultSchema = z.object({
  leads: z.array(csvLeadSchema),
  errors: z.array(z.object({
    row: z.number(),
    email: z.string().optional(),
    error: z.string(),
    field: z.string().optional(),
    value: z.string().optional(),
    suggestion: z.string().optional(),
  })),
  totalRows: z.number(),
  validRows: z.number(),
  invalidRows: z.number(),
})

// Import Request validation
export const importRequestSchema = z.object({
  file: csvFileSchema.shape.file,
  userId: z.string()
    .min(1, 'User ID is required')
    .uuid('Invalid user ID format'),
  options: z.object({
    skipDuplicates: z.boolean().default(true),
    batchSize: z.number().int().min(1).max(100).default(50),
  }).optional(),
})

// Types
export type CSVLead = z.infer<typeof csvLeadSchema>
export type CSVStructure = z.infer<typeof csvStructureSchema>
export type CSVFile = z.infer<typeof csvFileSchema>
export type CSVParseResult = z.infer<typeof csvParseResultSchema>
export type ImportRequest = z.infer<typeof importRequestSchema>

// Validation utilities for CSV import
export const validateCSVFile = (file: unknown) => {
  return csvFileSchema.safeParse(file)
}

export const validateCSVStructure = (data: unknown) => {
  return csvStructureSchema.safeParse(data)
}

export const validateCSVLead = (data: unknown) => {
  return csvLeadSchema.safeParse(data)
}

export const validateCSVParseResult = (data: unknown) => {
  return csvParseResultSchema.safeParse(data)
}

export const validateImportRequest = (data: unknown) => {
  return importRequestSchema.safeParse(data)
}