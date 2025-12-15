import { Customer } from "@/domains/customers/entities/customer.entity"
import { CustomerRepository } from "@/domains/customers/repositories/customer.repository"

export class GetCustomersUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(): Promise<Customer[]> {
    const customers = await this.customerRepository.findAll()
    return customers
  }
}