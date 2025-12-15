import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/services/stripe/stripe.service'

/**
 * Endpoint principal para receber webhooks do Stripe
 * URL: http://localhost:3000/api/stripe/webhook
 *
 * Configurar no Stripe Dashboard:
 * - Endpoint URL: https://seu-dominio.com/api/stripe/webhook
 * - HTTP method: POST
 * - Secret: STRIPE_WEBHOOK_SECRET
 *
 * Eventos recomendados:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * - checkout.session.completed
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let eventId: string | null = null
  let eventType: string | null = null

  try {
    console.log('🔔 Stripe Webhook recebido')

    // 1. Obter o corpo do request (importante para verificação de assinatura)
    const body = await request.text()

    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ Webhook sem assinatura Stripe')
      return NextResponse.json(
        { error: 'Assinatura do Stripe ausente' },
        { status: 400 }
      )
    }

    // 3. Construir e verificar o evento
    const event = await StripeService.constructWebhookEvent(body, signature)

    eventId = event.id
    eventType = event.type

    console.log(`📝 Processando evento: ${eventType} (ID: ${eventId})`)

    // 4. Processar o evento
    await StripeService.processWebhookEvent(event)

    const duration = Date.now() - startTime
    console.log(`✅ Webhook processado com sucesso: ${eventType} (${duration}ms)`)

    // 5. Retornar resposta de sucesso
    return NextResponse.json({
      success: true,
      received: true,
      eventId,
      eventType,
      processedAt: new Date().toISOString(),
      processingTimeMs: duration
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'

    console.error(`❌ Erro ao processar webhook (${duration}ms):`, {
      eventId,
      eventType,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })

    // Não expor detalhes do erro em produção
    const isDevelopment = process.env.NODE_ENV === 'development'

    return NextResponse.json({
      success: false,
      error: isDevelopment ? errorMessage : 'Erro interno do servidor',
      eventId,
      eventType,
      processedAt: new Date().toISOString(),
      processingTimeMs: duration
    }, {
      status: error instanceof Error && errorMessage.includes('assinatura') ? 401 : 500
    })
  }
}

/**
 * Método GET para testes/verificação do endpoint
 * Retorna informações sobre a configuração do webhook
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const origin = request.headers.get('origin')

    return NextResponse.json({
      success: true,
      message: 'Endpoint de webhook do Stripe está online',
      endpoint: `${origin}${url.pathname}`,
      method: 'POST',
      configuration: {
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        supportedEvents: [
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_succeeded',
          'invoice.payment_failed',
          'checkout.session.completed'
        ]
      },
      testing: {
        cliCommand: `stripe listen --forward-to ${origin}${url.pathname}`,
        testEvent: 'curl -X POST ${origin}${url.pathname} -H "Content-Type: application/json" -d \'{"type": "test", "data": {"object": {}}}\''
      }
    })
  } catch (error) {
    console.error('Erro no GET do webhook:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar status do webhook'
    }, { status: 500 })
  }
}

/**
 * Health check para o webhook (HEAD request)
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}