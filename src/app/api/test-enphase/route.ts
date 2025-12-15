import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenantId') || 'test-tenant-123'
  // Usar redirect_uri dinâmico baseado no ambiente
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = searchParams.get('redirectUri') || `${baseUrl}/app/settings/enphase/callback`

  // Gerar state para validação do callback
  const state = Buffer.from(JSON.stringify({
    tenantId,
    flow: 'tenant_oauth'
  })).toString('base64')

  // Usar novas credenciais da Enphase
  const clientId = process.env.ENPHASE_CLIENT_ID || '54053eaf1b8279cffe497485486573f9'

  // URL com encoding aplicado apenas neste ponto final
  const authUrl = `https://api.enphaseenergy.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  return NextResponse.json({
    success: true,
    data: {
      tenantId,
      authorizationUrl: authUrl,
      message: 'Redirect user to this URL to authorize tenant access',
      note: 'This is a test endpoint. Replace ENPHASE_CLIENT_ID with real credentials'
    }
  })
}