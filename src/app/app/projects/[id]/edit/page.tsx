'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Badge } from '@/presentation/components/ui/badge'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Save,
  Building,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Zap,
  FileText,
  Loader2
} from 'lucide-react'
import { ProjectStatus, Project } from '@prisma/client'
import ProjectMap from '@/presentation/components/app/components/project-map'
import { getProjects, updateProject, UpdateProjectData, getProjectById } from '@/app/app/projects/action'


interface EditProjectState {
  errors?: {
    name?: string[]
    description?: string[]
    estimatedKw?: string[]
    estimatedPrice?: string[]
    address?: string[]
    email?: string[]
    phone?: string[]
    latitude?: string[]
    longitude?: string[]
    _form?: string[]
  }
  message?: string | null
  success?: boolean
  data?: any
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<UpdateProjectData>({
    name: '',
    description: '',
    status: ProjectStatus.PLANNING,
    estimatedKw: 0,
    estimatedPrice: 0,
    address: '',
    email: '',
    phone: '',
    latitude: undefined,
    longitude: undefined,
  })

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)

      const result = await getProjectById(projectId)

      if (result.success && result.data) {
        const foundProject = result.data

        setProject(foundProject)
        setFormData({
          name: foundProject.name,
          description: foundProject.description ?? '',
          status: foundProject.status,
          estimatedKw: foundProject.estimatedKw,
          estimatedPrice: foundProject.estimatedPrice,
          address: foundProject.address ?? '',
          email: foundProject.email ?? '',
          phone: foundProject.phone ?? '',
          latitude: foundProject.latitude ?? undefined,
          longitude: foundProject.longitude ?? undefined,
        })
      } else {
        toast.error(result.message || 'Project not found')
        router.push('/app/projects')
      }
    } catch (error) {
      console.error('Error loading project:', error)
      toast.error('Error loading project')
      router.push('/app/projects')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof UpdateProjectData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.name?.trim()) {
      errors.push('Project name is required')
    }

    if (!formData.estimatedKw || formData.estimatedKw <= 0) {
      errors.push('Estimated power must be greater than 0')
    }

    if (!formData.estimatedPrice || formData.estimatedPrice <= 0) {
      errors.push('Estimated price must be greater than 0')
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format')
    }

    // Validate coordinates if provided
    if ((formData.latitude && !formData.longitude) || (!formData.latitude && formData.longitude)) {
      errors.push('Both latitude and longitude must be provided together')
    }

    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      errors.push('Latitude must be between -90 and 90 degrees')
    }

    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      errors.push('Longitude must be between -180 and 180 degrees')
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateProject(projectId, formData)

      if (result.success) {
        toast.success(result.message || 'Project updated successfully!')
        // Go back to project details
        router.push(`/app/projects/${projectId}`)
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat()
          errorMessages.forEach(message => {
            toast.error(message)
          })
        } else {
          toast.error(result.message || 'Error updating project')
        }
      }
    } catch (error: any) {
      console.error('Error updating project:', error)
      toast.error('Error updating project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'bg-blue-100 text-blue-800'
      case ProjectStatus.PROPOSAL_SENT:
        return 'bg-yellow-100 text-yellow-800'
      case ProjectStatus.APPROVED:
        return 'bg-green-100 text-green-800'
      case ProjectStatus.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800'
      case ProjectStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800'
      case ProjectStatus.CANCELLED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project for editing...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The project you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/app/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Project</h1>
            <p className="text-muted-foreground">Update {formData.name}'s information</p>
          </div>
        </div>
        <Badge className={getStatusColor(formData.status)}>
          {formData.status.replace('_', ' ')}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the basic project details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Project description and details..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData("status", value as ProjectStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProjectStatus.PLANNING}>
                      <Badge className="bg-blue-100 text-blue-800">Planning</Badge>
                    </SelectItem>
                    <SelectItem value={ProjectStatus.PROPOSAL_SENT}>
                      <Badge className="bg-yellow-100 text-yellow-800">Proposal Sent</Badge>
                    </SelectItem>
                    <SelectItem value={ProjectStatus.APPROVED}>
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    </SelectItem>
                    <SelectItem value={ProjectStatus.IN_PROGRESS}>
                      <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>
                    </SelectItem>
                    <SelectItem value={ProjectStatus.COMPLETED}>
                      <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
                    </SelectItem>
                    <SelectItem value={ProjectStatus.CANCELLED}>
                      <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Update contact details and project address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Project Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  placeholder="Full project address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="contact@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Technical Information
              </CardTitle>
              <CardDescription>
                Update technical specifications and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedKw">Estimated Power (kW) *</Label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="estimatedKw"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.estimatedKw}
                      onChange={(e) => updateFormData("estimatedKw", parseFloat(e.target.value) || 0)}
                      placeholder="5.5"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedPrice">Estimated Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="estimatedPrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.estimatedPrice}
                      onChange={(e) => updateFormData("estimatedPrice", parseFloat(e.target.value) || 0)}
                      placeholder="25000.00"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {formData.estimatedKw > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Current Project Size:</strong> {formData.estimatedKw.toFixed(1)} kW
                  </p>
                  <p className="text-sm text-blue-600">
                    <strong>Price per kW:</strong> {formatCurrency(formData.estimatedPrice / formData.estimatedKw)}
                  </p>
                  <p className="text-sm text-blue-600">
                    <strong>Estimated panels:</strong> {Math.ceil(formData.estimatedKw * 7)} (assuming 400W panels)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          {formData.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Project Location
                </CardTitle>
                <CardDescription>
                  Update the project location on the map
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectMap
                  address={formData.address}
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lng) => {
                    updateFormData("latitude", lat)
                    updateFormData("longitude", lng)
                  }}
                  readonly={false}
                  showAddressInput={false}
                  personName={project?.name}
                />
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/app/projects/${projectId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}