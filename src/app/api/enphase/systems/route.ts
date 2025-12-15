import { NextRequest, NextResponse } from 'next/server';
import {
  updateEnphaseSystems,
  getEnphaseSystems,
  addEnphaseSystem,
  removeEnphaseSystem
} from '@/app/app/monitoring/enphase-systems/action';

/**
 * GET /api/enphase/systems
 * Recupera sistemas disponíveis para um tenant
 * Query params: ?tenantId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID is required'
      }, { status: 400 });
    }

    // Verificar autenticação via API key para chamadas do backend
    const authHeader = request.headers.get('authorization');
    const expectedApiKey = process.env.ENPHASE_BACKEND_API_KEY || 'dev-api-key-2024';

    if (authHeader !== `Bearer ${expectedApiKey}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const result = await getEnphaseSystems(tenantId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in GET /api/enphase/systems:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/enphase/systems
 * Atualiza a lista de sistemas disponíveis para um tenant
 * Body: { tenantId: string, availableSystems: string[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, availableSystems } = body;

    if (!tenantId || !Array.isArray(availableSystems)) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID and availableSystems array are required'
      }, { status: 400 });
    }

    // Verificar autenticação via API key para chamadas do backend
    const authHeader = request.headers.get('authorization');
    const expectedApiKey = process.env.ENPHASE_BACKEND_API_KEY || 'dev-api-key-2024';

    if (authHeader !== `Bearer ${expectedApiKey}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const result = await updateEnphaseSystems(tenantId, availableSystems);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in PUT /api/enphase/systems:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * POST /api/enphase/systems
 * Adiciona ou remove um sistema específico
 * Body: { tenantId: string, systemId: string, action: 'add' | 'remove' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, systemId, action } = body;

    if (!tenantId || !systemId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Tenant ID, system ID, and action are required'
      }, { status: 400 });
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Action must be "add" or "remove"'
      }, { status: 400 });
    }

    // Verificar autenticação via API key para chamadas do backend
    const authHeader = request.headers.get('authorization');
    const expectedApiKey = process.env.ENPHASE_BACKEND_API_KEY || 'dev-api-key-2024';

    if (authHeader !== `Bearer ${expectedApiKey}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    let result;
    if (action === 'add') {
      result = await addEnphaseSystem(tenantId, systemId);
    } else {
      result = await removeEnphaseSystem(tenantId, systemId);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in POST /api/enphase/systems:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}