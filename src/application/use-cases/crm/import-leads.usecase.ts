import { PrismaCrmLeadRepository, CreateCrmLeadInput, CrmLeadWithJourney } from '@/infrastructure/repositories/prisma-crm-lead.repository'
import { CSVParserService, ParsedLead, CSVParseResult } from '@/domains/crm/services/csv-parser.service'
import { ProductService, LeadCustomerType } from '@prisma/client'

export interface ImportLeadsRequest {
  csvContent: string
  userId: string
  options?: {
    skipDuplicates?: boolean
    batchSize?: number
  }
}

export interface ImportLeadsResponse {
  success: boolean
  message: string
  data: {
    total: number
    imported: number
    failed: number
    skipped: number
    duration: number
    errors: Array<{
      row: number
      email?: string
      error: string
    }>
    importedLeads: CrmLeadWithJourney[]
  }
}

export class ImportLeadsUseCase {
  constructor(
    private crmLeadRepository: PrismaCrmLeadRepository,
    private csvParserService: CSVParserService
  ) {}

  async execute(request: ImportLeadsRequest): Promise<ImportLeadsResponse> {
    const startTime = Date.now()
    const { csvContent, userId, options = {} } = request
    const { skipDuplicates = true, batchSize = 50 } = options

    try {
      // 1. Parse CSV content
      const parseResult: CSVParseResult = this.csvParserService.parseCSV(csvContent)

      if (parseResult.leads.length === 0) {
        return {
          success: false,
          message: 'No valid leads found in CSV file',
          data: {
            total: parseResult.totalRows,
            imported: 0,
            failed: parseResult.errors.length,
            skipped: 0,
            duration: Date.now() - startTime,
            errors: parseResult.errors,
            importedLeads: []
          }
        }
      }

      // 2. Check for duplicates if requested
      const existingEmails = new Set<string>()
      if (skipDuplicates) {
        const emails = parseResult.leads.map(lead => lead.email.toLowerCase())
        const existingLeads = await this.getExistingLeadsByEmails(emails)
        existingLeads.forEach(lead => existingEmails.add(lead.email.toLowerCase()))
      }

      // 3. Process leads in batches
      const results = {
        imported: 0,
        failed: 0,
        skipped: 0,
        errors: [...parseResult.errors],
        importedLeads: [] as CrmLeadWithJourney[]
      }

      for (let i = 0; i < parseResult.leads.length; i += batchSize) {
        const batch = parseResult.leads.slice(i, i + batchSize)

        const batchResults = await this.processBatch(batch, userId, existingEmails)

        results.imported += batchResults.imported
        results.failed += batchResults.failed
        results.skipped += batchResults.skipped
        results.errors.push(...batchResults.errors)
        results.importedLeads.push(...batchResults.importedLeads)
      }

      const duration = Date.now() - startTime

      return {
        success: true,
        message: `Successfully imported ${results.imported} leads. ${results.skipped} duplicates skipped, ${results.failed} failed.`,
        data: {
          total: parseResult.leads.length,
          imported: results.imported,
          failed: results.failed,
          skipped: results.skipped,
          duration,
          errors: results.errors,
          importedLeads: results.importedLeads
        }
      }

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred during import',
        data: {
          total: 0,
          imported: 0,
          failed: 0,
          skipped: 0,
          duration: Date.now() - startTime,
          errors: [{
            row: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          }],
          importedLeads: []
        }
      }
    }
  }

  /**
   * Process a batch of leads
   */
  private async processBatch(
    leads: ParsedLead[],
    userId: string,
    existingEmails: Set<string>
  ): Promise<{
    imported: number
    failed: number
    skipped: number
    errors: Array<{
      row: number
      email?: string
      error: string
    }>
    importedLeads: CrmLeadWithJourney[]
  }> {
    const results = {
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; email?: string; error: string }>,
      importedLeads: [] as CrmLeadWithJourney[]
    }

    // Process each lead individually to handle errors gracefully
    for (const lead of leads) {
      try {
        // Check for duplicates
        if (existingEmails.has(lead.email.toLowerCase())) {
          results.skipped++
          continue
        }

        // Transform ParsedLead to CreateCrmLeadInput
        const leadInput: CreateCrmLeadInput = {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: 'Solarfy',
          productService: ProductService.SOLAR_PANELS,
          notes: lead.referenceId ? `Reference ID: ${lead.referenceId}` : undefined,
          customerType: lead.customerType,
          createdBy: userId
        }

        // Create lead in database
        const createdLead = await this.crmLeadRepository.create(leadInput)
        results.importedLeads.push(createdLead)
        results.imported++

        // Add to existing emails set to avoid duplicates within same import
        existingEmails.add(lead.email.toLowerCase())

      } catch (error) {
        results.failed++
        results.errors.push({
          row: 0, // We don't have row number here
          email: lead.email,
          error: error instanceof Error ? error.message : 'Unknown error creating lead'
        })
      }
    }

    return results
  }

  /**
   * Get existing leads by emails to check for duplicates
   */
  private async getExistingLeadsByEmails(emails: string[]): Promise<{ email: string }[]> {
    try {
      // This is a simplified approach. In a real implementation, you might want
      // to add a method to the repository for this specific query
      const existingLeads = await Promise.all(
        emails.map(async (email) => {
          try {
            // Find lead by email (you might want to add this method to repository)
            const lead = await this.findLeadByEmail(email)
            return lead ? { email: lead.email } : null
          } catch {
            return null
          }
        })
      )

      return existingLeads.filter((lead): lead is { email: string } => lead !== null)
    } catch (error) {
      console.error('Error checking for duplicates:', error)
      return []
    }
  }

  /**
   * Helper method to find lead by email (should be moved to repository)
   */
  private async findLeadByEmail(email: string): Promise<{ email: string } | null> {
    // This is a placeholder implementation
    // In a real scenario, you would add this method to PrismaCrmLeadRepository
    try {
      const leads = await this.crmLeadRepository.findAll({
        limit: 1,
        search: email
      })

      const foundLead = leads.leads.find(lead =>
        lead.email.toLowerCase() === email.toLowerCase()
      )

      return foundLead ? { email: foundLead.email } : null
    } catch {
      return null
    }
  }
}