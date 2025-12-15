import { Customer } from "@/domains/customers/entities/customer.entity"
import { CustomerRepository } from "@/domains/customers/repositories/customer.repository"

export class CreateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const customer = await this.customerRepository.create(data)
    return customer
  }
}