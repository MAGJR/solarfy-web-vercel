"use server"

import { revalidatePath } from "next/cache"
import { PrismaClient } from "@prisma/client"
import { CreateProjectUseCase } from "@/application/use-cases/projects/create-project.usecase"
import { GetProjectsUseCase, GetProjectsFilters } from "@/application/use-cases/projects/get-projects.usecase"
import { DeleteProjectUseCase } from "@/application/use-cases/projects/delete-project.usecase"
import { GetProjectByIdUseCase } from "@/application/use-cases/projects/get-project-by-id.usecase"
import { UpdateProjectUseCase } from "@/application/use-cases/projects/update-project.usecase"
import { PrismaProjectRepository } from "@/infrastructure/repositories/prisma-project.repository"
import { CreateProjectInput } from "@/domains/projects/entities/project.entity"
import { ProjectStatus } from "@prisma/client"

const prisma = new PrismaClient()
const projectRepository = new PrismaProjectRepository(prisma)
const createProjectUseCase = new CreateProjectUseCase(projectRepository)
const getProjectsUseCase = new GetProjectsUseCase(projectRepository)
const deleteProjectUseCase = new DeleteProjectUseCase(projectRepository)
const getProjectByIdUseCase = new GetProjectByIdUseCase(projectRepository)
const updateProjectUseCase = new UpdateProjectUseCase(projectRepository)

export interface CreateProjectData {
  name: string
  description?: string
  estimatedKw: number
  estimatedPrice: number
  crmLeadId?: string
  address?: string
  email?: string
  phone?: string
  latitude?: number
  longitude?: number
}

export interface CreateProjectState {
  errors?: {
    name?: string[]
    description?: string[]
    estimatedKw?: string[]
    estimatedPrice?: string[]
    crmLeadId?: string[]
    address?: string[]
    email?: string[]
    phone?: string[]
    latitude?: string[]
    longitude?: string[]
    _form?: string[]
  }
  message?: string | null
  success?: boolean
  data?: any
}

export async function createProject(data: CreateProjectData): Promise<CreateProjectState> {
  try {
    // Find a valid user from the database to use as createdBy
    const firstUser = await prisma.user.findFirst({
      select: { id: true }
    })

    if (!firstUser) {
      return {
        errors: {
          _form: ["No user found in the system. Cannot create projects."]
        },
        message: "System configuration error"
      }
    }

    // Prepare project data
    const projectData: CreateProjectInput = {
      name: data.name,
      description: data.description,
      estimatedKw: data.estimatedKw,
      estimatedPrice: data.estimatedPrice,
      createdById: firstUser.id,
      crmLeadId: data.crmLeadId,
      address: data.address,
      email: data.email,
      phone: data.phone,
      latitude: data.latitude,
      longitude: data.longitude,
    }

    const result = await createProjectUseCase.execute(projectData)

    // Revalidate the projects page to show the new data
    revalidatePath("/app/projects")

    return {
      success: true,
      message: "Project created successfully!",
      data: result
    }

  } catch (error: any) {
    console.error("Error creating project:", error)

    return {
      success: false,
      message: error.message || "Error creating project",
      errors: {
        _form: [error.message || "Unknown error occurred"]
      }
    }
  }
}

export async function getProjects(filters?: GetProjectsFilters) {
  try {
    const result = await getProjectsUseCase.execute(filters)
    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    return {
      success: false,
      message: error.message || "Error fetching projects",
      data: { projects: [], total: 0, page: 1, limit: 50, totalPages: 0 }
    }
  }
}

export async function getAvailableLeads() {
  try {
    const leads = await getProjectsUseCase.getAvailableLeads()
    return {
      success: true,
      data: leads
    }
  } catch (error: any) {
    console.error("Error fetching available leads:", error)
    return {
      success: false,
      message: error.message || "Error fetching available leads",
      data: []
    }
  }
}

export interface DeleteProjectState {
  errors?: {
    _form?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function deleteProject(id: string): Promise<DeleteProjectState> {
  try {
    await deleteProjectUseCase.execute(id)

    // Revalidate the projects page
    revalidatePath("/app/projects")

    return {
      success: true,
      message: "Project deleted successfully!"
    }

  } catch (error: any) {
    console.error("Error deleting project:", error)

    return {
      success: false,
      message: error.message || "Error deleting project",
      errors: {
        _form: [error.message || "Unknown error occurred"]
      }
    }
  }
}

export interface UpdateProjectData {
  name: string
  description?: string
  status?: ProjectStatus
  estimatedKw: number
  estimatedPrice: number
  address?: string
  email?: string
  phone?: string
  latitude?: number
  longitude?: number
}

export interface UpdateProjectState {
  errors?: {
    name?: string[]
    description?: string[]
    estimatedKw?: string[]
    estimatedPrice?: string[]
    address?: string[]
    email?: string[]
    phone?: string[]
    latitude?: string[]
    longitude?: string[]
    _form?: string[]
  }
  message?: string | null
  success?: boolean
  data?: any
}

export async function updateProject(id: string, data: UpdateProjectData): Promise<UpdateProjectState> {
  try {
    // Use the clean architecture UpdateProjectUseCase
    await updateProjectUseCase.execute(id, data)

    // After successful update, fetch the updated project to return
    const updatedProject = await getProjectByIdUseCase.execute(id)

    // Revalidate paths
    revalidatePath("/app/projects")
    revalidatePath(`/app/projects/${id}`)

    return {
      success: true,
      message: "Project updated successfully!",
      data: updatedProject
    }

  } catch (error: any) {
    console.error("Error updating project:", error)

    return {
      success: false,
      message: error.message || "Error updating project",
      errors: {
        _form: [error.message || "Unknown error occurred"]
      }
    }
  }
}

export async function getProjectById(id: string) {
  try {
    const project = await getProjectByIdUseCase.execute(id)

    return {
      success: true,
      message: "Project found",
      data: project
    }

  } catch (error: any) {
    console.error("Error fetching project:", error)
    return {
      success: false,
      message: error.message || "Error fetching project",
      data: null
    }
  }
}