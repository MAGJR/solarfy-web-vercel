'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerType, EquipmentStatus, AlertLevel } from '@prisma/client'
import { MonitoringDataWithCrm } from '@/infrastructure/repositories/prisma-monitoring.repository'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table"
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react'
import { useUserRole } from '@/hooks/use-user-role'
import { toast } from 'sonner'
import DeleteButton from '@/presentation/components/ui/delete-button'
import { deleteMonitoring } from '@/app/app/monitoring/delete/action'

interface MonitoringTableProps {
  data?: MonitoringDataWithCrm[]
}

export default function MonitoringTable({ data }: MonitoringTableProps) {
  const router = useRouter()
  const { user } = useUserRole()
  const [monitoringData, setMonitoringData] = useState<MonitoringDataWithCrm[]>(data || [])
  const [loading, setLoading] = useState(true)

  // Fetch monitoring data from database
  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        const response = await fetch('/api/monitoring/data')
        if (response.ok) {
          const result = await response.json()
          setMonitoringData(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!data) {
      fetchMonitoringData()
    } else {
      setMonitoringData(data)
      setLoading(false)
    }
  }, [data])

  const getStatusIcon = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.ONLINE:
        return <Activity className="h-4 w-4 text-green-500" />
      case EquipmentStatus.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case EquipmentStatus.OFFLINE:
        return <XCircle className="h-4 w-4 text-red-500" />
      case EquipmentStatus.MAINTENANCE:
        return <AlertTriangle className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertIcon = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.NORMAL:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case AlertLevel.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case AlertLevel.CRITICAL:
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString()
  }

  const handleDelete = async (id: string, customerName: string): Promise<void> => {
    try {
      const result = await deleteMonitoring(id)

      if (result.success) {
        // Remove from local state to update UI immediately
        setMonitoringData(prev => prev.filter(item => item.id !== id))
        toast.success(`${customerName}'s monitoring data deleted successfully`)
      } else {
        toast.error(result.message || 'Failed to delete monitoring data')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An unexpected error occurred')
    }
  }

  // Check if user has permission to delete
  const canDelete = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN'

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-muted-foreground">Loading monitoring data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Monitoring Table */}
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer Name
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Address
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                Peak (kWp)
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                Energy Today (kWh)
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Equipment
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Alerts
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer Type
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                Last Update
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                {canDelete && 'Actions'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monitoringData.map((item) => (
              <TableRow
                key={item.id}
                className="border-border/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/app/monitoring/${item.id}`)}
              >
                <TableCell className="py-3">
                  <div className="space-y-1">
                    <div className="font-medium text-sm text-foreground">{item.crmLead.name}</div>
                    <div className="text-xs text-muted-foreground">{item.crmLead.email}</div>
                    <div className="text-xs text-muted-foreground">Updated {formatTime(item.lastUpdate)}</div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="text-sm text-foreground">{item.address}</div>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <div className="text-sm font-medium text-foreground">{item.peakKwp.toFixed(2)}</div>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <div className="text-sm text-foreground">{item.energyTodayKwh.toFixed(2)}</div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.equipmentStatus)}
                    <span className="text-sm text-muted-foreground">{item.equipmentStatus.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(item.alertLevel)}
                    <span className="text-sm text-muted-foreground">{item.alertLevel}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="text-sm text-muted-foreground">{item.customerType}</div>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <div className="text-sm text-muted-foreground">
                    {formatDate(item.lastUpdate)}
                  </div>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/app/monitoring/${item.id}`)
                      }}
                      className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted transition-colors"
                    >
                      <svg
                        className="h-4 w-4 text-muted-foreground hover:text-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    {canDelete && (
                      <DeleteButton
                        onDelete={() => handleDelete(item.id, item.crmLead.name)}
                        itemName={`monitoring data for ${item.crmLead.name}`}
                        description={`This will permanently delete all monitoring data for ${item.crmLead.name} (${item.address}). This action cannot be undone.`}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {monitoringData.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">No monitoring data available</div>
          <p className="text-sm text-muted-foreground mt-2">
            Monitoring data will appear here once CRM leads are created and monitoring is set up.
          </p>
        </div>
      )}
    </div>
  )
}