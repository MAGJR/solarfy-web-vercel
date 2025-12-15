'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CrmLeadWithJourney } from '@/infrastructure/repositories/prisma-crm-lead.repository'
import { CrmUserStatus, ProductService, LeadCustomerType } from '@prisma/client'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/presentation/components/ui/alert-dialog"
import { Trash2 } from 'lucide-react'

interface CrmTableProps {
  users?: CrmLeadWithJourney[]
}

export default function CrmTable({ users }: CrmTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CrmUserStatus | 'ALL'>('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL')
  const [usersList, setUsersList] = useState<CrmLeadWithJourney[]>(users || [])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<CrmLeadWithJourney | null>(null)

  // Fetch CRM leads from database
  const fetchCrmLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/crm/leads', {
        cache: 'no-store' // Força cache bypass
      })
      if (response.ok) {
        const data = await response.json()
        setUsersList(data.leads || [])
      }
    } catch (error) {
      console.error('Failed to fetch CRM leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!users) {
      fetchCrmLeads()
    } else {
      setUsersList(users)
      setLoading(false)
    }
  }, [users])

  // Refresh data when page becomes visible (user returns from creating a lead)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !document.hidden) {
        fetchCrmLeads()
      }
    }

    const handleFocus = () => {
      fetchCrmLeads()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Update usersList when users prop changes
  if (users && users !== usersList) {
    setUsersList(users)
  }

  const filteredUsers = usersList.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter
    const matchesAssignee = assigneeFilter === 'ALL' || user.assignee === assigneeFilter

    return matchesSearch && matchesStatus && matchesAssignee
  })

  const handleEditUser = (user: CrmLeadWithJourney) => {
    router.push(`/app/leads/${user.id}/edit`)
  }

  const handleViewUser = (user: CrmLeadWithJourney) => {
    router.push(`/app/leads/${user.id}`)
  }

  const handleDeleteUser = (user: CrmLeadWithJourney) => {
    setLeadToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return

    try {
      // Import the deleteLead action dynamically to avoid SSR issues
      const { deleteLead } = await import('../../../../app/app/leads/action')

      const result = await deleteLead(leadToDelete.id)

      if (result.success) {
        // Close dialog and refresh the data
        setDeleteDialogOpen(false)
        setLeadToDelete(null)
        fetchCrmLeads()
      } else {
        alert(`Error deleting lead: ${result.message}`)
        setDeleteDialogOpen(false)
        setLeadToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('An error occurred while deleting the lead. Please try again.')
      setDeleteDialogOpen(false)
      setLeadToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setLeadToDelete(null)
  }

  
  const getStatusBadge = (status: CrmUserStatus) => {
    const variants: Record<CrmUserStatus, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      [CrmUserStatus.LEAD]: { variant: "default" },
      [CrmUserStatus.CONTACTED]: { variant: "secondary" },
      [CrmUserStatus.QUALIFIED]: { variant: "default" },
      [CrmUserStatus.PROPOSAL_SENT]: { variant: "secondary" },
      [CrmUserStatus.NEGOTIATION]: { variant: "secondary" },
      [CrmUserStatus.CLOSED_WON]: { variant: "default" },
      [CrmUserStatus.CLOSED_LOST]: { variant: "destructive" },
      [CrmUserStatus.ON_HOLD]: { variant: "secondary" },
    }
    return (
      <Badge variant={variants[status]?.variant || "secondary"}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getCustomerTypeBadge = (customerType: LeadCustomerType) => {
    const variants: Record<LeadCustomerType, { variant: "default" | "secondary" | "destructive" | "outline"; text: string }> = {
      [LeadCustomerType.OWNER]: { variant: "default", text: "Owner" },
      [LeadCustomerType.LEASE]: { variant: "secondary", text: "Lease" },
      [LeadCustomerType.UNKNOWN]: { variant: "outline", text: "Unknown" },
    }
    return (
      <Badge variant={variants[customerType]?.variant || "outline"}>
        {variants[customerType]?.text}
      </Badge>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 font-semibold'
    if (score >= 60) return 'text-yellow-500 font-semibold'
    return 'text-red-500 font-semibold'
  }

  const getServiceIcon = (service: ProductService) => {
    switch (service) {
      case ProductService.SOLAR_PANELS:
        return '☀️'
      case ProductService.SOLAR_WATER_HEATER:
        return '🔥'
      case ProductService.BATTERY_STORAGE:
        return '🔋'
      case ProductService.EV_CHARGING:
        return '🚗'
      case ProductService.ENERGY_AUDIT:
        return '📊'
      case ProductService.MAINTENANCE:
        return '🔧'
      case ProductService.CONSULTING:
        return '💼'
      default:
        return '⚡'
    }
  }

  const uniqueAssignees = Array.from(new Set(usersList.map(user => user.assignee).filter((assignee): assignee is string => Boolean(assignee))))

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-muted-foreground">Loading CRM data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Scroll indicator for mobile */}
      <div className="sm:hidden text-center text-sm text-muted-foreground mb-2">
        ↔️ Swipe left to see more columns
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as CrmUserStatus | 'ALL')}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {Object.values(CrmUserStatus).map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={assigneeFilter}
              onValueChange={setAssigneeFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Assignees</SelectItem>
                {uniqueAssignees.map(assignee => (
                  <SelectItem key={assignee!} value={assignee!}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <Card className="border-none shadow-none min-w-[1200px]">
              <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[140px]">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[180px]">
                Phone/Email
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">
                Customer Type
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[80px]">
                Score
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">
                Assignee
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[140px]">
                Product/Service
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">
                Start Date
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">
                Company
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[120px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => handleViewUser(user)}
              >
                
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-foreground">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.company}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm text-foreground">{user.phone || '-'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(user.status)}
                </TableCell>
                <TableCell>
                  {getCustomerTypeBadge(user.customerType || LeadCustomerType.UNKNOWN)}
                </TableCell>
                <TableCell>
                  <span className={`text-sm ${getScoreColor(user.score)}`}>
                    {user.score}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {user.assignee || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getServiceIcon(user.productService)}</span>
                    <span className="text-sm text-foreground">{user.productService.replace('_', ' ')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {user.company}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditUser(user)
                      }}
                      className="h-8 px-2"
                    >
                      Edit
                    </Button>
                    {/* <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteUser(user)
                      }}
                      className="h-8 px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
            </Card>
          </div>
        </div>
      </div>

      
      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{filteredUsers.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {filteredUsers.filter(u => u.status === CrmUserStatus.CLOSED_WON).length}
              </div>
              <div className="text-sm text-muted-foreground">Closed Won</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {filteredUsers.filter(u => u.status === CrmUserStatus.NEGOTIATION).length}
              </div>
              <div className="text-sm text-muted-foreground">In Negotiation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">
                {filteredUsers.length > 0 ? Math.round(filteredUsers.reduce((acc, u) => acc + u.score, 0) / filteredUsers.length) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Lead
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the lead <strong>{leadToDelete?.name}</strong>?
              <br />
              <br />
              This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
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
  )
}