'use client'

import { useUserRole } from '@/hooks/use-user-role'

export default function ReportsPage() {
  const { user } = useUserRole()

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports</h1>
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v7m3-2h6" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Reports Dashboard</h2>
        <p className="text-muted-foreground">Generate and view detailed reports about your solar installations</p>
      </div>
    </div>
  )
}