import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Testar fluxo Partner (sem necessidade de systems)
  const CLIENT_ID = '315bd7c8c34e7be68e7accb07e599bbb'
  const CLIENT_SECRET = '7e3d9da05729be7b52f009837b9f5136'

  // Gerar token de acesso direto (Partner flow)
  const tokenUrl = 'https://api.enphaseenergy.com/oauth/token'

  try {
    const params = new URLSearchParams({
      grant_type: 'password',
      username: 'j.victor@jjsolar.co',
      password: 'Enphase1'
    })

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

    const tokenResponse = await fetch(`${tokenUrl}?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get access token',
        details: tokenData
      }, { status: 400 })
    }

    // Testar API com o token obtido
    const apiResponse = await fetch(`https://api.enphaseenergy.com/api/v4/systems?key=dc49312816f43360450aa2242fb18596`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    const apiData = await apiResponse.json()

    return NextResponse.json({
      success: true,
      data: {
        tokenData,
        systemsResponse: {
          status: apiResponse.status,
          data: apiData
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}