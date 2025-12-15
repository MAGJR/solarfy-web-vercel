'use client'

import CrmTable from '@/presentation/components/app/components/crm-table'
import { Button } from '@/presentation/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import ImportLeadsModal from '@/presentation/components/app/components/import-leads-modal'

export default function LeadsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Manage your sales leads and customer relationships</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Link href="/app/leads/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* CRM Table */}
      <CrmTable />

      {/* Import Modal */}
      <ImportLeadsModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  )
}