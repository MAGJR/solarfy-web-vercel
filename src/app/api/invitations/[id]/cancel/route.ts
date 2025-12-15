import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { InvitationStatus } from '@/domains/company/entities/company.entity'

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

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

    // Buscar o convite
    const invitation = await prisma.invitation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        tenant: {
          select: {
            id: true,
            ownerId: true,
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Verificar se o usuário tem permissão (é o owner do tenant)
    if (invitation.tenant.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Cancelar o convite
    await prisma.invitation.update({
      where: { id: resolvedParams.id },
      data: {
        status: InvitationStatus.CANCELLED
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully',
    })

  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    )
  }
}