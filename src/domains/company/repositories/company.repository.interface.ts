import { Company } from '../entities/company.entity'
import { CompanyInfoInput } from '@/application/schemas/company.schema'

export interface ICompanyRepository {
  create(data: CompanyInfoInput & { tenantId: string }): Promise<Company>
  findById(id: string): Promise<Company | null>
  findByTenantId(tenantId: string): Promise<Company | null>
  update(id: string, data: Partial<CompanyInfoInput>): Promise<Company>
  delete(id: string): Promise<void>
}