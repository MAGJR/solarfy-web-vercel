import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/infrastructure/auth/auth.config';
import { prisma } from '@/infrastructure/database/prisma';

/**
 * GET /api/tenant/default
 * Retorna o tenant padrão do sistema
 */
export async function GET(request: NextRequest) {
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

    // Buscar primeiro tenant disponível
    const tenant = await prisma.tenant.findFirst({
      select: {
        id: true,
        name: true,
        domain: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'No tenant found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: tenant
    });

  } catch (error) {
    console.error('Error getting default tenant:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get default tenant'
    }, { status: 500 });
  }
}