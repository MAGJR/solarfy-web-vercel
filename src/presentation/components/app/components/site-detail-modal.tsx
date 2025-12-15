'use client'

import { useState } from 'react'
import EnergyChart from './energy-chart'
import MetricCard from './metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Battery, Zap, TrendingUp, Activity } from 'lucide-react'

interface SiteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  siteData?: {
    id: string
    customerName: string
    type: string
    address: string
    peakKwp: string
    energyTodayKwh: string
    equipmentStatus: string
    alertLevel: string
  }
}

// Mock data for the chart
const energyData = [
  { month: 'Jun', produced: 45, consumption: 32 },
  { month: 'Jul', produced: 52, consumption: 35 },
  { month: 'Aug', produced: 98, consumption: 42 },
  { month: 'Sep', produced: 115, consumption: 48 },
  { month: 'Oct', produced: 105, consumption: 45 },
  { month: 'Nov', produced: 62, consumption: 38 },
  { month: 'Dec', produced: 38, consumption: 28 },
  { month: 'Jan', produced: 25, consumption: 22 }
]

// Mock monthly generation data
const monthlyGenerationData = [
  { month: 'Sept', icon: '☀️', kWh: 283, active: true },
  { month: 'Oct', icon: '☁️', kWh: 504, active: false },
  { month: 'Nov', icon: '☁️', kWh: 309, active: false },
  { month: 'Dec', icon: '☁️', kWh: 245, active: false }
]

// Mock solar panel points data
const solarPanelPoints = [
  {
    name: 'Rumah Sasana',
    icon: '🏠',
    capacity: '356 kWh',
    usage: '40% used',
    generated: '203.8 kWh',
    usageColor: 'text-green-500'
  },
  {
    name: 'Sans Brothers',
    icon: '🏢',
    capacity: '926 kWh',
    usage: 'Charging',
    generated: '202.9 kWh',
    usageColor: 'text-orange-500'
  },
  {
    name: 'Perum Gulon',
    icon: '🏘️',
    capacity: '1066 kWh',
    usage: '70% used',
    generated: '742.8 kWh',
    usageColor: 'text-red-500'
  }
]

export default function SiteDetailModal({ isOpen, onClose, siteData }: SiteDetailModalProps) {
  const [selectedMonth, setSelectedMonth] = useState('Sept')
  const [timeRange, setTimeRange] = useState('Hourly')

    if (!isOpen || !siteData) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{siteData.customerName}</h2>
            <p className="text-sm text-muted-foreground">{siteData.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Solar Panel Monitoring Section */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">Solar Panel Monitoring</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <MetricCard
                title="Status"
                value="Active"
                icon={<Activity />}
                iconColor="text-green-500"
                iconBgColor="bg-green-500/10"
              />
              <MetricCard
                title="Lifetime Energy"
                value="3.98 MWh"
                icon={<Battery />}
                iconColor="text-purple-500"
                iconBgColor="bg-purple-500/10"
              />
              <MetricCard
                title="Lifetime Power"
                value="2.45 kW"
                icon={<Zap />}
                iconColor="text-purple-500"
                iconBgColor="bg-purple-500/10"
              />
              <MetricCard
                title="Energy Today"
                value="5.36 kWh"
                change="12%"
                changeType="increase"
                icon={<TrendingUp />}
                iconColor="text-green-500"
                iconBgColor="bg-green-500/10"
              />
              <MetricCard
                title="Energy This Month"
                value="624.8 kWh"
                change="23%"
                changeType="increase"
                icon={<TrendingUp />}
                iconColor="text-green-500"
                iconBgColor="bg-green-500/10"
              />
            </div>
          </div>

          {/* Monthly Generation Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CardTitle className="text-xl font-bold text-foreground mr-3">Monthly Generation</CardTitle>
                  <span className="text-2xl">⚡</span>
                  <span className="text-lg text-muted-foreground ml-2">1000 kWh</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Month Selector */}
              <div className="flex space-x-2">
                {monthlyGenerationData.map((month) => (
                  <button
                    key={month.month}
                    onClick={() => setSelectedMonth(month.month)}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all hover:scale-105 ${
                      month.active || selectedMonth === month.month
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'bg-card border-border hover:bg-muted'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{month.icon}</div>
                      <div className="text-sm font-medium">{month.month}</div>
                      <div className="text-xs">{month.kWh} kWh</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Monthly Stats */}
              <div className="text-sm text-muted-foreground space-y-1 p-4 bg-background rounded-lg">
                <div className="flex justify-between">
                  <span>Maximal Used:</span>
                  <span className="font-medium text-foreground">October 501 kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimal Used:</span>
                  <span className="font-medium text-foreground">November 189 kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Used:</span>
                  <span className="font-medium text-foreground">3.98 MWh</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energy Produced Chart Section */}
          <EnergyChart
            data={energyData}
            title="Energy Produced"
            description="Last updated 12 minutes ago"
            showTimeRange={true}
          />

          {/* Solar Panel Points Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Solar Panel Points</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {solarPanelPoints.map((panel, index) => (
                <div key={index} className="bg-background rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{panel.icon}</span>
                      <div>
                        <h4 className="font-semibold text-foreground">{panel.name}</h4>
                        <p className="text-sm text-muted-foreground">Capacity: {panel.capacity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${panel.usageColor}`}>{panel.usage}</p>
                      <p className="text-sm text-foreground">Generated: {panel.generated}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}