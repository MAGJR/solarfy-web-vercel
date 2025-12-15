'use client'

import { useUserRole } from '@/hooks/use-user-role'
import ProjectsTable from '@/presentation/components/app/components/projects-table'
import { Button } from '@/presentation/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsPage() {
  const { user } = useUserRole()

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage and track your solar installation projects</p>
        </div>
        <Link href="/app/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Projects Table */}
      <ProjectsTable />
    </div>
  )
}