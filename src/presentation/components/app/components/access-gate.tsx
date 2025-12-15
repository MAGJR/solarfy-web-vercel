"use client"

import { ReactNode } from 'react'
import { useUserAccess } from '@/presentation/hooks/use-user-access'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Lock, CreditCard, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface AccessGateProps {
  children: ReactNode
  feature: 'dashboard' | 'monitoring' | 'support'
  fallback?: ReactNode
}

export function AccessGate({ children, feature, fallback }: AccessGateProps) {
  const { canAccessDashboard, canAccessMonitoring, canAccessSupport, hasActiveSubscription } = useUserAccess()

  const getAccessPermission = () => {
    switch (feature) {
      case 'dashboard':
        return canAccessDashboard
      case 'monitoring':
        return canAccessMonitoring
      case 'support':
        return canAccessSupport
      default:
        return true
    }
  }

  const canAccess = getAccessPermission()

  if (canAccess) {
    return <>{children}</>
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>
  }

  // Default locked screen
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Premium Feature</CardTitle>
          <CardDescription>
            This feature requires an active subscription to access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary/20 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">
                  {hasActiveSubscription
                    ? 'Your subscription has expired'
                    : 'No active subscription found'
                  }
                </p>
                <p className="text-muted-foreground">
                  Subscribe to unlock all Solarfy features including {feature}.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Link href="/app/settings/billing">
              <Button className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Subscribe Now
              </Button>
            </Link>
            <Link href="/app/settings">
              <Button variant="outline" className="w-full">
                View Plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}