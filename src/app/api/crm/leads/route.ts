import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaCrmLeadRepository } from '@/infrastructure/repositories/prisma-crm-lead.repository'

const prisma = new PrismaClient()
const crmLeadRepository = new PrismaCrmLeadRepository(prisma)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') as any
    const assignee = searchParams.get('assignee') || undefined
    const productService = searchParams.get('productService') as any
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') as any
    const sortOrder = searchParams.get('sortOrder') as any

    const result = await crmLeadRepository.findAll({
      page,
      limit,
      status,
      assignee,
      productService,
      search,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching CRM leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CRM leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await crmLeadRepository.create(body)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating CRM lead:', error)
    return NextResponse.json(
      { error: 'Failed to create CRM lead' },
      { status: 500 }
    )
  }
}