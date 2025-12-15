import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaMonitoringRepository } from '@/infrastructure/repositories/prisma-monitoring.repository'

const prisma = new PrismaClient()
const monitoringRepository = new PrismaMonitoringRepository(prisma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await monitoringRepository.findById(id)

    if (!result) {
      return NextResponse.json(
        { error: 'Monitoring data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    const result = await monitoringRepository.update(id, body)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to update monitoring data' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await monitoringRepository.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to delete monitoring data' },
      { status: 500 }
    )
  }
}