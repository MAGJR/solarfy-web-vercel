"use server"

import { revalidatePath } from "next/cache"
import { PrismaClient } from "@prisma/client"
import { PrismaMonitoringRepository } from "@/infrastructure/repositories/prisma-monitoring.repository"

const prisma = new PrismaClient()
const monitoringRepository = new PrismaMonitoringRepository(prisma)

export async function deleteMonitoring(id: string) {
  try {
    // Check if monitoring exists before deleting
    const monitoring = await monitoringRepository.findById(id)

    if (!monitoring) {
      return {
        success: false,
        message: "Monitoring data not found"
      }
    }

    // Delete the monitoring data
    await monitoringRepository.delete(id)

    // Revalidate the monitoring page to reflect changes
    revalidatePath("/app/monitoring")

    return {
      success: true,
      message: "Monitoring data deleted successfully"
    }
  } catch (error) {
    console.error("Error deleting monitoring data:", error)

    return {
      success: false,
      message: error instanceof Error ? error.message : "Error deleting monitoring data"
    }
  }
}