"use server"

import { revalidatePath } from "next/cache"
import { PrismaClient } from "@prisma/client"
import { PrismaCrmLeadRepository } from "@/infrastructure/repositories/prisma-crm-lead.repository"
import { CreateCrmLeadUseCase } from "@/application/use-cases/crm/create-crm-lead.usecase"
import { CreateCrmLeadInput } from "@/infrastructure/repositories/prisma-crm-lead.repository"
import { CrmUserStatus } from "@prisma/client"
import { GetCrmLeadUseCase } from "@/application/use-cases/crm/get-crm-lead.usecase"
import { JourneyStepType, StepStatus } from "@prisma/client"


export type CreateLeadState = {
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    company?: string[]
    productService?: string[]
    notes?: string[]
    score?: string[]
    status?: string[]
    assignee?: string[]
    _form?: string[]
  }
  message?: string | null
  success?: boolean
  data?: any
}

export async function createLead(
  leadData: Omit<CreateCrmLeadInput, 'createdBy'> & { score?: number; status?: CrmUserStatus }
): Promise<CreateLeadState> {
  try {
    // Search for a valid user from the database to use as createdBy
    const prisma = new PrismaClient()

    // Search for the first available user in the database
    const firstUser = await prisma.user.findFirst({
      select: { id: true }
    })

    if (!firstUser) {
      return {
        errors: {
          _form: ["No user found in the system. Cannot create leads."]
        },
        message: "System configuration error"
      }
    }

    // Add the createdBy field with a real user
    const completeLeadData: CreateCrmLeadInput = {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      productService: leadData.productService as any, // Converting to Prisma type
      assignee: leadData.assignee,
      notes: leadData.notes,
      createdBy: firstUser.id // Using a real user ID
    }

    // Basic validation of required fields
    if (!leadData.name || !leadData.email || !leadData.company) {
      return {
        errors: {
          _form: ["Name, email and company are required"]
        },
        message: "Please fill in all required fields."
      }
    }

    if (!leadData.email.includes('@')) {
      return {
        errors: {
          email: ["Invalid email"]
        },
        message: "Please correct the errors in the form."
      }
    }

    // Initialize dependencies (reusing already initialized prisma)
    const crmLeadRepository = new PrismaCrmLeadRepository(prisma)
    const createCrmLeadUseCase = new CreateCrmLeadUseCase(crmLeadRepository)

    // Execute use case with repository data
    const newLead = await createCrmLeadUseCase.execute(completeLeadData)

    // Revalidate cache
    revalidatePath("/app/leads")
    revalidatePath("/app")
    revalidatePath("/api/crm/leads")

    return {
      success: true,
      message: "Lead created successfully!",
      data: newLead
    }

  } catch (error) {
    console.error("Error creating lead:", error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return {
          errors: {
            email: ["This email is already in use"]
          },
          message: "Validation error"
        }
      }
    }

    return {
      errors: {
        _form: ["An error occurred while creating the lead. Please try again."]
      },
      message: "Error creating lead"
    }
  }
}

// Type for getLeadById function response
export type GetLeadState = {
  success?: boolean
  message?: string | null
  data?: any
  errors?: {
    _form?: string[]
  }
}

// Journey Step Management
export type JourneyStepState = {
  errors?: {
    step?: string[]
    status?: string[]
    notes?: string[]
    assignedTo?: string[]
    _form?: string[]
  }
  message?: string | null
  success?: boolean
  data?: any
}

export async function getJourneySteps(leadId: string): Promise<JourneyStepState> {
  try {
    if (!leadId) {
      return {
        success: false,
        message: "Lead ID is required",
        errors: {
          _form: ["Lead ID is required"]
        }
      }
    }

    const response = await fetch(`/api/crm/leads/${leadId}/journey-steps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch journey steps')
    }

    const steps = await response.json()

    return {
      success: true,
      message: "Journey steps fetched successfully!",
      data: steps
    }

  } catch (error) {
    console.error("Error fetching journey steps:", error)

    return {
      success: false,
      message: "Error fetching journey steps",
      errors: {
        _form: ["An error occurred while fetching the journey steps. Please try again."]
      }
    }
  }
}

export async function addJourneyStep(
  leadId: string,
  stepData: {
    step: JourneyStepType
    status: StepStatus
    notes?: string
    assignedTo?: string
  }
): Promise<JourneyStepState> {
  try {
    if (!leadId || !stepData.step || !stepData.status) {
      return {
        errors: {
          _form: ["Lead ID, step and status are required"]
        },
        message: "Please fill in all required fields."
      }
    }

    const response = await fetch(`/api/crm/leads/${leadId}/journey-steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stepData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create journey step')
    }

    const newStep = await response.json()

    // Revalidate cache
    revalidatePath(`/app/leads/${leadId}`)
    revalidatePath(`/app/leads/${leadId}/edit`)

    return {
      success: true,
      message: "Journey step added successfully!",
      data: newStep
    }

  } catch (error) {
    console.error("Error adding journey step:", error)

    return {
      errors: {
        _form: ["An error occurred while adding the journey step. Please try again."]
      },
      message: "Error adding journey step"
    }
  }
}

