import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/infrastructure/auth/auth.config'
import { prisma } from '@/infrastructure/database/prisma'

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication back when database integration is complete
    // const session = await auth.api.getSession({
    //   headers: request.headers
    // })

    // if (!session?.user?.email) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const { systemId } = await request.json()

    if (!systemId || typeof systemId !== 'string' || !systemId.trim()) {
      return NextResponse.json(
        { success: false, error: 'System ID is required' },
        { status: 400 }
      )
    }

    // Hardcoded tenant for testing - replace with real auth later
    const tenantId = 'cmhp4brz80001whqjhtdw40lo'

    // Call integration-layer to validate the system ID using our real backend
    try {
      const integrationLayerUrl = process.env.ENPHASE_INTEGRATION_URL || 'http://localhost:3005'

      const response = await fetch(`${integrationLayerUrl}/api/v1/enphase/systems/${systemId.trim()}/status?tenantId=${tenantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { success: false, error: 'System ID not found or not accessible with your credentials' },
            { status: 404 }
          )
        }

        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            { success: false, error: 'Authorization expired or invalid. Please contact your administrator to re-authenticate.' },
            { status: 401 }
          )
        }

        throw new Error(`Integration layer error: ${response.status}`)
      }

      const systemData = await response.json()

      if (!systemData.success) {
        return NextResponse.json(
          { success: false, error: systemData.error || 'System validation failed' },
          { status: 400 }
        )
      }

      const data = systemData.data

      return NextResponse.json({
        success: true,
        data: {
          systemId: systemId.trim(),
          systemName: `${data.system_id} - ${data.status || 'Active'}`,
          status: data.status || 'active',
          lastReportedAt: new Date(data.last_report_at * 1000).toISOString(),
          peakPower: data.size_w,
          currentPower: data.current_power,
          energyToday: data.energy_today / 1000, // Convert Wh to kWh
          energyLifetime: data.energy_lifetime / 1000, // Convert Wh to kWh
          modules: data.modules,
          timezone: data.timezone
        },
        message: `System ${systemId.trim()} validated successfully! Real-time data available.`
      })

    } catch (integrationError) {
      console.error('Integration layer error:', integrationError)

      return NextResponse.json(
        {
          success: false,
          error: 'Unable to validate system ID with Enphase API. Please try again later or contact support.'
        },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('System validation error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during system validation'
      },
      { status: 500 }
    )
  }
}