'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { ProjectWithRelations } from '@/domains/projects/entities/project.entity'
import { ProjectImageWithRelations } from '@/domains/projects/entities/project-image.entity'
import { getProjectById } from '@/app/app/projects/action'
import { getProjectImages } from './images-actions'
import ProjectMap from '@/presentation/components/app/components/project-map'
import ProjectImageUpload from '@/presentation/components/app/components/project-image-upload'
// TODO: Re-implement Enphase components when needed
// import { EnphaseConfigForm } from '@/components/enphase/EnphaseConfigForm'
// import { EnphaseStatusCard } from '@/components/enphase/EnphaseStatusCard'
// import { EnphaseProductionChart } from '@/components/enphase/EnphaseProductionChart'
// import { EnphaseAlertsPanel } from '@/components/enphase/EnphaseAlertsPanel'
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Zap,
  Building,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import { ProjectStatus } from '@prisma/client'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectWithRelations | null>(null)
  const [images, setImages] = useState<ProjectImageWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      loadProject()
      loadImages()
    }
  }, [projectId])

  const loadImages = async () => {
    try {
      const result = await getProjectImages(projectId)
      if (result.success && result.data) {
        setImages(result.data)
      }
    } catch (error) {
      console.error('Error loading images:', error)
    }
  }

  const loadProject = async () => {
    try {
      setLoading(true)

      // Use the specific action to get project by ID
      const result = await getProjectById(projectId)

      if (result.success && result.data) {
        setProject(result.data)
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleImageUpload = (newImage: any) => {
    setImages(prev => [...prev, newImage])
  }

  const handleImageUpdate = (imageId: string, data: any) => {
    setImages(prev =>
      prev.map(img => img.id === imageId ? { ...img, ...data } : img)
    )
  }

  const handleImageDelete = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
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
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted-foreground">Project Details</p>
          </div>
        </div>
      
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Created</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.createdAt)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Estimated Power</h4>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-semibold">{project.estimatedKw.toFixed(1)} kW</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Estimated Price</h4>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-semibold">{formatCurrency(project.estimatedPrice)}</span>
                  </div>
                </div>
              </div>

              {project.estimatedKw > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Price per kW:</strong> {formatCurrency(project.estimatedPrice / project.estimatedKw)}
                  </p>
                  <p className="text-sm text-blue-600">
                    Approximately {Math.ceil(project.estimatedKw * 7)} solar panels (assuming 400W panels)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead/Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.crmLead ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Lead Name</h4>
                    <p className="text-muted-foreground">{project.crmLead.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Company</h4>
                    <p className="text-muted-foreground">{project.crmLead.company}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <a href={`mailto:${project.crmLead.email}`} className="text-blue-600 hover:underline">
                        {project.crmLead.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Lead Status</h4>
                    <Badge variant="outline">{project.crmLead.status}</Badge>
                  </div>
                </div>
              ) : project.customer ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Customer Name</h4>
                    <p className="text-muted-foreground">{project.customer.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <a href={`mailto:${project.customer.email}`} className="text-blue-600 hover:underline">
                        {project.customer.email}
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No customer information available</p>
              )}
            </CardContent>
          </Card>

          {/* Project Location Map */}
          {project.address && (project.latitude && project.longitude) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Project Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Address</h4>
                    <p className="text-muted-foreground">{project.address}</p>
                  </div>

                  {project.email && (
                    <div>
                      <h4 className="font-medium mb-2">Contact Email</h4>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <a href={`mailto:${project.email}`} className="text-blue-600 hover:underline">
                          {project.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {project.phone && (
                    <div>
                      <h4 className="font-medium mb-2">Contact Phone</h4>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <a href={`tel:${project.phone}`} className="text-blue-600 hover:underline">
                          {project.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Coordinates</h4>
                    <p className="text-sm text-muted-foreground font-mono">
                      {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}
                    </p>
                  </div>

                  <ProjectMap
                    address={project.address}
                    latitude={project.latitude}
                    longitude={project.longitude}
                    onLocationChange={() => {}} // Readonly
                    readonly={true}
                    showAddressInput={false}
                    personName={project.crmLead?.name || project.name}
                  />
                </div>
              </CardContent>
            </Card>
          )}

                </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push(`/app/projects/${project.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
           
            </CardContent>
          </Card>

  
  
    
      
          {/* Project Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Project ID</h4>
                <p className="font-mono text-xs">{project.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                <p className="text-sm">{formatDate(project.updatedAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
                <p className="text-sm">{project.createdBy?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{project.createdBy?.email}</p>
              </div>
              {project.enphaseSystemId && (
                <div className="pt-2 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Enphase Integration</h4>
                  <div className="space-y-1">
                    <p className="text-xs">
                      <span className="font-medium">System ID:</span> {project.enphaseSystemId}
                    </p>
                    <p className="text-xs">
                      <span className="font-medium">Status:</span>{' '}
                      <Badge variant="outline" className="text-xs">
                        {project.enphaseStatus || 'PENDING'}
                      </Badge>
                    </p>
                    {project.enphaseLastSync && (
                      <p className="text-xs">
                        <span className="font-medium">Last Sync:</span>{' '}
                        {formatDate(project.enphaseLastSync)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Images & Documents */}
          <ProjectImageUpload
            projectId={project.id}
            images={images}
            onImageUpload={handleImageUpload}
            onImageUpdate={handleImageUpdate}
            onImageDelete={handleImageDelete}
          />
        </div>
      </div>
    </div>
  )
}