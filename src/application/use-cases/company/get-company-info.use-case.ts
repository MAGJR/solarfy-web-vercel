import { Company } from '@/domains/company/entities/company.entity'
import { ICompanyRepository } from '@/domains/company/repositories/company.repository.interface'

export interface GetCompanyInfoInput {
  tenantId: string
}

export interface GetCompanyInfoOutput {
  success: boolean
  company?: Company
  error?: string
}

export class GetCompanyInfoUseCase {
  constructor(private companyRepository: ICompanyRepository) {}

  async execute(input: GetCompanyInfoInput): Promise<GetCompanyInfoOutput> {
    try {
      const company = await this.companyRepository.findByTenantId(input.tenantId)

      if (!company) {
        return {
          success: false,
          error: 'Company information not found'
        }
      }

      return {
        success: true,
        company
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get company information'
      }
    }
  }
}