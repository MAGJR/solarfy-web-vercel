'use client'

import { useState, useEffect } from 'react'
import { useUserRole } from '@/hooks/use-user-role'
import { RolePermissionsService } from '@/domains/users/services/role-permissions.service'
import { ProjectRequestWithRelations, ProjectRequestStatus, ProjectRequestPriority } from '@/domains/project-requests/entities/project-request.entity'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/presentation/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/presentation/components/ui/dropdown-menu'
import { Input } from '@/presentation/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select'
import { toast } from 'sonner'
import { MoreHorizontal, Eye, CheckCircle, XCircle, User, Calendar, Filter, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  CONVERTED_TO_PROJECT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  NORMAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const priorityLabels = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente'
}

const statusLabels = {
  PENDING: 'Pendente',
  UNDER_REVIEW: 'Em Análise',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  CONVERTED_TO_PROJECT: 'Convertido'
}

interface ProjectRequestsFilters {
  status?: ProjectRequestStatus
  priority?: ProjectRequestPriority
  search?: string
  dateFrom?: string
  dateTo?: string
}

export default function ProjectRequestsPage() {
  const { user } = useUserRole()
  const [requests, setRequests] = useState<ProjectRequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProjectRequestsFilters>({})
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Check if user can access this page
  if (!user) {
    return null
  }

  const navPermissions = RolePermissionsService.getNavigationPermissions(user.role as any)
  if (!navPermissions.canManageProjectRequests) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Apenas administradores e gerentes podem acessar as solicitações de projeto.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      })

      const response = await fetch(`/api/project-requests?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch project requests')
      }

      const data = await response.json()
      setRequests(data.requests)
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages
      }))
    } catch (error) {
      console.error('Error fetching project requests:', error)
      toast.error('Erro ao carregar solicitações de projeto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [pagination.page, filters])

  const handleUpdateStatus = async (requestId: string, status: ProjectRequestStatus, adminNotes?: string) => {
    setIsUpdating(requestId)

    try {
      const response = await fetch(`/api/project-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes || `Status atualizado para ${statusLabels[status]}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update request status')
      }

      toast.success(`Solicitação ${statusLabels[status]} com sucesso`)
      await fetchRequests()
    } catch (error) {
      console.error('Error updating request status:', error)
      toast.error('Erro ao atualizar status da solicitação')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleAssignToUser = async (requestId: string, assignedUserId: string) => {
    setIsUpdating(requestId)

    try {
      const response = await fetch(`/api/project-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: assignedUserId })
      })

      if (!response.ok) {
        throw new Error('Failed to assign request')
      }

      toast.success('Solicitação atribuída com sucesso')
      await fetchRequests()
    } catch (error) {
      console.error('Error assigning request:', error)
      toast.error('Erro ao atribuir solicitação')
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitações de Projeto</h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de serviço dos clientes
          </p>
        </div>
        <Button
          onClick={fetchRequests}
          variant="outline"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Análise</p>
                <p className="text-2xl font-bold text-blue-600">
                  {requests.filter(r => r.status === 'UNDER_REVIEW').length}
                </p>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'APPROVED').length}
                </p>
              </div>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.priority === 'URGENT').length}
                </p>
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <Input
              placeholder="Buscar por cliente..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="md:col-span-2"
            />

            <Select
              value={filters.status || ''}
              onValueChange={(value) => setFilters(prev => ({
                ...prev,
                status: value as ProjectRequestStatus || undefined
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || ''}
              onValueChange={(value) => setFilters(prev => ({
                ...prev,
                priority: value as ProjectRequestPriority || undefined
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as prioridades</SelectItem>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Solicitações ({pagination.total} no total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.clientName}</div>
                          <div className="text-sm text-muted-foreground">{request.clientEmail}</div>
                          <div className="text-sm text-muted-foreground">{request.clientPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.service?.title || request.serviceType}
                          </div>
                          {request.propertyType && (
                            <div className="text-xs text-muted-foreground">
                              {request.propertyType} • {request.estimatedSize || 'N/A'} kW
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[request.priority]}>
                          {priorityLabels[request.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {request.assignedTo ? (
                            <div>
                              <div className="font-medium">{request.assignedTo.name}</div>
                              <div className="text-muted-foreground">{request.assignedTo.role}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Não atribuído</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>

                            {request.status === 'PENDING' && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(request.id, 'UNDER_REVIEW')}
                                disabled={isUpdating === request.id}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Iniciar Análise
                              </DropdownMenuItem>
                            )}

                            {request.status === 'UNDER_REVIEW' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(request.id, 'APPROVED')}
                                  disabled={isUpdating === request.id}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                                  disabled={isUpdating === request.id}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Rejeitar
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              Atribuir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} até{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                  {pagination.total} solicitações
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}