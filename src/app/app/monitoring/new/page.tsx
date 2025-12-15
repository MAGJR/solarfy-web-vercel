"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/presentation/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Input } from "@/presentation/components/ui/input"
import { Label } from "@/presentation/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select"
import { toast } from "sonner"
import {
  ArrowLeft,
  Zap,
  Home,
  Building,
  Factory,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Settings
} from "lucide-react"
import { CustomerType, EquipmentStatus, AlertLevel } from "@prisma/client"
import { createMonitoring, CreateMonitoringData } from "./action"

interface CrmLeadOption {
  id: string
  name: string
  email: string
  company: string
  status: string
  productService: string
}

export default function NewMonitoringPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leads, setLeads] = useState<CrmLeadOption[]>([])
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)
  const [enphaseStatus, setEnphaseStatus] = useState<'not_configured' | 'authorized' | 'not_authorized'>('not_configured')
  const [isLoadingEnphaseStatus, setIsLoadingEnphaseStatus] = useState(true)
  const [validatedSystemData, setValidatedSystemData] = useState<any>(null)
  const [formData, setFormData] = useState<CreateMonitoringData>({
    crmLeadId: "",
    customerType: CustomerType.RESIDENTIAL,
    address: "",
    peakKwp: 0,
    energyTodayKwh: 0,
    equipmentStatus: EquipmentStatus.ONLINE,
    alertLevel: AlertLevel.NORMAL,

    // Enphase API integration fields
    enphaseSystemId: "",
    enphaseApiEnabled: false
  })

  // Load CRM leads and Enphase status when component mounts
  useEffect(() => {
    loadCrmLeads()
    loadEnphaseStatus()
  }, [])

  const loadCrmLeads = async () => {
    try {
      const response = await fetch("/api/crm/leads")
      if (response.ok) {
        const data = await response.json()
        // Filter leads that don't have monitoring yet
        setLeads(data.leads || [])
      } else {
        toast.error("Error loading CRM leads")
      }
    } catch (error) {
      console.error("Error loading CRM leads:", error)
      toast.error("Error loading CRM leads")
    } finally {
      setIsLoadingLeads(false)
    }
  }

  const loadEnphaseStatus = async () => {
    try {
      const response = await fetch("/api/enphase/status")
      if (response.ok) {
        const data = await response.json()
        setEnphaseStatus(data.success && data.authorized ? 'authorized' : 'not_authorized')
      } else {
        setEnphaseStatus('not_configured')
      }
    } catch (error) {
      console.error("Error loading Enphase status:", error)
      setEnphaseStatus('not_configured')
    } finally {
      setIsLoadingEnphaseStatus(false)
    }
  }

  const updateFormData = (field: keyof CreateMonitoringData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.crmLeadId) {
      toast.error("Please select a CRM lead")
      return
    }

    if (!formData.address) {
      toast.error("Please provide the installation address")
      return
    }

    if (formData.peakKwp <= 0) {
      toast.error("Peak power must be greater than 0")
      return
    }

    // Validate Enphase System ID if API integration is enabled
    if (formData.enphaseApiEnabled) {
      if (enphaseStatus !== 'authorized') {
        toast.error("Enphase integration must be authorized to enable API integration")
        return
      }

      if (!formData.enphaseSystemId.trim()) {
        toast.error("Enphase System ID is required when API integration is enabled")
        return
      }
    }

    setIsSubmitting(true)
    try {
      const result = await createMonitoring(formData)

      if (result.success) {
        toast.success(result.message || "Monitoring data created successfully!")
        router.push("/app/monitoring")
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat()
          errorMessages.forEach(message => {
            toast.error(message)
          })
        } else {
          toast.error(result.message || "Error creating monitoring data")
        }
      }
    } catch (error) {
      console.error("Error creating monitoring data:", error)
      toast.error("Error creating monitoring data. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCustomerTypeIcon = (type: CustomerType) => {
    switch (type) {
      case CustomerType.RESIDENTIAL:
        return <Home className="w-4 h-4" />
      case CustomerType.COMMERCIAL:
        return <Building className="w-4 h-4" />
      case CustomerType.FARM:
        return <Factory className="w-4 h-4" />
      default:
        return <Home className="w-4 h-4" />
    }
  }

  const getEquipmentStatusIcon = (status: EquipmentStatus) => {
    switch (status) {
      case EquipmentStatus.ONLINE:
        return <Wifi className="w-4 h-4 text-green-600" />
      case EquipmentStatus.WARNING:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case EquipmentStatus.OFFLINE:
        return <WifiOff className="w-4 h-4 text-red-600" />
      case EquipmentStatus.MAINTENANCE:
        return <Settings className="w-4 h-4 text-blue-600" />
      default:
        return <Wifi className="w-4 h-4" />
    }
  }

  const getAlertLevelIcon = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.NORMAL:
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case AlertLevel.WARNING:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case AlertLevel.CRITICAL:
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Add Monitoring
            </h1>
            <p className="text-gray-600">
              Associate monitoring data to an existing CRM lead
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Information</CardTitle>
              <CardDescription>
                Fill in the technical and location details for monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CRM Lead Selection */}
              <div className="space-y-2">
                <Label htmlFor="crmLeadId">CRM Lead *</Label>
                <Select
                  value={formData.crmLeadId}
                  onValueChange={(value) => updateFormData("crmLeadId", value)}
                  disabled={isLoadingLeads}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingLeads ? "Loading leads..." : "Select a CRM lead"} />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{lead.name}</span>
                          <span className="text-sm text-gray-500">
                            {lead.company} • {lead.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {leads.length === 0 && !isLoadingLeads && (
                  <p className="text-sm text-gray-500">
                    No CRM leads available. Please create a lead first.
                  </p>
                )}
              </div>

              {/* Customer Type */}
              <div className="space-y-2">
                <Label>Customer Type *</Label>
                <Select
                  value={formData.customerType}
                  onValueChange={(value) => updateFormData("customerType", value as CustomerType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CustomerType.RESIDENTIAL}>
                      <div className="flex items-center space-x-2">
                        {getCustomerTypeIcon(CustomerType.RESIDENTIAL)}
                        <span>Residential</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={CustomerType.COMMERCIAL}>
                      <div className="flex items-center space-x-2">
                        {getCustomerTypeIcon(CustomerType.COMMERCIAL)}
                        <span>Commercial</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={CustomerType.FARM}>
                      <div className="flex items-center space-x-2">
                        {getCustomerTypeIcon(CustomerType.FARM)}
                        <span>Farm</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Installation Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="Full installation address"
                  required
                />
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="peakKwp">Peak Power (kWp) *</Label>
                  <Input
                    id="peakKwp"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.peakKwp}
                    onChange={(e) => updateFormData("peakKwp", parseFloat(e.target.value) || 0)}
                    placeholder="5.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="energyTodayKwh">Energy Today (kWh)</Label>
                  <Input
                    id="energyTodayKwh"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.energyTodayKwh}
                    onChange={(e) => updateFormData("energyTodayKwh", parseFloat(e.target.value) || 0)}
                    placeholder="25.5"
                  />
                </div>
              </div>

              {/* Enphase Integration Status */}
              {!isLoadingEnphaseStatus && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <Label className="text-sm font-medium">Enphase Integration</Label>
                  </div>

                  {enphaseStatus === 'not_configured' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Enphase Integration Not Configured</h3>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                            <p>Your organization hasn't configured Enphase integration yet. Please contact your administrator to set up the integration in Settings → Enphase Integration.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {enphaseStatus === 'not_authorized' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Enphase Integration Not Authorized</h3>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                            <p>Your Enphase integration needs to be re-authorized. Please contact your administrator to complete the OAuth authorization in Settings → Enphase Integration.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {enphaseStatus === 'authorized' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Enphase Integration Active</h3>
                          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                            <p>Your Enphase integration is properly configured and ready to use. You can now enter System IDs to enable real-time monitoring.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Enphase System ID */}
              {enphaseStatus === 'authorized' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <Label className="text-sm font-medium">System Configuration</Label>
                  </div>

                  <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="enphaseSystemId">Enphase System ID *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="enphaseSystemId"
                        value={formData.enphaseSystemId}
                        onChange={(e) => updateFormData("enphaseSystemId", e.target.value)}
                        placeholder="Enter Enphase System ID"
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!formData.enphaseSystemId.trim()}
                        onClick={async () => {
                          if (!formData.enphaseSystemId.trim()) return;

                          try {
                            const response = await fetch(`/api/enphase/validate-system`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                systemId: formData.enphaseSystemId.trim()
                              })
                            });

                            const result = await response.json();

                            if (result.success) {
                              // Store validated system data
                              setValidatedSystemData(result.data);

                              // Auto-populate form fields with real data
                              const systemData = result.data;
                              updateFormData("peakKwp", systemData.peakPower / 1000); // Convert W to kWp
                              updateFormData("energyTodayKwh", systemData.energyToday);
                              updateFormData("enphaseApiEnabled", true);

                              // Auto-enable equipment status based on system status
                              if (systemData.status === 'normal') {
                                updateFormData("equipmentStatus", EquipmentStatus.ONLINE);
                                updateFormData("alertLevel", AlertLevel.NORMAL);
                              } else if (systemData.status === 'warning') {
                                updateFormData("equipmentStatus", EquipmentStatus.WARNING);
                                updateFormData("alertLevel", AlertLevel.WARNING);
                              }

                              toast.success(`System ${formData.enphaseSystemId} validated! Auto-filled with real data: ${systemData.currentPowerW}W current power, ${systemData.energyTodayKwh}kWh today`);
                            } else {
                              toast.error(result.error || 'Failed to validate system ID');
                            }
                          } catch (error) {
                            toast.error('Error validating system ID');
                          }
                        }}
                      >
                        Validate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the Enphase System ID to enable real-time monitoring integration.
                      System ID must be validated before creating the monitoring project.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enphaseApiEnabled"
                      checked={formData.enphaseApiEnabled}
                      onChange={(e) => updateFormData("enphaseApiEnabled", e.target.checked)}
                      className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <Label htmlFor="enphaseApiEnabled" className="text-sm">
                      Enable Enphase API integration for this monitoring project
                    </Label>
                  </div>
                </div>
                </div>
              )}

              {/* Equipment Status */}
              <div className="space-y-2">
                <Label>Equipment Status</Label>
                <Select
                  value={formData.equipmentStatus}
                  onValueChange={(value) => updateFormData("equipmentStatus", value as EquipmentStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EquipmentStatus.ONLINE}>
                      <div className="flex items-center space-x-2">
                        {getEquipmentStatusIcon(EquipmentStatus.ONLINE)}
                        <span>Online</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={EquipmentStatus.WARNING}>
                      <div className="flex items-center space-x-2">
                        {getEquipmentStatusIcon(EquipmentStatus.WARNING)}
                        <span>Warning</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={EquipmentStatus.OFFLINE}>
                      <div className="flex items-center space-x-2">
                        {getEquipmentStatusIcon(EquipmentStatus.OFFLINE)}
                        <span>Offline</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={EquipmentStatus.MAINTENANCE}>
                      <div className="flex items-center space-x-2">
                        {getEquipmentStatusIcon(EquipmentStatus.MAINTENANCE)}
                        <span>Maintenance</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alert Level */}
              <div className="space-y-2">
                <Label>Alert Level</Label>
                <Select
                  value={formData.alertLevel}
                  onValueChange={(value) => updateFormData("alertLevel", value as AlertLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AlertLevel.NORMAL}>
                      <div className="flex items-center space-x-2">
                        {getAlertLevelIcon(AlertLevel.NORMAL)}
                        <span>Normal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={AlertLevel.WARNING}>
                      <div className="flex items-center space-x-2">
                        {getAlertLevelIcon(AlertLevel.WARNING)}
                        <span>Warning</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={AlertLevel.CRITICAL}>
                      <div className="flex items-center space-x-2">
                        {getAlertLevelIcon(AlertLevel.CRITICAL)}
                        <span>Critical</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.crmLeadId}
                >
                  {isSubmitting ? "Creating..." : "Create Monitoring"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}