import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from 'better-auth/crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if credential account exists
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential"
      }
    })

    if (existingAccount) {
      // Update existing password with Better Auth hash
      const hashedPassword = await hashPassword(password)

      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword }
      })

      return NextResponse.json({
        success: true,
        message: 'Existing credential account updated with new password hash',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified
        },
        account: {
          id: existingAccount.id,
          providerId: existingAccount.providerId,
          accountId: existingAccount.accountId
        }
      })
    }

    // Hash password using Better Auth's method
    const hashedPassword = await hashPassword(password)

    // Create credential account
    const account = await prisma.account.create({
      data: {
        accountId: normalizedEmail,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Credential account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      },
      account: {
        id: account.id,
        providerId: account.providerId,
        accountId: account.accountId
      }
    })

  } catch (error) {
    console.error('Fix user error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase()

    // Check user and account status
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    const accounts = await prisma.account.findMany({
      where: { userId: user?.id }
    })

    return NextResponse.json({
      email: normalizedEmail,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      } : null,
      accounts: accounts.map(a => ({
        id: a.id,
        providerId: a.providerId,
        accountId: a.accountId,
        hasPassword: !!a.password,
        createdAt: a.createdAt
      })),
      diagnosis: {
        userExists: !!user,
        hasCredentialAccount: accounts.some(a => a.providerId === "credential"),
        totalAccounts: accounts.length,
        canLogin: !!(user && accounts.some(a => a.providerId === "credential"))
      }
    })

  } catch (error) {
    console.error('Debug fix user error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}