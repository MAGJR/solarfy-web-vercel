import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'

/**
 * Endpoint para buscar assinaturas do usuário
 * URL: http://localhost:3000/api/stripe/subscription
 * Method: GET
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando assinaturas do usuário...')

    // 1. Verificar autenticação
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // 2. Buscar assinaturas do usuário no banco
    const subscriptions = await prisma.stripeSubscription.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Found ${subscriptions.length} subscriptions for user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: subscriptions
    })

  } catch (error) {
    console.error('❌ Erro ao buscar assinaturas:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false
      },
      { status: 500 }
    )
  }
}