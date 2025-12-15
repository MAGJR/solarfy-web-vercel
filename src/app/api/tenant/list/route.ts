import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/infrastructure/auth/auth.config';
import { prisma } from '@/infrastructure/database/prisma';

/**
 * GET /api/tenant/list
 * Lista todos os tenants
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

    // Listar todos os tenants
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: tenants
    });

  } catch (error) {
    console.error('Error listing tenants:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list tenants'
    }, { status: 500 });
  }
}