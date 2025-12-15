import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Request received - fetching user role directly from auth and database')

    // Get session directly from auth
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session || !session.user) {
      console.log('❌ No session found')
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    console.log('📝 Session found for user ID:', session.user.id)
    console.log('📝 Session user email:', session.user.email)

    // Fetch user role directly from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, tenantId: true, email: true }
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    console.log('✅ User data from DB:', user)
    console.log('🔍 DB Role:', user.role)
    console.log('🔍 DB Tenant:', user.tenantId)

    const response = {
      role: user.role,
      tenantId: user.tenantId
    }

    console.log('✅ API: Returning user data:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error fetching user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}