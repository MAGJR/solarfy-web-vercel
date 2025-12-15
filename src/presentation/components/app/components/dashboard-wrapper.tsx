'use client'

import { useUserRole } from '@/hooks/use-user-role'
import DashboardHeader from './dashboard-header'
import Sidebar from './sidebar'

interface DashboardWrapperProps {
  children: React.ReactNode
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { user, isLoading } = useUserRole()

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}