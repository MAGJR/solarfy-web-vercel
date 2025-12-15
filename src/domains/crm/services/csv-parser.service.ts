import { DomainClassifierService } from './domain-classifier.service'
import { LeadCustomerType, ProductService } from '@prisma/client'

export interface ParsedLead {
  name: string
  email: string
  phone?: string
  referenceId?: string
  customerType: LeadCustomerType
}

export interface ImportError {
  row: number
  email?: string
  error: string
}

export interface CSVParseResult {
  leads: ParsedLead[]
  errors: ImportError[]
  totalRows: number
}

export class CSVParserService {
  private domainClassifier: DomainClassifierService

  constructor() {
    this.domainClassifier = new DomainClassifierService()
  }

  /**
   * Parse CSV content and extract lead data
   */
  parseCSV(csvContent: string): CSVParseResult {
    // Handle different line endings and remove BOM if present
    csvContent = csvContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = csvContent.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return {
        leads: [],
        errors: [{ row: 0, error: 'CSV file is empty or has no data rows' }],
        totalRows: 0
      }
    }

    // Special handling for this specific CSV format
    const headerLine = lines[0]
    let headers: string[]

    // Check if this is the problematic format with single quote wrapping entire header
    if (headerLine.startsWith('"Status,System ID,Name,Owner Email,Owner Phone')) {
      // Known problematic format - extract headers manually
      headers = [
        'Status',
        'System ID',
        'Name',
        'Owner Email',
        'Owner Phone',
        'City',
        'State/Prov',
        'Today',
        'Lifetime',
        'Connection',
        'IQ Energy Router',
        'Storm Guard Status',
        'SOC',
        'My Company\'s Reference'
      ]
    } else {
      // Use standard CSV parsing
      headers = this.parseCSVLine(headerLine)
    }
    const result: CSVParseResult = {
      leads: [],
      errors: [],
      totalRows: lines.length - 1
    }

    // Encontrar índices das colunas relevantes - usando matching exato
    const nameIndex = headers.findIndex(h =>
      h.toLowerCase().trim() === 'name' ||
      h.toLowerCase().includes('name') && !h.toLowerCase().includes('owner')
    )
    const emailIndex = headers.findIndex(h =>
      h.toLowerCase().trim() === 'owner email' ||
      h.toLowerCase() === 'owner email'
    )
    const phoneIndex = headers.findIndex(h =>
      h.toLowerCase().trim() === 'owner phone' ||
      h.toLowerCase() === 'owner phone'
    )
    const referenceIndex = headers.findIndex(h =>
      h.toLowerCase().trim() === 'my company\'s reference' ||
      h.toLowerCase().includes('reference') ||
      h.toLowerCase().includes('company\'s reference')
    )

    // Validar colunas obrigatórias
    if (nameIndex === -1 || emailIndex === -1) {
      return {
        leads: [],
        errors: [{
          row: 1,
          error: `Required columns not found in CSV.
Found columns: ${headers.join(', ')}
Need: "Name" column (index: ${nameIndex})
Need: "Owner Email" column (index: ${emailIndex})`
        }],
        totalRows: 0
      }
    }

    // Processar cada linha de dados
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const values = this.parseCSVLine(line)
        const lead = this.parseLeadRow(values, {
          nameIndex,
          emailIndex,
          phoneIndex,
          referenceIndex
        }, i + 1) // +1 para incluir header na contagem

        if (lead) {
          result.leads.push(lead)
        }
      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown parsing error'
        })
      }
    }

    return result
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
   * Parse a single row into a lead object
   */
  private parseLeadRow(
    values: string[],
    indices: { nameIndex: number; emailIndex: number; phoneIndex?: number; referenceIndex?: number },
    rowNumber: number
  ): ParsedLead | null {
    const name = this.cleanField(values[indices.nameIndex])
    const email = this.cleanField(values[indices.emailIndex])
    const phone = indices.phoneIndex !== undefined ? this.cleanField(values[indices.phoneIndex]) : undefined
    const referenceId = indices.referenceIndex !== undefined ? this.cleanField(values[indices.referenceIndex]) : undefined

    // Validações
    if (!name) {
      throw new Error('Name is required')
    }

    if (!email) {
      throw new Error('Email is required')
    }

    if (!this.isValidEmail(email)) {
      throw new Error(`Invalid email format: ${email}`)
    }

    const customerType = this.domainClassifier.classifyCustomerType(email)

    return {
      name: this.cleanName(name),
      email: email.toLowerCase().trim(),
      phone: phone ? this.cleanPhone(phone) : undefined,
      referenceId: referenceId || undefined,
      customerType
    }
  }

  /**
   * Clean and normalize field value
   */
  private cleanField(value: string): string {
    return value.replace(/^"|"$/g, '').trim()
  }

  /**
   * Clean and normalize name
   */
  private cleanName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s\-_.'áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Clean and normalize phone number
   */
  private cleanPhone(phone: string): string {
    return phone
      .replace(/[^\d+()\s\-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}