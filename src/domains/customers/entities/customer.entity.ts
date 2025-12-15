export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  ssn?: string // Social Security Number
  ein?: string // Employer Identification Number (for businesses)
  address?: string
  city?: string
  state?: string
  zipCode?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CreateCustomerInput {
  name: string
  email: string
  phone?: string
  ssn?: string
  ein?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  createdBy: string
}

export interface UpdateCustomerInput {
  name?: string
  email?: string
  phone?: string
  ssn?: string
  ein?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}