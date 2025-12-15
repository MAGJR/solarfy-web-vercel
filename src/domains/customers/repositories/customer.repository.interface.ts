import { Customer, CreateCustomerInput, UpdateCustomerInput } from "../entities/customer.entity"

export interface ICustomerRepository {
  create(input: CreateCustomerInput): Promise<Customer>
  findById(id: string): Promise<Customer | null>
  findByEmail(email: string): Promise<Customer | null>
  findAll(): Promise<Customer[]>
  update(id: string, input: UpdateCustomerInput): Promise<Customer>
  delete(id: string): Promise<void>
}