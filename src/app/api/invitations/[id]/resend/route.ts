import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { InvitationStatus } from '@/domains/company/entities/company.entity'
import { generateInviteToken } from '@/infrastructure/auth/tokens'
import { ResendEmailService } from '@/infrastructure/emails/resend-email.service'

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(
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

    // Verificar se o convite ainda está pendente
    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { error: 'Invitation is no longer active' },
        { status: 400 }
      )
    }

    // Gerar novo token e atualizar expiração
    const newToken = generateInviteToken()
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7) // Expires in 7 days

    await prisma.invitation.update({
      where: { id: resolvedParams.id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
      }
    })

    // Enviar email novamente
    const emailService = new ResendEmailService()
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${newToken}`

    await emailService.sendInviteEmail({
      to: invitation.email,
      inviteUrl,
      message: invitation.message || undefined,
      inviterName: invitation.inviter.name || invitation.inviter.email,
      roleName: invitation.role.toLowerCase().replace('_', ' '),
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully',
    })

  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    )
  }
}