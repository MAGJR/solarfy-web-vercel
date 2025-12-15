'use client'

import { useState } from 'react'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { Label } from '@/presentation/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import { X, MapPin, Phone, Mail, Calendar, DollarSign, Home, Building, Factory, Info } from 'lucide-react'
import { CreateProjectRequestInput, ServiceType, ProjectRequestPriority } from '@/domains/project-requests/entities/project-request.entity'

interface ProjectRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProjectRequestInput) => Promise<void>
  isLoading?: boolean
}

export function ProjectRequestModal({ isOpen, onClose, onSubmit, isLoading = false }: ProjectRequestModalProps) {
  const [formData, setFormData] = useState<Partial<CreateProjectRequestInput>>({
    serviceType: undefined,
    priority: ProjectRequestPriority.NORMAL,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    title: '',
    description: '',
    estimatedBudget: undefined,
    preferredTimeline: '',
    propertyType: 'RESIDENTIAL',
    roofType: '',
    estimatedSize: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required'
    if (!formData.clientName?.trim()) newErrors.clientName = 'Client name is required'
    if (!formData.clientEmail?.trim()) newErrors.clientEmail = 'Client email is required'
    if (!formData.clientPhone?.trim()) newErrors.clientPhone = 'Client phone is required'
    if (!formData.address?.trim()) newErrors.address = 'Address is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'
    if (!formData.state?.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode?.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!formData.title?.trim()) newErrors.title = 'Title is required'
    if (!formData.description?.trim()) newErrors.description = 'Description is required'
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required'

    // Email validation
    if (formData.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Invalid email'
    }

    // Phone validation (simple)
    if (formData.clientPhone && formData.clientPhone.replace(/\D/g, '').length < 10) {
      newErrors.clientPhone = 'Invalid phone'
    }

    // Description length
    if (formData.description && formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    // Budget validation
    if (formData.estimatedBudget && formData.estimatedBudget < 0) {
      newErrors.estimatedBudget = 'Budget must be a positive value'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData as CreateProjectRequestInput)
      // Reset form on success
      setFormData({
        serviceType: undefined,
        priority: ProjectRequestPriority.NORMAL,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        companyName: '',
        address: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        title: '',
        description: '',
        estimatedBudget: undefined,
        preferredTimeline: '',
        propertyType: 'RESIDENTIAL',
        roofType: '',
        estimatedSize: undefined,
      })
      setErrors({})
    } catch (error) {
      // Error handling is done by the parent component
    }
  }

  const serviceTypeOptions = [
    { value: ServiceType.RESIDENTIAL_INSTALLATION, label: 'Residential Installation', icon: Home },
    { value: ServiceType.COMMERCIAL_INSTALLATION, label: 'Commercial Installation', icon: Building },
    { value: ServiceType.MAINTENANCE, label: 'Maintenance', icon: Info },
    { value: ServiceType.REPAIR, label: 'Repair', icon: Info },
    { value: ServiceType.UPGRADE, label: 'Upgrade', icon: Info },
    { value: ServiceType.CONSULTATION, label: 'Consultation', icon: Info },
    { value: ServiceType.MONITORING_SETUP, label: 'Monitoring Setup', icon: Info },
    { value: ServiceType.OTHER, label: 'Other', icon: Info },
  ]

  const priorityOptions = [
    { value: ProjectRequestPriority.LOW, label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: ProjectRequestPriority.NORMAL, label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    { value: ProjectRequestPriority.HIGH, label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: ProjectRequestPriority.URGENT, label: 'Urgent', color: 'bg-red-100 text-red-800' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Info className="h-6 w-6" />
              New Project Request
            </CardTitle>
            <CardDescription>
              Fill out the form below to request a new solar energy project
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => handleInputChange('serviceType', value)}
                >
                  <SelectTrigger className={errors.serviceType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.serviceType && (
                  <p className="text-sm text-red-500">{errors.serviceType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <Badge className={option.color}>{option.label}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Full Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className={errors.clientName ? 'border-red-500' : ''}
                    placeholder="John Smith"
                  />
                  {errors.clientName && (
                    <p className="text-sm text-red-500">{errors.clientName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      className={`pl-10 ${errors.clientEmail ? 'border-red-500' : ''}`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.clientEmail && (
                    <p className="text-sm text-red-500">{errors.clientEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      className={`pl-10 ${errors.clientPhone ? 'border-red-500' : ''}`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  {errors.clientPhone && (
                    <p className="text-sm text-red-500">{errors.clientPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company (Optional)</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Company Ltd."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Apartment/Suite</Label>
                  <Input
                    id="address2"
                    value={formData.address2}
                    onChange={(e) => handleInputChange('address2', e.target.value)}
                    placeholder="Apt 45"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'border-red-500' : ''}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={errors.state ? 'border-red-500' : ''}
                    placeholder="NY"
                    maxLength={2}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={errors.zipCode ? 'border-red-500' : ''}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-medium mb-4">Project Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                    placeholder="Residential solar panel installation"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={errors.description ? 'border-red-500' : ''}
                    rows={4}
                    placeholder="Describe the project in detail, including objectives, expectations, and any relevant information..."
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => handleInputChange('propertyType', value)}
                    >
                      <SelectTrigger className={errors.propertyType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESIDENTIAL">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Residential
                          </div>
                        </SelectItem>
                        <SelectItem value="COMMERCIAL">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Commercial
                          </div>
                        </SelectItem>
                        <SelectItem value="INDUSTRIAL">
                          <div className="flex items-center gap-2">
                            <Factory className="h-4 w-4" />
                            Industrial
                          </div>
                        </SelectItem>
                        <SelectItem value="OUTRO">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.propertyType && (
                      <p className="text-sm text-red-500">{errors.propertyType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedBudget">Estimated Budget ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="estimatedBudget"
                        type="number"
                        value={formData.estimatedBudget || ''}
                        onChange={(e) => handleInputChange('estimatedBudget', parseFloat(e.target.value) || undefined)}
                        className="pl-10"
                        placeholder="50000"
                      />
                    </div>
                    {errors.estimatedBudget && (
                      <p className="text-sm text-red-500">{errors.estimatedBudget}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedSize">Estimated Size (kW)</Label>
                    <Input
                      id="estimatedSize"
                      type="number"
                      step="0.1"
                      value={formData.estimatedSize || ''}
                      onChange={(e) => handleInputChange('estimatedSize', parseFloat(e.target.value) || undefined)}
                      placeholder="5.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roofType">Roof Type</Label>
                    <Input
                      id="roofType"
                      value={formData.roofType}
                      onChange={(e) => handleInputChange('roofType', e.target.value)}
                      placeholder="Asphalt shingle roof"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredTimeline">Preferred Timeline</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="preferredTimeline"
                        value={formData.preferredTimeline}
                        onChange={(e) => handleInputChange('preferredTimeline', e.target.value)}
                        className="pl-10"
                        placeholder="Within the next 3 months"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}