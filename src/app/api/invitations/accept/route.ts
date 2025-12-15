import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/database/prisma'
import { InvitationStatus, UserRole } from '@/domains/company/entities/company.entity'
import { auth } from '@/infrastructure/auth/auth.config'

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json()

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: 'Token, name, and password are required' },
        { status: 400 }
      )
    }

    // Find and validate invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation' },
        { status: 404 }
      )
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json(
        { error: 'Invitation is no longer valid' },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await auth.api.signUpEmail({
      body: {
        email: invitation.email,
        name: name,
        password: password,
      },
    })

    if (!newUser?.user?.id) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Associate user with tenant and set role
    const updatedUser = await prisma.user.update({
      where: { id: newUser.user.id },
      data: {
        tenantId: invitation.tenantId,
        role: invitation.role as UserRole,
        emailVerified: true, // Auto-verify since they were invited
      }
    })

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED
      }
    })

    // Update user's last login
    await prisma.user.update({
      where: { id: newUser.user.id },
      data: {
        lastLogin: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        tenantId: updatedUser.tenantId,
      },
      tenant: invitation.tenant
    })

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}