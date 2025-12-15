'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import MonitoringTable from '@/presentation/components/app/components/monitoring-table'
import { AccessGate } from '@/presentation/components/app/components/access-gate'
import { Button } from '@/presentation/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function MonitoringPage() {
  const { user, isLoading } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    // Se for VIEWER, redireciona para sua página de monitoring específica
    if (user && user.role === 'VIEWER') {
      // Por enquanto usando o ID do usuário, depois podemos obter o ID da instalação real
      router.replace(`/app/monitoring/${user.id}`)
    }
  }, [user, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  // Se for VIEWER, mostra loading enquanto redireciona
  if (user && user.role === 'VIEWER') {
    return <div>Redirecting to your energy monitor...</div>
  }

  // Se for ADMIN, mostra a tabela normal
  if (!user) {
    return null
  }

  return (
    // <AccessGate feature="monitoring">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Sites</h1>
          <Link href="/app/monitoring/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Monitoring
            </Button>
          </Link>
        </div>
        <MonitoringTable />
      </div>
    // </AccessGate>
  )
}