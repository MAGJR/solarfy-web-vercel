'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { useState } from 'react'

interface EnergyChartProps {
  data: Array<{
    month: string
    produced: number
    consumption: number
  }>
  title?: string
  description?: string
  showTimeRange?: boolean
}

const chartData = [
  { month: 'Jun', produced: 45, consumption: 32 },
  { month: 'Jul', produced: 52, consumption: 35 },
  { month: 'Aug', produced: 98, consumption: 42 },
  { month: 'Sep', produced: 115, consumption: 48 },
  { month: 'Oct', produced: 105, consumption: 45 },
  { month: 'Nov', produced: 62, consumption: 38 },
  { month: 'Dec', produced: 38, consumption: 28 },
  { month: 'Jan', produced: 25, consumption: 22 }
]

export default function EnergyChart({ data = chartData, title = "Energy Production", description, showTimeRange = false }: EnergyChartProps) {
  const [timeRange, setTimeRange] = useState('Daily')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">
            📊 {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">
                {typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value} kWh
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
          {description && (
            <CardDescription className="text-muted-foreground mt-1">
              {description}
            </CardDescription>
          )}
          {!description && (
            <CardDescription className="text-muted-foreground mt-1">
              📊 Production Meter vs Consumption Meter
            </CardDescription>
          )}
        </div>
        {showTimeRange && (
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px] bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              <SelectItem value="Hourly">Hourly</SelectItem>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProduced" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              className="opacity-30"
            />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#9CA3AF' }}
              label={{
                value: 'Energy (kWh)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#9CA3AF' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value: string) => (
                <span style={{ color: '#374151' }}>
                  {value}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="produced"
              stroke="#FB923C"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorProduced)"
              name="Production Meter"
              dot={{ fill: '#FB923C', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorConsumption)"
              name="Consumption Meter"
              dot={{ fill: '#3B82F6', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend at bottom */}
        <div className="flex justify-center space-x-8 mt-6 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Production Meter</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Consumption Meter</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}