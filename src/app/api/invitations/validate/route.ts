import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { InvitationStatus } from '@/domains/company/entities/company.entity'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          }
        },
        inviter: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', status: 'invalid' },
        { status: 404 }
      )
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      // Update status to expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED }
      })

      return NextResponse.json(
        { error: 'Invitation has expired', status: 'expired' },
        { status: 410 }
      )
    }

    // Check if invitation has already been accepted
    if (invitation.status === InvitationStatus.ACCEPTED) {
      return NextResponse.json(
        {
          invitation: {
            ...invitation,
            status: InvitationStatus.ACCEPTED
          },
          status: 'accepted'
        },
        { status: 200 }
      )
    }

    // Check if invitation has been cancelled
    if (invitation.status === InvitationStatus.CANCELLED) {
      return NextResponse.json(
        { error: 'Invitation has been cancelled', status: 'invalid' },
        { status: 410 }
      )
    }

    // Invitation is valid
    return NextResponse.json({
      invitation,
      status: 'valid'
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}