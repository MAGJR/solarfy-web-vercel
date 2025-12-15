import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/register',
    '/auth/callback',
    '/api/auth',
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      // User is not authenticated, redirect to sign in
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Add user role information to request headers for client-side access
    const response = NextResponse.next()

    try {
      console.log('🔍 Proxy: Fetching user role for user ID:', session.user.id)
      // Fetch user with role information
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, tenantId: true }
      })

      console.log('📊 Proxy: User data from DB:', user)

      if (user) {
        // Check if user is trying to access admin-only routes
        if (pathname.startsWith('/app/settings') && user.role !== 'ADMIN') {
          console.log('🚫 Proxy: Non-ADMIN user trying to access settings:', pathname)
          const dashboardUrl = new URL('/app', request.url)
          return NextResponse.redirect(dashboardUrl)
        }

        // Add role information to response headers
        response.headers.set('x-user-role', user.role)
        response.headers.set('x-user-tenant-id', user.tenantId || '')
        console.log('✅ Proxy: Set headers - Role:', user.role, 'Tenant:', user.tenantId)
      } else {
        console.log('❌ Proxy: No user found in database')
      }
    } catch (dbError) {
      console.error('❌ Proxy: Error fetching user role:', dbError)
    }

    return response
  } catch (error) {
    // If there's an error checking the session, redirect to sign in
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public (public files)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}