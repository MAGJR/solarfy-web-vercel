import { LeadCustomerType } from '@prisma/client'

export class DomainClassifierService {
  private readonly leaseDomains = [
    'enphase.com',
    'sunnova.com',
    'palmetto.com',
    'igssolarpower.com'
  ]

  private readonly ownerDomains = [
    'gmail.com',
    'yahoo.com',
    'yahoo.es',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'aol.com'
  ]

  classifyCustomerType(email: string): LeadCustomerType {
    if (!email || !email.includes('@')) {
      return LeadCustomerType.UNKNOWN
    }

    const domain = email.split('@')[1]?.toLowerCase()

    if (!domain) {
      return LeadCustomerType.UNKNOWN
    }

    // Verificar se é domínio de lease (aluguel)
    const isLeaseDomain = this.leaseDomains.some(leaseDomain =>
      domain.includes(leaseDomain)
    )

    if (isLeaseDomain) {
      return LeadCustomerType.LEASE
    }

    // Verificar se é domínio de owner (cliente próprio)
    const isOwnerDomain = this.ownerDomains.includes(domain)

    if (isOwnerDomain) {
      return LeadCustomerType.OWNER
    }

    // Se não for nenhum dos conhecidos, retorna UNKNOWN
    return LeadCustomerType.UNKNOWN
  }

  /**
   * Verifica se o email pertence a um cliente próprio (Owner)
   */
  isOwner(email: string): boolean {
    return this.classifyCustomerType(email) === LeadCustomerType.OWNER
  }

  /**
   * Verifica se o email pertence a um sistema de aluguel (Lease)
   */
  isLease(email: string): boolean {
    return this.classifyCustomerType(email) === LeadCustomerType.LEASE
  }

  /**
   * Adiciona novos domínios de lease dinamicamente
   */
  addLeaseDomain(domain: string): void {
    if (!this.leaseDomains.includes(domain.toLowerCase())) {
      this.leaseDomains.push(domain.toLowerCase())
    }
  }

  /**
   * Adiciona novos domínios de owner dinamicamente
   */
  addOwnerDomain(domain: string): void {
    if (!this.ownerDomains.includes(domain.toLowerCase())) {
      this.ownerDomains.push(domain.toLowerCase())
    }
  }

  /**
   * Retorna todos os domínios configurados
   */
  getConfiguredDomains(): {
    lease: string[]
    owner: string[]
  } {
    return {
      lease: [...this.leaseDomains],
      owner: [...this.ownerDomains]
    }
  }
}