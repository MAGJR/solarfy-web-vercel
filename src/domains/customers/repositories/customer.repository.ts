import { ICustomerRepository } from "./customer.repository.interface"
import { Customer, CreateCustomerInput, UpdateCustomerInput } from "../entities/customer.entity"
import { prisma } from "@/infrastructure/database/prisma"

export class CustomerRepository implements ICustomerRepository {
  async create(input: CreateCustomerInput): Promise<Customer> {
    const customer = await prisma.customer.create({
      data: input,
    })
    return this.mapToEntity(customer)
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: { id },
    })
    return customer ? this.mapToEntity(customer) : null
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: { email },
    })
    return customer ? this.mapToEntity(customer) : null
  }

  async findAll(): Promise<Customer[]> {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return customers.map(this.mapToEntity)
  }

  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const customer = await prisma.customer.update({
      where: { id },
      data: input,
    })
    return this.mapToEntity(customer)
  }

  async delete(id: string): Promise<void> {
    await prisma.customer.delete({
      where: { id },
    })
  }

  private mapToEntity(prismaCustomer: any): Customer {
    return {
      id: prismaCustomer.id,
      name: prismaCustomer.name,
      email: prismaCustomer.email,
      phone: prismaCustomer.phone,
      ssn: prismaCustomer.ssn,
      ein: prismaCustomer.ein,
      address: prismaCustomer.address,
      city: prismaCustomer.city,
      state: prismaCustomer.state,
      zipCode: prismaCustomer.zipCode,
      createdAt: prismaCustomer.createdAt,
      updatedAt: prismaCustomer.updatedAt,
      createdBy: prismaCustomer.createdBy,
    }
  }
}