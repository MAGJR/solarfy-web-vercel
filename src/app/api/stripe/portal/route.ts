import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { StripeService } from '@/services/stripe/stripe.service'
import { stripeClient } from '@/infrastructure/auth/stripe-client.config'
import { prisma } from '@/infrastructure/database/prisma'

/**
 * Endpoint para criar sessões do portal de billing do Stripe
 * URL: http://localhost:3000/api/stripe/portal
 * Method: POST
 *
 * Body:
 * {
 *   "returnUrl": "http://localhost:3000/dashboard"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🏢 Criando sessão do portal de billing Stripe')

    // 1. Verificar autenticação do usuário
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // 2. Obter dados do request
    const body = await request.json()
    const { returnUrl } = body

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Campo obrigatório: returnUrl' },
        { status: 400 }
      )
    }

    // 3. Obter customer Stripe do usuário
    const customer = await getStripeCustomer(session.user.id)

    if (!customer) {
      return NextResponse.json(
        { error: 'Usuário não possui customer Stripe' },
        { status: 404 }
      )
    }

    // 4. Criar sessão do portal de billing
    const result = await StripeService.createBillingPortalSession(
      customer.stripeId,
      returnUrl
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    console.log(`✅ Portal session criada: ${result.session.id}`)

    return NextResponse.json({
      success: true,
      sessionId: result.session.id,
      portalUrl: result.session.url
    })

  } catch (error) {
    console.error('❌ Erro ao criar portal session:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao criar portal session',
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * GET para obter informações do customer e assinaturas atuais
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Obtendo informações do customer Stripe')

    // 1. Verificar autenticação do usuário
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // 2. Obter customer Stripe do usuário
    const customer = await getStripeCustomer(session.user.id)

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          hasCustomer: false,
          message: 'Usuário não possui customer Stripe'
        },
        { status: 404 }
      )
    }

    // 3. Obter detalhes do customer e assinaturas
    const [subscriptionsResult] = await Promise.all([
      getCustomerSubscriptions(customer.stripeId)
    ])

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        stripeId: customer.stripeId,
        userId: customer.userId,
        created: customer.createdAt
      },
      subscriptions: subscriptionsResult,
      hasActiveSubscription: subscriptionsResult.some(sub =>
        sub.status === 'active' || sub.status === 'trialing'
      )
    })

  } catch (error) {
    console.error('❌ Erro ao obter informações do customer:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao obter informações do customer',
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * Helper para obter customer do banco de dados
 */
async function getStripeCustomer(userId: string) {
  try {
    return await prisma.stripeCustomer.findUnique({
      where: { userId }
    })
  } catch (error) {
    console.error('Erro ao obter customer:', error)
    return null
  }
}

/**
 * Helper para obter assinaturas do customer
 */
async function getCustomerSubscriptions(stripeCustomerId: string) {
  try {
    const subscriptions = await stripeClient.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      expand: ['data.default_payment_method']
    })

    return subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      items: sub.items.data.map(item => ({
        id: item.id,
        priceId: item.price.id,
        amount: item.price.unit_amount,
        currency: item.price.currency,
        interval: item.price.recurring?.interval
      })),
      createdAt: new Date(sub.created * 1000),
      endedAt: sub.ended_at ? new Date(sub.ended_at * 1000) : null
    }))
  } catch (error) {
    console.error('Erro ao obter assinaturas:', error)
    return []
  }
}