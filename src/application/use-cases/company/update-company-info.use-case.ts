import { Company } from '@/domains/company/entities/company.entity'
import { ICompanyRepository } from '@/domains/company/repositories/company.repository.interface'
import { validateCompanyInfo, CompanyInfoInput } from '@/application/schemas/company.schema'

export interface UpdateCompanyInfoInput {
  tenantId: string
  data: CompanyInfoInput
}

export interface UpdateCompanyInfoOutput {
  success: boolean
  company?: Company
  error?: string
}

export class UpdateCompanyInfoUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(input: UpdateCompanyInfoInput): Promise<UpdateCompanyInfoOutput> {
    try {
      // Validate input data
      const validation = validateCompanyInfo(input.data)
      if (!validation.success) {
        const errorMessages = validation.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
        return {
          success: false,
          error: `Validation failed: ${errorMessages.join(', ')}`
        }
      }

      const validatedData = validation.data

      // Check if company exists for this tenant
      const existingCompany = await this.companyRepository.findByTenantId(input.tenantId)

      let company: Company

      if (existingCompany) {
        // Update existing company
        company = await this.companyRepository.update(existingCompany.id, validatedData)
      } else {
        // Create new company
        company = await this.companyRepository.create({
          ...validatedData,
          tenantId: input.tenantId
        })
      }

      return {
        success: true,
        company
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update company information'
      }
    }
  }
}