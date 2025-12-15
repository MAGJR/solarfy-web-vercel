"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import {
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
  CheckCircle,
  Star,
  Check,
  DollarSign
} from 'lucide-react'
import { useStripeSubscription } from '@/presentation/hooks/use-stripe-subscription'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { useToast } from '@/presentation/hooks/use-toast'

export function SubscriptionManager() {
  const {
    subscription,
    plans,
    isSubscribed,
    isCancelled,
    daysUntilRenewal,
    cancelSubscription,
    openBillingPortal,
    createSubscription,
    loading
  } = useStripeSubscription()

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true)
      await cancelSubscription()
      setShowCancelDialog(false)
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been successfully cancelled. You will continue to have access until the end of the paid period.",
      })
    } catch (error) {
      toast({
        title: "Error cancelling",
        description: "Unable to cancel your subscription. Please try again.",
        variant: "destructive"
      })
    } finally {
      setCancelling(false)
    }
  }

  const handleUpgradeSubscription = async (planId: string) => {
    try {
      setUpgrading(true)
      setSelectedPlan(planId)
      await createSubscription(planId)
    } catch (error) {
      toast({
        title: "Error processing upgrade",
        description: "Unable to process the subscription upgrade. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpgrading(false)
      setSelectedPlan(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'trialing':
        return 'Trial'
      case 'past_due':
        return 'Payment Pending'
      case 'canceled':
        return 'Cancelled'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading subscription information...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Billing Summary */}
      <Card className="mb-6 border border-border/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center text-primary">
            <DollarSign className="w-5 h-5 mr-2" />
            Billing Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-semibold text-foreground">
                    {subscription?.plan?.name || 'None'}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Monthly Amount</p>
                  <p className="text-lg font-semibold text-primary">
                    $ {subscription?.plan?.price.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-accent/20 rounded-lg p-4 border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent-foreground">Next Billing</p>
                  <p className="text-lg font-semibold text-accent-foreground">
                    {isSubscribed && !isCancelled ? `${daysUntilRenewal} days` : 'N/A'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
          </div>

          </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Subscription Management
              </CardTitle>
              <CardDescription>
                Change your plan, cancel or manage payment methods
              </CardDescription>
            </div>
            {isSubscribed && (
              <Badge className={getStatusColor(subscription?.status || '')}>
                {getStatusText(subscription?.status || '')}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isSubscribed && subscription ? (
            <>
              {/* Current Plan Info */}
              <div className="bg-secondary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">
                    {subscription.plan?.name || 'Current Plan'}
                  </h4>
                  <span className="text-2xl font-bold">
                    $ {subscription.plan?.price.toFixed(2) || '0.00'}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </span>
                </div>

                {isCancelled && (
                  <div className="flex items-center text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Your subscription will be cancelled in {daysUntilRenewal} days
                  </div>
                )}

                {!isCancelled && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Next billing in {daysUntilRenewal} days
                  </div>
                )}
              </div>

              <Separator />

              {/* Billing Period */}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                Billing period: {new Date(subscription.currentPeriodStart).toLocaleDateString('en-US')} - {' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US')}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={openBillingPortal}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Payment and Invoice
                </Button>

                {!isCancelled && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>

              <Separator />

              {/* Available Plans for Upgrade */}
              <div>
                <h4 className="font-semibold text-lg mb-4">Other Available Plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans
                    .filter(plan => plan.id !== subscription.plan?.id)
                    .map((plan) => {
                      const isUpgrade = plan.price > (subscription.plan?.price || 0)
                      const isDowngrade = plan.price < (subscription.plan?.price || 0)

                      return (
                        <div key={plan.id} className="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-border bg-card hover:bg-accent/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <h5 className="font-bold text-lg text-foreground">{plan.name}</h5>
                              {isUpgrade && (
                                <Badge className="ml-2 bg-green-100 text-green-800 text-xs font-semibold border border-green-200">
                                  Upgrade
                                </Badge>
                              )}
                              {isDowngrade && (
                                <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200">
                                  Downgrade
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-foreground">$ {plan.price.toFixed(2)}</div>
                              <div className="text-sm font-medium text-muted-foreground">/month</div>
                            </div>
                          </div>

                          {/* Show key features (max 3) */}
                          <div className="mb-6">
                            <ul className="space-y-3">
                              {plan.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-start text-foreground">
                                  <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-primary" />
                                  <span className="text-sm font-medium">{feature}</span>
                                </li>
                              ))}
                              {plan.features.length > 3 && (
                                <li className="text-sm italic text-muted-foreground">
                                  +{plan.features.length - 3} more features...
                                </li>
                              )}
                            </ul>
                          </div>

                          <Button
                            size="sm"
                            className={`w-full font-semibold border-2 transition-all duration-200 ${
                              isUpgrade
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary hover:border-primary/80'
                                : isDowngrade
                                ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600'
                                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-secondary hover:border-secondary/80'
                            }`}
                            onClick={() => handleUpgradeSubscription(plan.id)}
                            disabled={upgrading && selectedPlan === plan.id}
                          >
                            {upgrading && selectedPlan === plan.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : isUpgrade ? (
                              'Upgrade'
                            ) : isDowngrade ? (
                              'Downgrade'
                            ) : (
                              'Change Plan'
                            )}
                          </Button>
                        </div>
                      )
                    })}
                </div>
              </div>
            </>
          ) : (
            /* No Active Subscription - Show Available Plans */
            <div>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">
                  No active subscription
                </h4>
                <p className="text-gray-600 mb-6">
                  Choose a plan to access all Solarfy features
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Available Plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const isPopular = plan.id === 'pro'

                    return (
                      <div
                        key={plan.id}
                        className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border bg-card ${
                          isPopular
                            ? 'border-primary shadow-lg bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 hover:to-transparent'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                            <Star className="w-3 h-3 mr-1 inline" />
                            MOST POPULAR
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between mb-4">
                          <h5 className="font-bold text-xl text-foreground">{plan.name}</h5>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-foreground">$ {plan.price.toFixed(2)}</div>
                            <div className="text-sm font-medium text-muted-foreground">/month</div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <ul className="space-y-3">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start text-foreground">
                                <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-primary" />
                                <span className="text-sm font-medium">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          className={`w-full font-bold py-3 text-base border-2 transition-all duration-200 ${
                            isPopular
                              ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary hover:border-primary/80 shadow-sm'
                              : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground border-secondary hover:border-secondary/80'
                          }`}
                          onClick={() => handleUpgradeSubscription(plan.id)}
                          disabled={upgrading && selectedPlan === plan.id}
                        >
                          {upgrading && selectedPlan === plan.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Subscribe Now'
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You will continue to have access
              to all features until the end of the paid period ({daysUntilRenewal} days).
            </DialogDescription>
          </DialogHeader>

          <div className="bg-secondary/30 border border-orange-200/50 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 mb-1">
                  Important:
                </p>
                <ul className="text-orange-700 space-y-1">
                  <li>• After cancellation, you will lose access to all features</li>
                  <li>• Your data will be kept for 90 days</li>
                  <li>• You can reactivate your subscription at any time</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelling}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}