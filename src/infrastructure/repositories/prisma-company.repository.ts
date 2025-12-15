import { Company } from '@/domains/company/entities/company.entity'
import { ICompanyRepository } from '@/domains/company/repositories/company.repository.interface'
import { CompanyInfoInput } from '@/application/schemas/company.schema'
import { prisma } from '@/infrastructure/database/prisma'

export class PrismaCompanyRepository implements ICompanyRepository {
  async create(data: CompanyInfoInput & { tenantId: string }): Promise<Company> {
    const company = await prisma.company.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        website: data.website || null,
        taxId: data.taxId || null,
        description: data.description || null,
        tenantId: data.tenantId,
      },
    })

    return this.mapPrismaCompanyToCompany(company)
  }

  async findById(id: string): Promise<Company | null> {
    const company = await prisma.company.findUnique({
      where: { id },
    })

    return company ? this.mapPrismaCompanyToCompany(company) : null
  }

  async findByTenantId(tenantId: string): Promise<Company | null> {
    const company = await prisma.company.findUnique({
      where: { tenantId },
    })

    return company ? this.mapPrismaCompanyToCompany(company) : null
  }

  async update(id: string, data: Partial<CompanyInfoInput>): Promise<Company> {
    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.website !== undefined && { website: data.website || null }),
        ...(data.taxId !== undefined && { taxId: data.taxId || null }),
        ...(data.description !== undefined && { description: data.description || null }),
      },
    })

    return this.mapPrismaCompanyToCompany(company)
  }

  async delete(id: string): Promise<void> {
    await prisma.company.delete({
      where: { id },
    })
  }

  private mapPrismaCompanyToCompany(prismaCompany: any): Company {
    return {
      id: prismaCompany.id,
      name: prismaCompany.name,
      email: prismaCompany.email,
      phone: prismaCompany.phone || undefined,
      address: prismaCompany.address || undefined,
      website: prismaCompany.website || undefined,
      taxId: prismaCompany.taxId || undefined,
      description: prismaCompany.description || undefined,
      tenantId: prismaCompany.tenantId,
      createdAt: prismaCompany.createdAt,
      updatedAt: prismaCompany.updatedAt,
    }
  }
}