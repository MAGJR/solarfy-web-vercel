'use client'

import { useUserRole } from '@/hooks/use-user-role'
import UserDashboard from '@/presentation/components/app/components/user-dashboard'
// import { AccessGate } from '@/presentation/components/app/components/access-gate'
import { RolePermissionsService } from '@/domains/users/services/role-permissions.service'
import Link from 'next/link'
import { Button } from '@/presentation/components/ui/button'
import { Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const { user } = useUserRole()

  if (!user) {
    return null
  }

  // Get navigation permissions for the current user role
  const navPermissions = RolePermissionsService.getNavigationPermissions(user.role as any)

  return (
    // <AccessGate feature="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your solar energy business today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-foreground">-</p>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground">-</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Issues</p>
                <p className="text-2xl font-bold text-foreground">-</p>
              </div>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">-</p>
              </div>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {navPermissions.canViewLeads && (
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link href="/app/leads">
                <Button variant="outline">View All Leads</Button>
              </Link>
              <Link href="/app/leads/new">
                <Button>Create New Lead</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Dashboard content based on role */}
        <UserDashboard />
      </div>
    // </AccessGate>
  )
}