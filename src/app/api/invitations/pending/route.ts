import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { InvitationStatus } from '@/domains/company/entities/company.entity'

export async function GET(request: NextRequest) {
  try {
    // Autenticar o usuário
    const session = await auth.api.getSession({
      headers: new Headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Obter tenantId do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    if (!user?.tenantId) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Buscar convites pendentes do tenant
    const invitations = await prisma.invitation.findMany({
      where: {
        tenantId: user.tenantId,
        status: InvitationStatus.PENDING,
      },
      include: {
        inviter: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      invitations,
    })

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}