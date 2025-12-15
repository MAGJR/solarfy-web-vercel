import { NextRequest, NextResponse } from 'next/server'
import { ImportLeadsUseCase } from '@/application/use-cases/crm/import-leads.usecase'
import { CSVParserService } from '@/domains/crm/services/csv-parser.service'
import { PrismaCrmLeadRepository } from '@/infrastructure/repositories/prisma-crm-lead.repository'
import { prisma } from '@/infrastructure/database/prisma'

// Initialize dependencies
const crmLeadRepository = new PrismaCrmLeadRepository(prisma)
const csvParserService = new CSVParserService()
const importLeadsUseCase = new ImportLeadsUseCase(crmLeadRepository, csvParserService)

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Read file content
    const csvContent = await file.text()

    if (!csvContent.trim()) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      )
    }

    // Process import
    const result = await importLeadsUseCase.execute({
      csvContent,
      userId,
      options: {
        skipDuplicates: true,
        batchSize: 50
      }
    })

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Import error:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        data: {
          total: 0,
          imported: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
          errors: [{
            row: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          }],
          importedLeads: []
        }
      },
      { status: 500 }
    )
  }
}

// Optional: Add GET method for import status/status history
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Import endpoint. Use POST to import leads from CSV file.',
      usage: {
        method: 'POST',
        contentType: 'multipart/form-data',
        fields: {
          file: 'CSV file (required)',
          userId: 'User ID performing the import (required)'
        },
        csvFormat: {
          requiredColumns: ['Name', 'Owner Email'],
          optionalColumns: ['Owner Phone', 'My Company\'s Reference'],
          example: 'Name,Owner Email,Owner Phone,My Company\'s Reference\nJohn Doe,john@example.com,+1555123456,REF123'
        }
      }
    },
    { status: 200 }
  )
}