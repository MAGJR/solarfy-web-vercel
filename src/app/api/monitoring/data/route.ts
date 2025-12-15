import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaMonitoringRepository } from '@/infrastructure/repositories/prisma-monitoring.repository'

const prisma = new PrismaClient()
const monitoringRepository = new PrismaMonitoringRepository(prisma)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const crmLeadId = searchParams.get('crmLeadId') || undefined
    const customerType = searchParams.get('customerType') as any
    const equipmentStatus = searchParams.get('equipmentStatus') as any
    const alertLevel = searchParams.get('alertLevel') as any
    const search = searchParams.get('search') || undefined
    const sortBy = searchParams.get('sortBy') as any
    const sortOrder = searchParams.get('sortOrder') as any

    const result = await monitoringRepository.findAll({
      page,
      limit,
      crmLeadId,
      customerType,
      equipmentStatus,
      alertLevel,
      search,
      sortBy,
      sortOrder
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await monitoringRepository.create(body)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to create monitoring data' },
      { status: 500 }
    )
  }
}