export async function updateJourneyStep(
  leadId: string,
  stepId: string,
  stepData: {
    status?: StepStatus
    notes?: string
    assignedTo?: string
  }
): Promise<JourneyStepState> {
  try {
    if (!leadId || !stepId) {
      return {
        errors: {
          _form: ["Lead ID and Step ID are required"]
        },
        message: "Required IDs are missing."
      }
    }

    const response = await fetch(`/api/crm/leads/${leadId}/journey-steps/${stepId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stepData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update journey step')
    }

    const updatedStep = await response.json()

    // Revalidate cache
    revalidatePath(`/app/leads/${leadId}`)
    revalidatePath(`/app/leads/${leadId}/edit`)

    return {
      success: true,
      message: "Journey step updated successfully!",
      data: updatedStep
    }

  } catch (error) {
    console.error("Error updating journey step:", error)

    return {
      errors: {
        _form: ["An error occurred while updating the journey step. Please try again."]
      },
      message: "Error updating journey step"
    }
  }
}

export async function deleteJourneyStep(
  leadId: string,
  stepId: string
): Promise<JourneyStepState> {
  try {
    if (!leadId || !stepId) {
      return {
        errors: {
          _form: ["Lead ID and Step ID are required"]
        },
        message: "Required IDs are missing."
      }
    }

    const response = await fetch(`/api/crm/leads/${leadId}/journey-steps/${stepId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete journey step')
    }

    // Revalidate cache
    revalidatePath(`/app/leads/${leadId}`)
    revalidatePath(`/app/leads/${leadId}/edit`)

    return {
      success: true,
      message: "Journey step deleted successfully!",
      data: { success: true }
    }

  } catch (error) {
    console.error("Error deleting journey step:", error)

    return {
      errors: {
        _form: ["An error occurred while deleting the journey step. Please try again."]
      },
      message: "Error deleting journey step"
    }
  }
}

// Function to get a lead by ID
export async function getLeadById(leadId: string): Promise<GetLeadState> {
  try {
    if (!leadId) {
      return {
        success: false,
        message: "Lead ID is required",
        errors: {
          _form: ["Lead ID is required"]
        }
      }
    }

    // Initialize dependencies
    const prisma = new PrismaClient()
    const crmLeadRepository = new PrismaCrmLeadRepository(prisma)
    const getCrmLeadUseCase = new GetCrmLeadUseCase(crmLeadRepository)

    // Execute use case
    const lead = await getCrmLeadUseCase.execute(leadId)

    if (!lead) {
      return {
        success: false,
        message: "Lead not found",
        errors: {
          _form: ["Lead not found"]
        }
      }
    }

    return {
      success: true,
      message: "Lead found successfully!",
      data: lead
    }

  } catch (error) {
    console.error("Error fetching lead:", error)

    return {
      success: false,
      message: "Error fetching lead",
      errors: {
        _form: ["An error occurred while fetching the lead. Please try again."]
      }
    }
  }
}

// Delete Lead Action
export type DeleteLeadState = {
  success?: boolean
  message?: string | null
  data?: any
  errors?: {
    _form?: string[]
  }
}

export async function deleteLead(leadId: string): Promise<DeleteLeadState> {
  try {
    if (!leadId) {
      return {
        success: false,
        message: "Lead ID is required",
        errors: {
          _form: ["Lead ID is required"]
        }
      }
    }

    // Initialize dependencies
    const prisma = new PrismaClient()
    const crmLeadRepository = new PrismaCrmLeadRepository(prisma)

    // Check if lead exists before deleting
    const existingLead = await crmLeadRepository.findById(leadId)
    if (!existingLead) {
      return {
        success: false,
        message: "Lead not found",
        errors: {
          _form: ["Lead not found"]
        }
      }
    }

    // Delete the lead using the repository
    await crmLeadRepository.delete(leadId)

    // Revalidate cache
    revalidatePath("/app/leads")
    revalidatePath("/app")
    revalidatePath("/api/crm/leads")

    return {
      success: true,
      message: "Lead deleted successfully!",
      data: { deletedLeadId: leadId }
    }

  } catch (error) {
    console.error("Error deleting lead:", error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("foreign key constraint")) {
        return {
          success: false,
          message: "Cannot delete lead - it has related records",
          errors: {
            _form: ["This lead has related projects or journey steps. Please delete them first or contact support."]
          }
        }
      }

      if (error.message.includes("Record to delete does not exist")) {
        return {
          success: false,
          message: "Lead not found",
          errors: {
            _form: ["Lead not found or already deleted"]
          }
        }
      }
    }

    return {
      success: false,
      message: "Error deleting lead",
      errors: {
        _form: ["An error occurred while deleting the lead. Please try again."]
      }
    }
  }
}