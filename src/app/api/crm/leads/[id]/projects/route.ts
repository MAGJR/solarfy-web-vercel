import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaProjectRepository } from '@/infrastructure/repositories/prisma-project.repository'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const prisma = new PrismaClient()
    const projectRepository = new PrismaProjectRepository(prisma)

    // Find project associated with this lead
    const project = await projectRepository.findByCrmLeadId(leadId)

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      data: project,
      message: project ? 'Project found' : 'No project associated with this lead'
    })

  } catch (error) {
    console.error('Error fetching project by lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}