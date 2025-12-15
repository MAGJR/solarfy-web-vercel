"use client"

import { useState } from 'react'
import { Check, X, Star, Loader2 } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { useStripeSubscription } from '@/presentation/hooks/use-stripe-subscription'
import { useAuth } from '@/presentation/hooks/use-auth'

export default function PricingPage() {
  const { user, isSignedIn } = useAuth()
  const { plans, createSubscription, loading, isSubscribed } = useStripeSubscription()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [creatingSubscription, setCreatingSubscription] = useState(false)

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      // Redirecionar para login
      window.location.href = '/auth/sign-in?callbackUrl=' + encodeURIComponent(window.location.pathname)
      return
    }

    try {
      setCreatingSubscription(true)
      setSelectedPlan(planId)
      await createSubscription(planId)
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setCreatingSubscription(false)
      setSelectedPlan(null)
    }
  }

  const popularPlanId = 'pro'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Planos e Preços
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para seu negócio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Todos os planos incluem acesso completo às funcionalidades do Solarfy.
            Escolha de acordo com o tamanho da sua operação.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const isPopular = plan.id === popularPlanId
            const isCurrentPlan = isSubscribed && user?.subscription?.plan?.id === plan.id

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isPopular
                    ? 'border-2 border-blue-500 shadow-xl scale-105'
                    : 'border border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1 text-sm font-semibold">
                      <Star className="w-4 h-4 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      $ {plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.id === 'basic' && 'Perfeito para pequenas empresas'}
                    {plan.id === 'pro' && 'Ideal para empresas em crescimento'}
                    {plan.id === 'enterprise' && 'Para grandes corporações'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full ${
                      isPopular
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-900 hover:bg-gray-800'
                    } text-white`}
                    size="lg"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={
                      creatingSubscription ||
                      (isCurrentPlan && !loading) ||
                      loading
                    }
                  >
                    {creatingSubscription && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : isCurrentPlan ? (
                      'Plano Atual'
                    ) : isSubscribed ? (
                      'Fazer Upgrade'
                    ) : (
                      'Assinar Agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">
                Posso cancelar minha assinatura a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento.
                O acesso continua até o final do período pago.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">
                Qual forma de pagamento é aceita?
              </h3>
              <p className="text-gray-600">
                Aceitamos todas as principais formas de pagamento através do Stripe:
                cartões de crédito, débito e transferências bancárias.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">
                Existe período de teste?
              </h3>
              <p className="text-gray-600">
                Sim! Todos os planos oferecem 14 dias de teste gratuito.
                Não é necessário informar dados de pagamento para começar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">
                Posso mudar de plano a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                No caso de upgrade, cobramos a diferença proporcional.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!isSignedIn && (
          <div className="mt-16 text-center bg-blue-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-gray-600 mb-6">
              Crie sua conta gratuita e tenha 14 dias para testar todas as funcionalidades
            </p>
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => window.location.href = '/auth/sign-in'}
            >
              Criar Conta Gratuita
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}