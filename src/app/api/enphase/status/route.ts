import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'
import { EnphaseApiService } from '@/lib/services/enphase-api.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with tenant
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tenant: {
          include: { enphaseConfig: true }
        }
      }
    })

    if (!user?.tenant) {
      return NextResponse.json(
        { success: false, error: 'User tenant not found', authorized: false },
        { status: 404 }
      )
    }

    const tenantId = user.tenant.id
    const enphaseConfig = user.tenant.enphaseConfig

    // Check database config first
    let dbAuthorized = false
    let dbStatus = 'not_configured'

    if (enphaseConfig) {
      const now = new Date()
      const isTokenValid = enphaseConfig.tokenExpiresAt && enphaseConfig.tokenExpiresAt > now

      switch (enphaseConfig.status) {
        case 'AUTHORIZED':
          if (isTokenValid) {
            dbAuthorized = true
            dbStatus = 'authorized'
          } else {
            dbStatus = 'expired'
          }
          break
        case 'EXPIRED':
        case 'REVOKED':
        case 'ERROR':
          dbStatus = enphaseConfig.status.toLowerCase()
          break
        default:
          dbStatus = 'not_authorized'
      }
    }

    // Also check backend real-time status using our service
    let backendAuthorized = false
    let availableSystems = 0

    try {
      const enphaseService = new EnphaseApiService()
      enphaseService.setTenant(tenantId, '5096922') // Use known system for testing

      // Test if we can get systems list
      const systemsResponse = await fetch(`http://localhost:3005/api/v1/enphase/systems?tenantId=${tenantId}`)
      if (systemsResponse.ok) {
        const systemsData = await systemsResponse.json()
        if (systemsData.success && systemsData.data?.systems) {
          backendAuthorized = true
          availableSystems = systemsData.data.systems.length
        }
      }
    } catch (backendError) {
      console.log('Backend status check failed:', backendError)
      // Don't fail the whole request if backend is down
    }

    // Use database status if available, otherwise fallback to backend check
    const authorized = dbAuthorized || backendAuthorized
    const status = dbStatus !== 'not_configured' ? dbStatus : (backendAuthorized ? 'authorized' : 'not_configured')

    return NextResponse.json({
      success: true,
      authorized,
      status,
      configured: dbStatus !== 'not_configured' || backendAuthorized,
      lastRefreshAt: enphaseConfig?.lastRefreshAt || new Date().toISOString(),
      availableSystems: enphaseConfig?.availableSystems || availableSystems,
      tenantId,
      backendConnected: backendAuthorized,
      databaseConfigured: dbStatus !== 'not_configured'
    })

  } catch (error) {
    console.error('Enphase status check error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while checking Enphase status',
        authorized: false
      },
      { status: 500 }
    )
  }
}