'use client'

import React from 'react'
import { Card, CardContent } from '@/presentation/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: LucideIcon | React.ReactNode
  iconColor?: string
  iconBgColor?: string
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10'
}: MetricCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500'
      case 'decrease':
        return 'text-red-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <p className={`text-sm font-medium ${getChangeColor()}`}>
                {changeType === 'increase' && '+'}{change}
              </p>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
              {React.isValidElement(icon) ?
                React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' }) :
                <icon className="w-6 h-6" />
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}