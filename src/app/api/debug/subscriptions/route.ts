import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug: Buscando assinaturas no banco de dados...')

    // Buscar todas as assinaturas
    const subscriptions = await prisma.stripeSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${subscriptions.length} subscriptions:`)
    subscriptions.forEach(sub => {
      console.log(`- ${sub.id}: ${sub.status} - User: ${sub.user.email} - Stripe: ${sub.stripeId}`)
    })

    // Buscar customers
    const customers = await prisma.stripeCustomer.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    console.log(`💳 Found ${customers.length} customers:`)
    customers.forEach(cust => {
      console.log(`- ${cust.id}: User: ${cust.user.email} - Stripe: ${cust.stripeId}`)
    })

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        customers,
        totalSubscriptions: subscriptions.length,
        totalCustomers: customers.length
      }
    })
  } catch (error) {
    console.error('❌ Erro ao buscar assinaturas:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}