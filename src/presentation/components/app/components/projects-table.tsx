'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectStatus } from '@prisma/client'
import { ProjectWithRelations } from '@/domains/projects/entities/project.entity'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table"
import { Input } from "@/presentation/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select"
import { Badge } from "@/presentation/components/ui/badge"
import { Card, CardContent } from "@/presentation/components/ui/card"
import { Button } from "@/presentation/components/ui/button"
import {
  Building,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Zap,
  Calendar,
  Search,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { getProjects } from '@/app/app/projects/action'
import { deleteProject } from '@/app/app/projects/action'
import { toast } from 'sonner'
import DeleteButton from '@/presentation/components/ui/delete-button'

interface ProjectsTableProps {
  projects?: ProjectWithRelations[]
}

export default function ProjectsTable({ projects: initialProjects }: ProjectsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL')
  const [projectsList, setProjectsList] = useState<ProjectWithRelations[]>(initialProjects || [])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })

  // Fetch projects from database
  const fetchProjects = async (page = 1, search = '', status = 'ALL') => {
    try {
      setLoading(true)
      const filters = {
        page,
        limit: pagination.limit,
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
      }

      const result = await getProjects(filters)

      if (result.success) {
        setProjectsList(result.data.projects || [])
        setPagination({
          page: result.data.page,
          limit: result.data.limit,
          total: result.data.total,
          totalPages: result.data.totalPages,
        })
      } else {
        toast.error('Error loading projects')
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Error loading projects')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and search/filter changes
  useEffect(() => {
    if (!initialProjects) {
      fetchProjects(1, searchTerm, statusFilter)
    } else {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initialProjects) {
        fetchProjects(1, searchTerm, statusFilter)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  const handleDelete = async (id: string, projectName: string): Promise<void> => {
    try {
      const result = await deleteProject(id)

      if (result.success) {
        // Remove from local state to update UI immediately
        setProjectsList(prev => prev.filter(item => item.id !== id))
        toast.success(`${projectName} deleted successfully`)
      } else {
        toast.error(result.message || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An unexpected error occurred')
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
      month: 'short',
      day: 'numeric'
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

  if (loading && !initialProjects) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-muted-foreground">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'ALL')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value={ProjectStatus.PLANNING}>Planning</SelectItem>
                  <SelectItem value={ProjectStatus.PROPOSAL_SENT}>Proposal Sent</SelectItem>
                  <SelectItem value={ProjectStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={ProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={ProjectStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          {projectsList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Project Name
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Lead/Customer
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Address
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Power (kW)
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Price
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Created
                  </TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsList.map((project) => (
                  <TableRow
                    key={project.id}
                    className="border-border/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/app/projects/${project.id}`)}
                  >
                    <TableCell className="py-3">
                      <div className="space-y-1">
                        <div className="font-medium text-sm text-foreground">{project.name}</div>
                        {project.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="space-y-1">
                        {project.crmLead ? (
                          <>
                            <div className="font-medium text-sm text-foreground">
                              {project.crmLead.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {project.crmLead.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {project.crmLead.email}
                              </span>
                            </div>
                          </>
                        ) : project.customer ? (
                          <>
                            <div className="font-medium text-sm text-foreground">
                              {project.customer.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {project.customer.email}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">No customer assigned</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {project.address ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground line-clamp-1">
                              {project.address}
                            </span>
                          </div>
                          {project.latitude && project.longitude && (
                            <div className="text-xs text-muted-foreground">
                              {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No address</div>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {project.estimatedKw.toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(project.estimatedPrice)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(project.createdAt)}
                        </span>
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
                            router.push(`/app/projects/${project.id}`)
                          }}
                          className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/app/projects/${project.id}/edit`)
                          }}
                          className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted transition-colors"
                          title="Edit project"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <DeleteButton
                          onDelete={() => handleDelete(project.id, project.name)}
                          itemName={`project "${project.name}"`}
                          description={`This will permanently delete the project "${project.name}" and all associated data. This action cannot be undone.`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No projects match your search criteria. Try adjusting your filters.'
                  : 'Get started by creating your first project.'}
              </p>
              <Button onClick={() => router.push('/app/projects/new')}>
                Create New Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} projects
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProjects(pagination.page - 1, searchTerm, statusFilter)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProjects(pagination.page + 1, searchTerm, statusFilter)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}