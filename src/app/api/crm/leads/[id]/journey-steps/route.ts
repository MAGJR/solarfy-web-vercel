import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/infrastructure/auth/auth.config'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lead = await prisma.crmLead.findUnique({
      where: { id: params.id },
      include: {
        journey: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead.journey)
  } catch (error) {
    console.error('Error fetching journey steps:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { step, status, notes, assignedTo } = body

    // Validate required fields
    if (!step || !status) {
      return NextResponse.json(
        { error: 'Step and status are required' },
        { status: 400 }
      )
    }

    // Check if lead exists
    const lead = await prisma.crmLead.findUnique({
      where: { id: params.id }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Create new journey step
    const journeyStep = await prisma.userJourneyStep.create({
      data: {
        crmLeadId: params.id,
        step,
        status,
        notes: notes || null,
        assignedTo: assignedTo || null,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    })

    // Update lead's last activity
    await prisma.crmLead.update({
      where: { id: params.id },
      data: { lastActivity: new Date() }
    })

    return NextResponse.json(journeyStep, { status: 201 })
  } catch (error) {
    console.error('Error creating journey step:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}