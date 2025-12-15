import { useState, useEffect } from 'react'
import { authClient } from '@/infrastructure/auth/auth-client.config'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  priceId: string
}

export interface UserSubscription {
  id: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  plan?: SubscriptionPlan
}

export function useStripeSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Available plans - Using real Stripe Price IDs
  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29.90,
      features: [
        'Up to 10 projects',
        'Email support',
        'Basic reports',
        'API access'
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PLAN_BASIC_ID || 'price_1QXifvFbS7kaioAS3zLRgKYW'  // Temp: USD price ID
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 99.90,
      features: [
        'Unlimited projects',
        'Priority support',
        'Advanced reports',
        'Full API access',
        'Advanced integrations',
        'Custom dashboard'
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PLAN_PRO_ID || 'price_1SUVuKFbS7kaioASx4h2nK3Q' // Placeholder - criar no Stripe
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299.90,
      features: [
        'Everything in Pro +',
        'Guaranteed SLA',
        'Dedicated account manager',
        'Custom integrations',
        'On-site training',
        'White label options'
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PLAN_ENTERPRISE_ID || 'price_1SUVuqFbS7kaioASfG5HtY8Z' // Placeholder - criar no Stripe
    }
  ]

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      setLoading(true)

      // Buscar assinaturas do nosso endpoint customizado
      const response = await fetch('/api/stripe/subscription', {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const { data } = await response.json()

      if (data && data.length > 0) {
        const activeSubscription = data.find((sub: any) =>
          sub.status === 'active' || sub.status === 'trialing'
        )

        if (activeSubscription) {
          const plan = plans.find(p => p.priceId === activeSubscription.stripePriceId)
          setSubscription({
            ...activeSubscription,
            plan
          })
        }
      }
    } catch (err) {
      console.error('Error loading subscription:', err)
      setError('Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  const createSubscription = async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) {
        throw new Error('Plan not found')
      }

      // Usar nosso endpoint personalizado
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/app/settings/billing?subscription=success`,
          cancelUrl: `${window.location.origin}/app/settings/billing?subscription=cancelled`,
          metadata: {
            planId: plan.id,
            planName: plan.name
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirecionar para checkout do Stripe
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Error creating subscription:', err)
      setError('Failed to create subscription')
      throw err
    }
  }

  const cancelSubscription = async () => {
    try {
      if (!subscription?.id) {
        throw new Error('No active subscription found')
      }

      const { error } = await authClient.subscription.cancel({
        subscriptionId: subscription.id,
        returnUrl: '/dashboard?subscription=cancelled'
      })

      if (error) {
        throw new Error(error.message)
      }

      await loadSubscription()
    } catch (err) {
      console.error('Error cancelling subscription:', err)
      setError('Failed to cancel subscription')
      throw err
    }
  }

  const openBillingPortal = async () => {
    try {
      const { data, error } = await authClient.subscription.billingPortal({
        returnUrl: '/dashboard'
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Error opening billing portal:', err)
      setError('Failed to open billing portal')
      throw err
    }
  }

  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isCancelled = subscription?.cancelAtPeriodEnd
  const daysUntilRenewal = subscription ?
    Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  return {
    subscription,
    plans,
    loading,
    error,
    isSubscribed,
    isCancelled,
    daysUntilRenewal,
    createSubscription,
    cancelSubscription,
    openBillingPortal,
    refetch: loadSubscription
  }
}