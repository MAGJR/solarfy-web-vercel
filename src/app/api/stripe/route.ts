import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint principal da API Stripe
 * URL: http://localhost:3000/api/stripe
 * Methods: GET
 *
 * Lista todos os endpoints disponíveis na API Stripe
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin') || 'http://localhost:3000'

  const baseUrl = `${origin}${url.pathname}`

  return NextResponse.json({
    success: true,
    message: 'API do Stripe - Solarfy',
    version: '1.0.0',
    endpoints: {
      webhook: {
        url: `${baseUrl}/webhook`,
        methods: ['GET', 'POST', 'HEAD'],
        description: 'Receber webhooks do Stripe',
        events: [
          'customer.subscription.created',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_succeeded',
          'invoice.payment_failed',
          'checkout.session.completed'
        ]
      },
      checkout: {
        url: `${baseUrl}/checkout`,
        methods: ['POST'],
        description: 'Criar sessões de checkout',
        body: {
          priceId: 'string (required)',
          successUrl: 'string (required)',
          cancelUrl: 'string (required)',
          metadata: 'object (optional)'
        }
      },
      portal: {
        url: `${baseUrl}/portal`,
        methods: ['GET', 'POST'],
        description: 'Gerenciar portal de billing',
        postBody: {
          returnUrl: 'string (required)'
        },
        getResponse: 'Retorna informações do customer e assinaturas'
      }
    },
    configuration: {
      environment: process.env.NODE_ENV,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
      baseUrl
    },
    testing: {
      webhook: {
        listen: `stripe listen --forward-to ${baseUrl}/webhook`,
        events: `stripe listen --forward-to ${baseUrl}/webhook --events checkout.session.completed,invoice.payment_succeeded`,
        testPayload: `curl -X POST ${baseUrl}/webhook -H "Content-Type: application/json" -d '{"type":"test","data":{"object":{}}}'`
      },
      checkout: {
        create: `curl -X POST ${baseUrl}/checkout -H "Content-Type: application/json" -d '{"priceId":"price_xxx","successUrl":"${origin}/success","cancelUrl":"${origin}/cancel"}'`
      }
    },
    documentation: {
      integration: '/STRIPE_INTEGRATION_STATUS.md',
      setup: '/docs/stripe-setup.md'
    }
  })
}