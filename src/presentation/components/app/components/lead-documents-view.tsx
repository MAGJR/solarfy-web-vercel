'use client'

import DocumentUpload from './document-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { FileText } from 'lucide-react'

interface LeadDocumentsViewProps {
  leadId: string
}

export default function LeadDocumentsView({ leadId }: LeadDocumentsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Documents Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentUpload
          leadId={leadId}
          onDocumentUpload={(document) => {
            console.log('Document uploaded:', document)
          }}
          onDocumentDelete={(documentId) => {
            console.log('Document deleted:', documentId)
          }}
        />
      </CardContent>
    </Card>
  )
}