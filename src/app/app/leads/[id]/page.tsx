'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Progress } from '@/presentation/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/presentation/components/ui/alert-dialog'
import { CrmLeadWithJourney } from '@/infrastructure/repositories/prisma-crm-lead.repository'
import { ProjectWithRelations } from '@/domains/projects/repositories/project.repository.interface'
import { CrmUserStatus, ProductService, LeadCustomerType } from '@prisma/client'
import { getLeadById } from '../action'
import LeadViewSelector, { ViewType } from '@/presentation/components/app/components/lead-view-selector'
import LeadDocumentsView from '@/presentation/components/app/components/lead-documents-view'
import LeadNotesView from '@/presentation/components/app/components/lead-notes-view'
import LeadActivitiesView from '@/presentation/components/app/components/lead-activities-view'
import LeadLogsSchedule from '@/presentation/components/app/component/lead-logs-schedule'
import {
  ArrowLeft,
  Edit,
  Calendar,
  Mail,
  Phone,
  Building,
  User,
  Target,
  Activity,
  Plus,
  Building2,
  Clock,
  Zap,
  DollarSign,
  MapPin,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string

  const [lead, setLead] = useState<CrmLeadWithJourney | null>(null)
  const [relatedProject, setRelatedProject] = useState<ProjectWithRelations | null>(null)
  const [currentView, setCurrentView] = useState<ViewType>('overview')
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (leadId) {
      loadLead()
      loadRelatedProject()
    }
  }, [leadId])

  const loadLead = async () => {
    try {
      setLoading(true)

      // Use the server action instead of direct API call
      const result = await getLeadById(leadId)

      if (result.success && result.data) {
        setLead(result.data)
      } else {
        toast.error(result.message || 'Lead not found')
        router.push('/app/leads')
      }
    } catch (error) {
      console.error('Error loading lead:', error)
      toast.error('Error loading lead')
      router.push('/app/leads')
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedProject = async () => {
    try {
      const response = await fetch(`/api/crm/leads/${leadId}/projects`)

      if (response.ok) {
        const result = await response.json()
        setRelatedProject(result.data)
      }
    } catch (error) {
      console.error('Error loading related project:', error)
      // Don't show toast for this error as it's not critical
    }
  }

  const getStatusColor = (status: CrmUserStatus) => {
    switch (status) {
      case CrmUserStatus.LEAD:
        return 'bg-blue-100 text-blue-800'
      case CrmUserStatus.CONTACTED:
        return 'bg-yellow-100 text-yellow-800'
      case CrmUserStatus.QUALIFIED:
        return 'bg-green-100 text-green-800'
      case CrmUserStatus.PROPOSAL_SENT:
        return 'bg-purple-100 text-purple-800'
      case CrmUserStatus.NEGOTIATION:
        return 'bg-orange-100 text-orange-800'
      case CrmUserStatus.CLOSED_WON:
        return 'bg-emerald-100 text-emerald-800'
      case CrmUserStatus.CLOSED_LOST:
        return 'bg-red-100 text-red-800'
      case CrmUserStatus.ON_HOLD:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getServiceColor = (service: ProductService) => {
    switch (service) {
      case ProductService.SOLAR_PANELS:
        return 'bg-yellow-100 text-yellow-800'
      case ProductService.SOLAR_WATER_HEATER:
        return 'bg-orange-100 text-orange-800'
      case ProductService.BATTERY_STORAGE:
        return 'bg-purple-100 text-purple-800'
      case ProductService.EV_CHARGING:
        return 'bg-green-100 text-green-800'
      case ProductService.ENERGY_AUDIT:
        return 'bg-blue-100 text-blue-800'
      case ProductService.MAINTENANCE:
        return 'bg-gray-100 text-gray-800'
      case ProductService.CONSULTING:
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCustomerTypeBadge = (customerType: LeadCustomerType, size: 'normal' | 'small' = 'normal') => {
    const variants: Record<LeadCustomerType, { className: string; text: string }> = {
      [LeadCustomerType.OWNER]: { className: 'bg-blue-100 text-blue-800', text: 'Owner' },
      [LeadCustomerType.LEASE]: { className: 'bg-purple-100 text-purple-800', text: 'Lease' },
      [LeadCustomerType.UNKNOWN]: { className: 'bg-gray-100 text-gray-800', text: 'Unknown' },
    }
    const variant = variants[customerType] || variants[LeadCustomerType.UNKNOWN]
    return (
      <Badge className={`${variant.className} ${size === 'small' ? 'text-xs' : ''}`}>
        {variant.text}
      </Badge>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'High Priority'
    if (score >= 40) return 'Medium Priority'
    return 'Low Priority'
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

  const calculateTimeInFunnel = (createdAt: Date | string) => {
    const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day'
    if (diffDays < 7) return `${diffDays} days`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`
    return `${Math.floor(diffDays / 30)} months`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleConvertToProject = () => {
    // Navigate to project creation with pre-filled data
    router.push(`/app/projects/new?leadId=${leadId}`)
  }

  const handleDeleteLead = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDeleteLead = async () => {
    if (!lead) return

    try {
      // Import the deleteLead action
      const { deleteLead } = await import('../action')

      const result = await deleteLead(leadId)

      if (result.success) {
        toast.success('Lead deleted successfully!')
        setDeleteDialogOpen(false)
        router.push('/app/leads')
      } else {
        toast.error(`Error deleting lead: ${result.message}`)
        setDeleteDialogOpen(false)
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast.error('An error occurred while deleting the lead. Please try again.')
      setDeleteDialogOpen(false)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
  }

  
  const renderMainContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <>
            {/* Lead Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Lead Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Company</h4>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>{lead.company}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Email</h4>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                          {lead.email}
                        </a>
                      </div>
                    </div>
                    {lead.phone && (
                      <div>
                        <h4 className="font-medium mb-2">Phone</h4>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                            {lead.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Lead Score</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-semibold ${getScoreColor(lead.score)}`}>
                            {lead.score}/100
                          </span>
                          <Badge variant="outline" className={getScoreColor(lead.score)}>
                            {getScoreLabel(lead.score)}
                          </Badge>
                        </div>
                        <Progress value={lead.score} className="h-2" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Created</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(lead.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Journey Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Customer Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lead.journey && lead.journey.length > 0 ? (
                  <div className="space-y-3">
                    {lead.journey.slice(0, 3).map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{step.step.replace('_', ' ')}</h4>
                            <Badge
                              variant={step.status === 'COMPLETED' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {step.status}
                            </Badge>
                          </div>
                          {step.completedAt && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(step.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {lead.journey.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{lead.journey.length - 3} more steps
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No journey steps recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )

      case 'details':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Lead Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Interest in:</h4>
                  <Badge className={getServiceColor(lead.productService)}>
                    {lead.productService.replace('_', ' ')}
                  </Badge>
                </div>
                {lead.assignee && (
                  <div>
                    <h4 className="font-medium mb-2">Assigned To</h4>
                    <p className="text-muted-foreground">{lead.assignee}</p>
                  </div>
                )}
              </div>

              {lead.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">{lead.notes}</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Lead Qualification</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Score Range:</span>
                    <span className="ml-2 font-medium">{lead.score}/100</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Priority:</span>
                    <span className="ml-2 font-medium">{getScoreLabel(lead.score)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Time in Funnel:</span>
                    <span className="ml-2 font-medium">{calculateTimeInFunnel(lead.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Last Activity:</span>
                    <span className="ml-2 font-medium">
                      {lead.lastActivity ? formatDate(lead.lastActivity) : 'No activity yet'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'journey':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Complete Customer Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lead.journey && lead.journey.length > 0 ? (
                <div className="space-y-4">
                  {lead.journey.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{step.step.replace('_', ' ')}</h4>
                          <Badge
                            variant={step.status === 'COMPLETED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {step.status}
                          </Badge>
                        </div>
                        {step.notes && (
                          <p className="text-sm text-muted-foreground mb-1">{step.notes}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {step.completedAt && (
                            <span>Completed: {formatDate(step.completedAt)}</span>
                          )}
                          {step.assignedTo && (
                            <span>Assigned to: {step.assignedTo}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No journey steps recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'documents':
        return <LeadDocumentsView leadId={leadId} />

      case 'notes':
        return (
          <LeadNotesView
            leadId={leadId}
            onNoteAdd={(note) => {
              console.log('Note added:', note)
            }}
          />
        )

      case 'activities':
        return (
          <LeadActivitiesView
            leadId={leadId}
            onActivityAdd={(activity) => {
              console.log('Activity added:', activity)
            }}
          />
        )

      case 'projects':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                Related Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedProject ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{relatedProject.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {relatedProject.description || 'No description available'}
                        </p>
                      </div>
                      <Badge
                        className={
                          relatedProject.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          relatedProject.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                          relatedProject.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {relatedProject.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {relatedProject.estimatedKw > 0 && (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{relatedProject.estimatedKw.toFixed(1)} kW</span>
                        </div>
                      )}
                      {relatedProject.estimatedPrice > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{formatCurrency(relatedProject.estimatedPrice)}</span>
                        </div>
                      )}
                      {relatedProject.address && (
                        <div className="col-span-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{relatedProject.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Created: {formatDate(relatedProject.createdAt)}</span>
                        <span>ID: {relatedProject.id.slice(0, 8)}...</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/app/projects/${relatedProject.id}`)}
                      >
                        View Project Details
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No project created from this lead yet</p>
                  <Button
                    onClick={handleConvertToProject}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lead Not Found</h2>
          <p className="text-muted-foreground mb-4">The lead you're looking for doesn't exist.</p>
          
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
            className="mb-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{lead.name}</h1>
          </div>
         
        </div>
        <div className="flex items-center gap-2">
          
         
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Information */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          {/* Lead Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Lead Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Company</h4>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{lead.company}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Email</h4>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                        {lead.email}
                      </a>
                    </div>
                  </div>
                  {lead.phone && (
                    <div>
                      <h4 className="font-medium mb-2">Phone</h4>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Status & Type</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                      {getCustomerTypeBadge(lead.customerType || LeadCustomerType.UNKNOWN)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Lead Qualification</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className={`text-lg font-semibold ${getScoreColor(lead.score)}`}>
                          {lead.score}/100
                        </span>
                        <Badge variant="outline" className={getScoreColor(lead.score)}>
                          {getScoreLabel(lead.score)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Time in funnel: {calculateTimeInFunnel(lead.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Created</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(lead.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Lead Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Interest in:</h4>
                  <Badge className={getServiceColor(lead.productService)}>
                    {lead.productService.replace('_', ' ')}
                  </Badge>
                </div>
                {lead.assignee && (
                  <div>
                    <h4 className="font-medium mb-2">Assigned To</h4>
                    <p className="text-muted-foreground">{lead.assignee}</p>
                  </div>
                )}
              </div>

              {lead.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">{lead.notes}</p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg border border-gray-600">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Lead Intelligence Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-medium">Priority:</span>
                      <span className="font-medium">{getScoreLabel(lead.score)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                   
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 font-medium">Next Action:</span>
                      <span className="font-medium text-green-700">
                        {lead.status === 'LEAD' ? 'Initial Contact' :
                         lead.status === 'CONTACTED' ? 'Follow-up Required' :
                         lead.status === 'QUALIFIED' ? 'Schedule Demo' :
                         lead.status === 'PROPOSAL_SENT' ? 'Follow Up on Proposal' :
                         'Review Status'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Journey */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Customer Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lead.journey && lead.journey.length > 0 ? (
                <div className="space-y-4">
                  {lead.journey.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{step.step.replace('_', ' ')}</h4>
                          <Badge
                            variant={step.status === 'COMPLETED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {step.status}
                          </Badge>
                        </div>
                        {step.notes && (
                          <p className="text-sm text-muted-foreground mb-1">{step.notes}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {step.completedAt && (
                            <span>Completed: {formatDate(step.completedAt)}</span>
                          )}
                          {step.assignedTo && (
                            <span>Assigned to: {step.assignedTo}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No journey steps recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                Related Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedProject ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{relatedProject.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {relatedProject.description || 'No description available'}
                        </p>
                      </div>
                      <Badge
                        className={
                          relatedProject.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          relatedProject.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                          relatedProject.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {relatedProject.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {relatedProject.estimatedKw > 0 && (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{relatedProject.estimatedKw.toFixed(1)} kW</span>
                        </div>
                      )}
                      {relatedProject.estimatedPrice > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{formatCurrency(relatedProject.estimatedPrice)}</span>
                        </div>
                      )}
                      {relatedProject.address && (
                        <div className="col-span-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{relatedProject.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Created: {formatDate(relatedProject.createdAt)}</span>
                        <span>ID: {relatedProject.id.slice(0, 8)}...</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/app/projects/${relatedProject.id}`)}
                      >
                        View Project Details
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No project created from this lead yet</p>
                  <Button
                    onClick={handleConvertToProject}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Section */}
          <div className="mt-8">
            <LeadDocumentsView leadId={leadId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => router.push(`/app/leads/${lead.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Lead
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleConvertToProject}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Create Project
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteLead}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Lead
              </Button>
            </CardContent>
          </Card>

          {/* Lead Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Lead Status & Type</h4>
                <div className="flex gap-1 flex-wrap">
                  <Badge className={`${getStatusColor(lead.status)} text-xs`}>
                    {lead.status.replace('_', ' ')}
                  </Badge>
                  {getCustomerTypeBadge(lead.customerType || LeadCustomerType.UNKNOWN, 'small')}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Time in Funnel</h4>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm">{calculateTimeInFunnel(lead.createdAt)}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Qualification Score</h4>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${getScoreColor(lead.score)}`}>
                    {lead.score}/100
                  </span>
                  <Badge variant="outline" className={`text-xs ${getScoreColor(lead.score)}`}>
                    {getScoreLabel(lead.score)}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Journey Progress</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Progress value={(lead.journey?.length || 0) * 20} className="h-2" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {lead.journey?.length || 0} steps
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground"> Interest in:</h4>
                <Badge className={`${getServiceColor(lead.productService)} text-xs`}>
                  {lead.productService.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Next Action</h4>
                <Badge variant="secondary" className="text-xs">
                  {lead.status === 'LEAD' ? 'Initial Contact' :
                   lead.status === 'CONTACTED' ? 'Follow-up Required' :
                   lead.status === 'QUALIFIED' ? 'Schedule Demo' :
                   'No Action Needed'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Logs and Schedule */}
          <LeadLogsSchedule leadId={leadId} />

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Created Date</h4>
                <p className="text-sm">{formatDate(lead.createdAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                <p className="text-sm">{formatDate(lead.updatedAt)}</p>
              </div>
              {lead.lastActivity && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Last Activity</h4>
                  <p className="text-sm">{formatDate(lead.lastActivity)}</p>
                </div>
              )}
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="font-medium">Current:</span>{' '}
                    <Badge className={getStatusColor(lead.status)} variant="outline">
                      {lead.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Lead
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lead <strong>{lead?.name}</strong>?
            </AlertDialogDescription>
            <div className="text-sm text-muted-foreground mt-2">
              This action cannot be undone and will permanently remove all associated data, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Lead information and contact details</li>
                <li>Journey steps and activities</li>
                <li>Related projects and documents</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLead}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}