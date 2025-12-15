import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/services/stripe/stripe.service'
import { stripeClient } from '@/infrastructure/auth/stripe-client.config'
import { prisma } from '@/infrastructure/database/prisma'

export async function POST() {
  try {
    console.log('🔄 Sync: Iniciando sincronização manual da assinatura...')

    // Buscar customer
    const customer = await prisma.stripeCustomer.findFirst({
      where: {
        user: {
          email: 'junin15z33@gmail.com' // Usuario atual
        }
      }
    })

    if (!customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer não encontrado'
      })
    }

    console.log(`👤 Customer encontrado: ${customer.stripeId}`)

    // Buscar assinaturas no Stripe
    const subscriptions = await stripeClient.subscriptions.list({
      customer: customer.stripeId,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma assinatura ativa encontrada no Stripe'
      })
    }

    const stripeSubscription: any = subscriptions.data[0]
    console.log(`💳 Assinatura encontrada: ${stripeSubscription.id}`)

    // Verificar se já existe no banco
    const existingSubscription = await prisma.stripeSubscription.findUnique({
      where: { stripeId: stripeSubscription.id }
    })

    if (existingSubscription) {
      console.log('✅ Assinatura já existe no banco')
      return NextResponse.json({
        success: true,
        message: 'Assinatura já sincronizada',
        subscription: existingSubscription
      })
    }

    // Criar assinatura no banco
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))

    const newSubscription = await prisma.stripeSubscription.create({
      data: {
        userId: customer.userId,
        stripeId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0]?.price?.id || '',
        status: stripeSubscription.status,
        currentPeriodStart: now,
        currentPeriodEnd: thirtyDaysFromNow,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      }
    })

    console.log(`✅ Assinatura sincronizada: ${newSubscription.id}`)

    return NextResponse.json({
      success: true,
      message: 'Assinatura sincronizada com sucesso',
      subscription: newSubscription
    })

  } catch (error) {
    console.error('❌ Erro ao sincronizar assinatura:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}