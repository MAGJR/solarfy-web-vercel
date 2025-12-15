import {
  csvLeadSchema,
  csvStructureSchema,
  csvParseResultSchema,
  validateCSVLead,
  validateCSVStructure,
  validateCSVParseResult,
  type CSVLead,
  type CSVStructure,
  type CSVParseResult,
  type ImportError
} from '@/application/schemas/crm.schema'
import { DomainClassifierService } from './domain-classifier.service'
import { LeadCustomerType } from '@prisma/client'

export interface ValidationError {
  row: number
  field?: string
  value?: string
  error: string
  suggestion?: string
}

export interface CSVValidationOptions {
  skipEmptyRows?: boolean
  maxRows?: number
  strictMode?: boolean
}

export class CSVValidatorService {
  private domainClassifier: DomainClassifierService

  constructor() {
    this.domainClassifier = new DomainClassifierService()
  }

  /**
   * Validate CSV file before parsing
   */
  validateFile(file: File): ValidationError[] {
    const errors: ValidationError[] = []

    // File size validation
    if (file.size === 0) {
      errors.push({
        row: 0,
        error: 'File is empty',
        suggestion: 'Please select a file with content'
      })
    }

    if (file.size > 10 * 1024 * 1024) {
      errors.push({
        row: 0,
        error: 'File size exceeds 10MB limit',
        suggestion: 'Compress your file or split it into smaller files'
      })
    }

    // File type validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push({
        row: 0,
        error: 'Only CSV files are allowed',
        suggestion: 'Save your file as a CSV (.csv) format'
      })
    }

    return errors
  }

  /**
   * Validate CSV structure and headers
   */
  validateStructure(headers: string[], firstDataRow: string[]): { errors: ValidationError[], structure?: CSVStructure } {
    const errors: ValidationError[] = []

    if (headers.length === 0) {
      errors.push({
        row: 1,
        error: 'CSV file has no headers',
        suggestion: 'Your CSV must have a header row with column names'
      })
      return { errors }
    }

    // Find required columns
    const nameIndex = this.findColumnIndex(headers, ['name', 'customer name', 'lead name'])
    const emailIndex = this.findColumnIndex(headers, ['owner email', 'email', 'customer email'])
    const phoneIndex = this.findColumnIndex(headers, ['owner phone', 'phone', 'contact phone'])
    const referenceIndex = this.findColumnIndex(headers, ['my company\'s reference', 'reference', 'ref id'])

    // Check required columns
    if (nameIndex === -1) {
      errors.push({
        row: 1,
        field: 'headers',
        error: 'Required "Name" column not found',
        value: headers.join(', '),
        suggestion: 'Add a column named "Name" or "Customer Name"'
      })
    }

    if (emailIndex === -1) {
      errors.push({
        row: 1,
        field: 'headers',
        error: 'Required "Owner Email" column not found',
        value: headers.join(', '),
        suggestion: 'Add a column named "Owner Email" or "Email"'
      })
    }

    if (errors.length > 0) {
      return { errors }
    }

    // Create structure object
    const structure: CSVStructure = {
      headers,
      requiredColumns: {
        name: nameIndex!,
        email: emailIndex!
      },
      optionalColumns: {
        phone: phoneIndex !== -1 ? phoneIndex : undefined,
        referenceId: referenceIndex !== -1 ? referenceIndex : undefined
      },
      totalRows: 0 // Will be updated during validation
    }

    // Validate structure with Zod
    const structureValidation = validateCSVStructure(structure)
    if (!structureValidation.success) {
      structureValidation.error.issues.forEach(issue => {
        errors.push({
          row: 1,
          field: 'structure',
          error: issue.message,
          suggestion: 'Check your CSV column structure'
        })
      })
    }

    return { errors, structure: structureValidation.success ? structure : undefined }
  }

  /**
   * Parse and validate CSV content
   */
  async validateContent(
    csvContent: string,
    structure: CSVStructure,
    options: CSVValidationOptions = {}
  ): Promise<CSVParseResult> {
    const { skipEmptyRows = true, maxRows = 10000, strictMode = false } = options
    const errors: ValidationError[] = []
    const leads: CSVLead[] = []

    // Parse CSV content
    const lines = this.parseCSVContent(csvContent)

    // Skip header and empty lines
    const dataLines = skipEmptyRows
      ? lines.slice(1).filter(line => line.some(cell => cell.trim()))
      : lines.slice(1)

    // Check row limit
    if (dataLines.length > maxRows) {
      errors.push({
        row: 0,
        error: `File has ${dataLines.length} rows but maximum allowed is ${maxRows}`,
        suggestion: 'Split your file into smaller files'
      })
    }

    // Validate each row
    for (let i = 0; i < Math.min(dataLines.length, maxRows); i++) {
      const rowNumber = i + 2 // +1 for header, +1 for 1-based indexing
      const row = dataLines[i]

      try {
        const lead = await this.validateRow(row, structure, rowNumber)
        if (lead) {
          leads.push(lead)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
        errors.push({
          row: rowNumber,
          error: errorMessage,
          field: this.guessErrorField(errorMessage, structure, row),
          value: this.getErrorValue(errorMessage, structure, row)
        })
      }
    }

    const result: CSVParseResult = {
      leads,
      errors: errors.map(err => ({
        row: err.row,
        email: err.field === 'email' ? err.value : undefined,
        error: err.error,
        field: err.field,
        value: err.value,
        suggestion: err.suggestion
      })),
      totalRows: dataLines.length,
      validRows: leads.length,
      invalidRows: errors.length
    }

    // Validate result with Zod
    const validationResult = validateCSVParseResult(result)
    if (!validationResult.success) {
      console.error('CSV validation result failed Zod validation:', validationResult.error)
    }

    return result
  }

  /**
   * Validate a single row against the schema
   */
  private async validateRow(
    row: string[],
    structure: CSVStructure,
    rowNumber: number
  ): Promise<CSVLead> {
    const { requiredColumns, optionalColumns } = structure

    // Extract values
    const name = this.cleanField(row[requiredColumns.name])
    const email = this.cleanField(row[requiredColumns.email])
    const phone = optionalColumns.phone !== undefined
      ? this.cleanField(row[optionalColumns.phone])
      : undefined
    const referenceId = optionalColumns.referenceId !== undefined
      ? this.cleanField(row[optionalColumns.referenceId])
      : undefined

    // Classify customer type based on email domain
    const customerType = this.domainClassifier.classifyCustomerType(email)

    // Create lead object
    const leadData = {
      rowNumber,
      name,
      email,
      phone,
      referenceId,
      customerType
    }

    // Validate with Zod schema
    const validation = validateCSVLead(leadData)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      throw new Error(firstError.message)
    }

    return validation.data
  }

  /**
   * Parse CSV content into array of arrays
   */
  private parseCSVContent(csvContent: string): string[][] {
    // Handle different line endings and remove BOM
    csvContent = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = csvContent.split('\n').filter(line => line.trim())

    if (lines.length === 0) {
      return []
    }

    return lines.map(line => this.parseCSVLine(line))
  }

  /**
   * Parse individual CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Quote escaped
          current += '"'
          i++ // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    // Add last field
    result.push(current.trim())

    return result
  }

  /**
   * Find column index by trying multiple possible names
   */
  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim())

    for (const name of possibleNames) {
      const index = normalizedHeaders.findIndex(h =>
        h === name.toLowerCase() ||
        h.includes(name.toLowerCase()) ||
        name.toLowerCase().includes(h)
      )
      if (index !== -1) {
        return index
      }
    }

    return -1
  }

  /**
   * Clean field value
   */
  private cleanField(value: string): string {
    return value ? value.replace(/^"|"$/g, '').trim() : ''
  }

  /**
   * Guess which field caused the error based on error message
   */
  private guessErrorField(errorMessage: string, structure: CSVStructure, row: string[]): string | undefined {
    if (errorMessage.toLowerCase().includes('name')) {
      return 'name'
    }
    if (errorMessage.toLowerCase().includes('email')) {
      return 'email'
    }
    if (errorMessage.toLowerCase().includes('phone')) {
      return 'phone'
    }
    if (errorMessage.toLowerCase().includes('reference')) {
      return 'referenceId'
    }
    return undefined
  }

  /**
   * Get the value that caused the error
   */
  private getErrorValue(errorMessage: string, structure: CSVStructure, row: string[]): string | undefined {
    const field = this.guessErrorField(errorMessage, structure, row)
    if (!field) return undefined

    if (field === 'name') {
      return this.cleanField(row[structure.requiredColumns.name])
    }
    if (field === 'email') {
      return this.cleanField(row[structure.requiredColumns.email])
    }
    if (field === 'phone' && structure.optionalColumns.phone !== undefined) {
      return this.cleanField(row[structure.optionalColumns.phone])
    }
    if (field === 'referenceId' && structure.optionalColumns.referenceId !== undefined) {
      return this.cleanField(row[structure.optionalColumns.referenceId])
    }

    return undefined
  }

  /**
   * Generate suggestions for fixing common CSV issues
   */
  generateSuggestions(errors: ValidationError[]): ValidationError[] {
    return errors.map(error => {
      const suggestions: string[] = []

      // Field-specific suggestions
      if (error.field === 'name' && error.value) {
        if (error.value.length < 2) {
          suggestions.push('Name must be at least 2 characters long')
        }
        if (/[^a-zA-Z\s'-.,]/.test(error.value)) {
          suggestions.push('Remove special characters from name')
        }
      }

      if (error.field === 'email' && error.value) {
        if (!error.value.includes('@')) {
          suggestions.push('Add @ symbol to email address')
        }
        if (!error.value.includes('.')) {
          suggestions.push('Add domain extension (e.g., .com, .org)')
        }
      }

      if (error.field === 'phone' && error.value) {
        const digits = error.value.replace(/\D/g, '')
        if (digits.length < 10) {
          suggestions.push('Phone number must have at least 10 digits')
        }
      }

      // Add suggestions to error
      return {
        ...error,
        suggestion: error.suggestion || suggestions[0] || 'Check the highlighted field and try again'
      }
    })
  }
}