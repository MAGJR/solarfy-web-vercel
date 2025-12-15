import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { StripeService } from '@/services/stripe/stripe.service'
import { stripeClient } from '@/infrastructure/auth/stripe-client.config'
import { prisma } from '@/infrastructure/database/prisma'

/**
 * Endpoint para criar sessões de checkout do Stripe
 * URL: http://localhost:3000/api/stripe/checkout
 * Method: POST
 *
 * Body:
 * {
 *   "priceId": "price_xxx",
 *   "successUrl": "http://localhost:3000/success",
 *   "cancelUrl": "http://localhost:3000/cancel",
 *   "metadata": { "userId": "xxx" }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🛒 Criando sessão de checkout Stripe')

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
    const { priceId, successUrl, cancelUrl, metadata } = body

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: priceId, successUrl, cancelUrl' },
        { status: 400 }
      )
    }

    // 3. Obter ou criar customer Stripe do usuário
    const customer = await getOrCreateStripeCustomer(session.user.id, session.user.email!)

    if (!customer) {
      return NextResponse.json(
        { error: 'Não foi possível criar customer Stripe' },
        { status: 500 }
      )
    }

    // 4. Criar sessão de checkout
    const checkoutData = {
      customerId: customer.stripeId,
      priceId,
      successUrl,
      cancelUrl,
      metadata: {
        ...metadata,
        userId: session.user.id,
        userEmail: session.user.email
      }
    }

    const result = await StripeService.createCheckoutSession(checkoutData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    console.log(`✅ Checkout session criada: ${result.session.id}`)

    return NextResponse.json({
      success: true,
      sessionId: result.session.id,
      checkoutUrl: result.session.url,
      metadata: result.session.metadata
    })

  } catch (error) {
    console.error('❌ Erro ao criar checkout session:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro ao criar checkout session',
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * Helper para obter ou criar customer Stripe para o usuário
 */
async function getOrCreateStripeCustomer(userId: string, userEmail: string) {
  try {
    // Buscar customer existente no banco
    const existingCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId }
    })

    if (existingCustomer) {
      console.log(`Customer existente encontrado: ${existingCustomer.stripeId}`)
      return existingCustomer
    }

    // Criar novo customer no Stripe
    const stripeCustomer = await stripeClient.customers.create({
      email: userEmail,
      metadata: {
        userId,
        source: 'solarfy-app'
      }
    })

    console.log(`Novo customer criado: ${stripeCustomer.id}`)

    // Salvar no banco de dados
    const newCustomer = await prisma.stripeCustomer.create({
      data: {
        userId,
        stripeId: stripeCustomer.id
      }
    })

    return newCustomer

  } catch (error) {
    console.error('Erro ao obter/criar customer:', error)
    return null
  }
}