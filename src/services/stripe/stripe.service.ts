import { stripeClient } from '@/infrastructure/auth/stripe-client.config'
import { prisma } from '@/infrastructure/database/prisma'
import { headers } from 'next/headers'

export interface StripeWebhookEvent {
  type: string
  data: {
    object: any
  }
}

export interface CustomerData {
  email: string
  name?: string
  userId: string
}

export interface SubscriptionData {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export class StripeService {
  /**
   * Verifica e processa webhook events do Stripe
   */
  static async constructWebhookEvent(body: string, signature: string): Promise<StripeWebhookEvent> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET não configurado')
    }

    try {
      const event = stripeClient.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )

      return event as StripeWebhookEvent
    } catch (error) {
      console.error('Erro ao construir webhook event:', error)
      throw new Error('Assinatura do webhook inválida')
    }
  }

  /**
   * Processa diferentes tipos de eventos do Stripe
   */
  static async processWebhookEvent(event: StripeWebhookEvent): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object)
        break

      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }
  }

  /**
   * Cria uma sessão de checkout
   */
  static async createCheckoutSession(data: SubscriptionData) {
    try {
      const session = await stripeClient.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: data.customerId,
        line_items: [
          {
            price: data.priceId,
            quantity: 1,
          },
        ],
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          ...data.metadata,
          created_at: new Date().toISOString(),
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        customer_update: {
          address: 'never',
          name: 'auto',
        },
        locale: 'en',
        currency: 'usd'
      })

      return { success: true, session }
    } catch (error) {
      console.error('Erro ao criar checkout session:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Cria um portal de billing para o cliente
   */
  static async createBillingPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripeClient.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })

      return { success: true, session }
    } catch (error) {
      console.error('Erro ao criar billing portal session:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Obtém detalhes da assinatura
   */
  static async getSubscriptionDetails(subscriptionId: string) {
    try {
      const subscription = await stripeClient.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'default_payment_method', 'latest_invoice'],
      })

      return { success: true, subscription }
    } catch (error) {
      console.error('Erro ao obter detalhes da assinatura:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Cancela uma assinatura
   */
  static async cancelSubscription(subscriptionId: string, immediate = false) {
    try {
      const subscription = await stripeClient.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediate,
        ...(immediate && { canceled_at: new Date() }),
      })

      return { success: true, subscription }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // ---- Private Handlers ----

  private static async handleSubscriptionCreated(subscription: any) {
    try {
      console.log(`Nova assinatura criada: ${subscription.id}`)

      // Better-Auth não está salvando no nosso schema, vamos fazer manualmente
      const stripeCustomerId = subscription.customer

      // Buscar usuário correspondente
      const stripeCustomerRecord = await prisma.stripeCustomer.findUnique({
        where: { stripeId: stripeCustomerId }
      })

      if (!stripeCustomerRecord) {
        console.error(`Customer não encontrado para Stripe ID: ${stripeCustomerId}`)
        return
      }

      // Verificar se assinatura já existe
      const existingSubscription = await prisma.stripeSubscription.findUnique({
        where: { stripeId: subscription.id }
      })

      if (existingSubscription) {
        console.log(`Assinatura ${subscription.id} já existe no banco, atualizando...`)
        // Atualizar assinatura existente
        await prisma.stripeSubscription.update({
          where: { stripeId: subscription.id },
          data: {
            status: subscription.status,
            stripePriceId: subscription.items.data[0]?.price?.id || '',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date()
          }
        })
      } else {
        console.log(`Criando nova assinatura no banco para usuário ${stripeCustomerRecord.userId}`)
        // Criar nova assinatura
        await prisma.stripeSubscription.create({
          data: {
            userId: stripeCustomerRecord.userId,
            stripeId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price?.id || '',
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        })
      }

      await this.logSubscriptionChange(subscription, 'created')
    } catch (error) {
      console.error('Erro ao processar subscription.created:', error)
    }
  }

  private static async handleSubscriptionUpdated(subscription: any) {
    try {
      console.log(`Assinatura atualizada: ${subscription.id}`)

      // Atualizar status no banco de dados
      await prisma.stripeSubscription.updateMany({
        where: { stripeId: subscription.id },
        data: {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: new Date(),
        },
      })

      await this.logSubscriptionChange(subscription, 'updated')
    } catch (error) {
      console.error('Erro ao processar subscription.updated:', error)
    }
  }

  private static async handleSubscriptionDeleted(subscription: any) {
    try {
      console.log(`Assinatura cancelada: ${subscription.id}`)

      // Marcar como cancelada no banco de dados
      await prisma.stripeSubscription.updateMany({
        where: { stripeId: subscription.id },
        data: {
          status: 'canceled',
          updatedAt: new Date(),
        },
      })

      await this.logSubscriptionChange(subscription, 'deleted')
    } catch (error) {
      console.error('Erro ao processar subscription.deleted:', error)
    }
  }

  private static async handleInvoicePaymentSucceeded(invoice: any) {
    try {
      console.log(`Pagamento recebido: Invoice ${invoice.id}`)

      // Se for uma invoice de assinatura, podemos adicionar lógica aqui
      if (invoice.subscription) {
        console.log(`Pagamento de assinatura ${invoice.subscription} processado com sucesso`)
      }
    } catch (error) {
      console.error('Erro ao processar invoice.payment_succeeded:', error)
    }
  }

  private static async handleInvoicePaymentFailed(invoice: any) {
    try {
      console.log(`Pagamento falhou: Invoice ${invoice.id}`)

      // Se for uma invoice de assinatura, podemos adicionar lógica aqui
      if (invoice.subscription) {
        console.log(`Pagamento da assinatura ${invoice.subscription} falhou`)

        // Aqui podemos implementar lógica de notificação ou bloqueio
        // temporário do acesso
      }
    } catch (error) {
      console.error('Erro ao processar invoice.payment_failed:', error)
    }
  }

  private static async handleCheckoutSessionCompleted(session: any) {
    try {
      console.log(`Checkout completado: ${session.id}`)

      // Log adicional quando checkout é completado
      if (session.subscription) {
        console.log(`Assinatura ${session.subscription} criada via checkout`)
      }
    } catch (error) {
      console.error('Erro ao processar checkout.session.completed:', error)
    }
  }

  private static async logSubscriptionChange(subscription: any, action: string) {
    try {
      // Aqui podemos implementar logs detalhados ou enviar para analytics
      console.log(`[${action}] Subscription ${subscription.id}: Status=${subscription.status}, Customer=${subscription.customer}`)
    } catch (error) {
      console.error('Erro ao fazer log de mudança de assinatura:', error)
    }
  }
}