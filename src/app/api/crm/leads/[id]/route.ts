import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaCrmLeadRepository } from '@/infrastructure/repositories/prisma-crm-lead.repository'
import { GetCrmLeadUseCase } from '@/application/use-cases/crm/get-crm-lead.usecase'

const prisma = new PrismaClient()
const crmLeadRepository = new PrismaCrmLeadRepository(prisma)
const getCrmLeadUseCase = new GetCrmLeadUseCase(crmLeadRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await getCrmLeadUseCase.execute(id)

    if (!result) {
      return NextResponse.json(
        { error: 'CRM lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching CRM lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CRM lead' },
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

    const result = await crmLeadRepository.update(id, body)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating CRM lead:', error)
    return NextResponse.json(
      { error: 'Failed to update CRM lead' },
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
    await crmLeadRepository.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting CRM lead:', error)
    return NextResponse.json(
      { error: 'Failed to delete CRM lead' },
      { status: 500 }
    )
  }
}