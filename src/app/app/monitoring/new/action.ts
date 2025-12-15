"use server"

import { revalidatePath } from "next/cache"
import { PrismaClient } from "@prisma/client"
import { CreateMonitoringDataUseCase } from "@/application/use-cases/monitoring/create-monitoring-data.usecase"
import { PrismaMonitoringRepository } from "@/infrastructure/repositories/prisma-monitoring.repository"
import { PrismaCrmLeadRepository } from "@/infrastructure/repositories/prisma-crm-lead.repository"
import { addEnphaseSystem } from "@/app/app/monitoring/enphase-systems/action"
import { auth } from "@/infrastructure/auth/auth.config"
import { CustomerType, EquipmentStatus, AlertLevel } from "@prisma/client"
import { toast } from "sonner"

const prisma = new PrismaClient()
const monitoringRepository = new PrismaMonitoringRepository(prisma)
const crmLeadRepository = new PrismaCrmLeadRepository(prisma)
const createMonitoringUseCase = new CreateMonitoringDataUseCase(monitoringRepository, crmLeadRepository)

export interface CreateMonitoringData {
  crmLeadId: string
  customerType: CustomerType
  address: string
  peakKwp: number
  energyTodayKwh?: number
  equipmentStatus?: EquipmentStatus
  alertLevel?: AlertLevel

  // Enphase API integration fields
  enphaseSystemId?: string
  enphaseApiEnabled?: boolean
}

export async function createMonitoring(data: CreateMonitoringData) {
  try {
    const result = await createMonitoringUseCase.execute(data)

    // Se enphaseSystemId foi fornecido e API está habilitada, salvar no tenant
    if (data.enphaseSystemId && data.enphaseApiEnabled && data.enphaseSystemId.trim()) {
      try {
        // Obter tenantId da sessão do usuário
        const session = await auth.api.getSession({
          headers: new Headers()
        })

        if (!session?.user?.tenantId) {
          console.error("⚠️ User session or tenantId not found")
          // Não falhar toda a operação, apenas logar o erro
        } else {
          const tenantId = session.user.tenantId

          const systemResult = await addEnphaseSystem(tenantId, data.enphaseSystemId.trim())

          if (systemResult.success) {
            console.log(`✅ System ${data.enphaseSystemId} added to tenant ${tenantId} database`)
          } else {
            console.error(`⚠️ Failed to add system to tenant:`, systemResult.error)
          }
        }
      } catch (systemError) {
        console.error("⚠️ Error saving system to tenant:", systemError)
        // Não falhar toda a operação se apenas falhar salvar no tenant
      }
    }

    // Revalidate the monitoring page to show the new data
    revalidatePath("/app/monitoring")

    return {
      success: true,
      message: "Monitoring data created successfully!",
      data: result
    }
  } catch (error) {
    console.error("Error creating monitoring data:", error)

    return {
      success: false,
      message: error instanceof Error ? error.message : "Error creating monitoring data",
      errors: error instanceof Error ? { general: [error.message] } : undefined
    }
  }
}