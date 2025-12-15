import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@/infrastructure/auth/auth.config'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes, assignedTo } = body

    // Check if journey step exists and belongs to the lead
    const existingStep = await prisma.userJourneyStep.findFirst({
      where: {
        id: params.stepId,
        crmLeadId: params.id
      }
    })

    if (!existingStep) {
      return NextResponse.json(
        { error: 'Journey step not found' },
        { status: 404 }
      )
    }

    // Update journey step
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo

    // Set completedAt when status changes to COMPLETED
    if (status === 'COMPLETED' && existingStep.status !== 'COMPLETED') {
      updateData.completedAt = new Date()
    } else if (status !== 'COMPLETED') {
      updateData.completedAt = null
    }

    const updatedStep = await prisma.userJourneyStep.update({
      where: { id: params.stepId },
      data: updateData
    })

    // Update lead's last activity
    await prisma.crmLead.update({
      where: { id: params.id },
      data: { lastActivity: new Date() }
    })

    return NextResponse.json(updatedStep)
  } catch (error) {
    console.error('Error updating journey step:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if journey step exists and belongs to the lead
    const existingStep = await prisma.userJourneyStep.findFirst({
      where: {
        id: params.stepId,
        crmLeadId: params.id
      }
    })

    if (!existingStep) {
      return NextResponse.json(
        { error: 'Journey step not found' },
        { status: 404 }
      )
    }

    // Delete journey step
    await prisma.userJourneyStep.delete({
      where: { id: params.stepId }
    })

    // Update lead's last activity
    await prisma.crmLead.update({
      where: { id: params.id },
      data: { lastActivity: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting journey step:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}