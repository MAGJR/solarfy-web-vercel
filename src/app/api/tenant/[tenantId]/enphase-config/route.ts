import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/infrastructure/auth/auth.config';
import { prisma } from '@/infrastructure/database/prisma';

/**
 * GET /api/tenant/[tenantId]/enphase-config
 * Obtém configuração Enphase do tenant
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { tenantId } = params;

    // Buscar configuração Enphase
    const config = await prisma.enphaseConfig.findUnique({
      where: { tenantId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error getting Enphase config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get Enphase config'
    }, { status: 500 });
  }
}

/**
 * POST /api/tenant/[tenantId]/enphase-config
 * Atualiza configuração Enphase do tenant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { tenantId } = params;
    const body = await request.json();

    // Atualizar ou criar configuração Enphase
    const config = await prisma.enphaseConfig.upsert({
      where: { tenantId },
      update: {
        ...body,
        updatedAt: new Date()
      },
      create: {
        tenantId,
        ...body,
        status: 'AUTHORIZED',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error updating Enphase config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update Enphase config'
    }, { status: 500 });
  }
}