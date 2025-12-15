'use server';

import { prisma } from '@/infrastructure/database/prisma';

/**
 * Server Actions para gerenciar sistemas Enphase do tenant
 */

/**
 * Atualiza a lista de sistemas disponíveis para o tenant
 */
export async function updateEnphaseSystems(tenantId: string, availableSystems: string[]) {
  try {
    if (!tenantId || !Array.isArray(availableSystems)) {
      return {
        success: false,
        error: 'Invalid parameters'
      };
    }

    // Atualizar ou criar configuração Enphase com os sistemas disponíveis
    const config = await prisma.enphaseConfig.upsert({
      where: { tenantId },
      update: {
        availableSystems,
        lastSyncAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        tenantId,
        availableSystems,
        status: 'AUTHORIZED',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date()
      }
    });

    return {
      success: true,
      data: {
        availableSystems: config.availableSystems,
        lastSyncAt: config.lastSyncAt
      }
    };

  } catch (error) {
    console.error('Error updating Enphase systems:', error);
    return {
      success: false,
      error: 'Failed to update Enphase systems'
    };
  }
}

/**
 * Recupera a lista de sistemas disponíveis para o tenant
 */
export async function getEnphaseSystems(tenantId: string) {
  try {
    if (!tenantId) {
      return {
        success: false,
        error: 'Tenant ID is required'
      };
    }

    // Buscar configuração Enphase
    const config = await prisma.enphaseConfig.findUnique({
      where: { tenantId },
      select: {
        availableSystems: true,
        lastSyncAt: true,
        status: true
      }
    });

    return {
      success: true,
      data: {
        availableSystems: config?.availableSystems || [],
        lastSyncAt: config?.lastSyncAt,
        status: config?.status
      }
    };

  } catch (error) {
    console.error('Error getting Enphase systems:', error);
    return {
      success: false,
      error: 'Failed to get Enphase systems'
    };
  }
}

/**
 * Adiciona um sistema à lista de sistemas disponíveis do tenant
 */
export async function addEnphaseSystem(tenantId: string, systemId: string) {
  try {
    if (!tenantId || !systemId) {
      return {
        success: false,
        error: 'Tenant ID and System ID are required'
      };
    }

    // Recuperar sistemas atuais
    const currentResult = await getEnphaseSystems(tenantId);

    if (!currentResult.success) {
      return currentResult;
    }

    const { availableSystems } = currentResult.data;

    // Verificar se sistema já existe
    if (availableSystems.includes(systemId)) {
      return {
        success: true,
        data: {
          availableSystems,
          message: 'System already exists'
        }
      };
    }

    // Adicionar novo sistema
    const updatedSystems = [...availableSystems, systemId];

    return await updateEnphaseSystems(tenantId, updatedSystems);

  } catch (error) {
    console.error('Error adding Enphase system:', error);
    return {
      success: false,
      error: 'Failed to add Enphase system'
    };
  }
}

/**
 * Remove um sistema da lista de sistemas disponíveis do tenant
 */
export async function removeEnphaseSystem(tenantId: string, systemId: string) {
  try {
    if (!tenantId || !systemId) {
      return {
        success: false,
        error: 'Tenant ID and System ID are required'
      };
    }

    // Recuperar sistemas atuais
    const currentResult = await getEnphaseSystems(tenantId);

    if (!currentResult.success) {
      return currentResult;
    }

    const { availableSystems } = currentResult.data;

    // Remover sistema
    const updatedSystems = availableSystems.filter(id => id !== systemId);

    return await updateEnphaseSystems(tenantId, updatedSystems);

  } catch (error) {
    console.error('Error removing Enphase system:', error);
    return {
      success: false,
      error: 'Failed to remove Enphase system'
    };
  }
}