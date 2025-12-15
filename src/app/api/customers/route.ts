import { NextRequest, NextResponse } from 'next/server'
import { CustomerRepository } from '@/domains/customers/repositories/customer.repository'
import { CreateCustomerUseCase } from '@/application/use-cases/customer/create-customer.usecase'
import { GetCustomersUseCase } from '@/application/use-cases/customer/get-customers.usecase'
import { validateCreateCustomer, validateCustomerQuery } from '@/application/schemas'

// Initialize dependencies
const customerRepository = new CustomerRepository()
const createCustomerUseCase = new CreateCustomerUseCase(customerRepository)
const getCustomersUseCase = new GetCustomersUseCase(customerRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams)

    const validation = validateCustomerQuery(query)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      )
    }

    const customers = await getCustomersUseCase.execute()

    return NextResponse.json({
      success: true,
      data: customers
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = validateCreateCustomer(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    const customer = await createCustomerUseCase.execute(body)

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating customer:', error)

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }

      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}