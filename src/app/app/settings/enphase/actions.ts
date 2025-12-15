'use server'

import { auth } from '@/infrastructure/auth/auth.config'
import { headers } from 'next/headers'
import { oauthConfig } from '@/config/oauth'

// Backend API URLs
const BACKEND_URL = process.env.NEXT_PUBLIC_ENPHASE_BACKEND_URL || 'http://localhost:3005'

/**
 * 🏢 Server Actions for Enphase Tenant Management
 *
 * Ações do servidor para gerenciamento da integração Enphase
 * em ambiente multi-tenant
 */

export async function getTenantEnphaseStatus(tenantId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No active session',
        data: null
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/tenants/${tenantId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': session.user.id!
      },
      cache: 'no-store'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get tenant status')
    }

    return {
      success: true,
      data: data.data
    }

  } catch (error) {
    console.error('Get tenant Enphase status error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tenant status'
    }
  }
}

export async function getTenantOAuthUrl(tenantId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/app/settings/enphase/callback`

    const response = await fetch(`${BACKEND_URL}/api/v1/enphase/oauth/authorize?tenantId=${tenantId}&systemId=default`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': session.user.id!
      },
      cache: 'no-store'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate OAuth URL')
    }

    // Substituir URL antiga por nova configuração se necessário
    if (data.data?.authorizationUrl) {
      data.data.authorizationUrl = oauthConfig.getAuthorizeUrl(data.data.authorizationUrl);
    }

    return {
      success: true,
      data: data.data
    }

  } catch (error) {
    console.error('Generate OAuth URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate OAuth URL'
    }
  }
}

export async function authorizeTenant(tenantId: string, authorizationCode: string, metadata?: {
  authorizedBy: string
  companyName?: string
  adminEmail?: string
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    // Use the correct backend endpoint for OAuth callback processing
    const response = await fetch(`${BACKEND_URL}/api/v1/enphase/oauth/process-callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: authorizationCode,
        state: Buffer.from(JSON.stringify({
          tenantId,
          systemId: 'default',
          flow: 'tenant_oauth'
        })).toString('base64')
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to authorize tenant')
    }

    return {
      success: true,
      data: data.data
    }

  } catch (error) {
    console.error('Authorize tenant error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to authorize tenant'
    }
  }
}

export async function exchangeTokenFromFrontend(code: string, tenantId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    console.log('🔄 [FRONTEND-OAUTH] Exchanging token from frontend', {
      code,
      tenantId,
      userEmail: session.user.email
    })

    console.log('🔄 [FRONTEND-OAUTH] Starting token exchange with Enphase...', {
      code: code.substring(0, 10) + '...',
      tenantId,
      redirectUri: oauthConfig.redirectUri
    })

    // Fazer token exchange direto do frontend para manter sessão/cokies
    const tokenResponse = await fetch('https://api.enphaseenergy.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': navigator.userAgent,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: oauthConfig.redirectUri,
        client_id: process.env.NEXT_PUBLIC_ENPHASE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_ENPHASE_CLIENT_SECRET
      })
    })

    console.log('📡 [FRONTEND-OAUTH] Token exchange response received', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    })

    const tokenData = await tokenResponse.json()
    console.log('📊 [FRONTEND-OAUTH] Token response data:', tokenData)

    if (!tokenResponse.ok) {
      console.error('❌ [FRONTEND-OAUTH] Token exchange failed', {
        status: tokenResponse.status,
        error: tokenData
      })
      return {
        success: false,
        error: tokenData.error_description || tokenData.error || 'Token exchange failed'
      }
    }

    console.log('✅ [FRONTEND-OAUTH] Token exchange successful', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    })

    // Enviar tokens para backend armazenar
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_ENPHASE_API_URL}/api/v1/enphase/oauth/store-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId,
        tokens: tokenData,
        metadata: {
          authorizedBy: 'frontend_oauth',
          companyName: 'Solarfy Client',
          adminEmail: session.user.email
        }
      })
    })

    const backendResult = await backendResponse.json()

    if (!backendResponse.ok) {
      console.error('❌ [FRONTEND-OAUTH] Failed to store tokens in backend', backendResult)
      return {
        success: false,
        error: backendResult.error || 'Failed to store tokens'
      }
    }

    return {
      success: true,
      data: {
        tokens: tokenData,
        stored: backendResult.success
      }
    }

  } catch (error) {
    console.error('❌ [FRONTEND-OAUTH] Token exchange error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token exchange failed'
    }
  }
}

export async function addSystemToTenant(tenantId: string, systemId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/tenants/${tenantId}/systems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': session.user.id!
      },
      body: JSON.stringify({
        systemId
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to add system to tenant')
    }

    return {
      success: true,
      data: data.data
    }

  } catch (error) {
    console.error('Add system to tenant error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add system to tenant'
    }
  }
}

export async function removeSystemFromTenant(tenantId: string, systemId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/tenants/${tenantId}/systems/${systemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': session.user.id!
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove system from tenant')
    }

    return {
      success: true,
      data: data.data
    }

  } catch (error) {
    console.error('Remove system from tenant error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove system from tenant'
    }
  }
}

export async function delegateSystemAccess(
  tenantId: string,
  userId: string,
  systemId: string,
  permissions: string[],
  delegatedBy: string,
  expiresAt?: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/tenants/${tenantId}/delegate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': session.user.id!
      },
      body: JSON.stringify({
        userId,
        systemId,
        permissions,
        delegatedBy,
        expiresAt
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delegate system access')
    }

    return {
      success: true,
      data: data.data
    }

  } catch (error) {
    console.error('Delegate system access error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delegate system access'
    }
  }
}

export async function getTenantDelegations(tenantId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/tenants/${tenantId}/delegations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': session.user.id!
      },
      cache: 'no-store'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get tenant delegations')
    }

    return {
      success: true,
      data: data.data
    }

  } catch (error) {
    console.error('Get tenant delegations error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tenant delegations'
    }
  }
}

export async function revokeTenantAuthorization(tenantId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/tenants/${tenantId}/authorize`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-user-id': session.user.id!
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to revoke tenant authorization')
    }

    return {
      success: true,
      data: data.data
    }

  } catch (error) {
    console.error('Revoke tenant authorization error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke tenant authorization'
    }
  }
}

/**
 * Process OAuth callback from Enphase
 */
export async function processOAuthCallback(code: string, state: string) {
  try {
    console.log('🔐 Process OAuth callback - Starting...')
    console.log('📝 Code:', code)
    console.log('📝 State:', state)

    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      console.log('❌ No session found')
      return {
        success: false,
        error: 'Unauthorized - No active session'
      }
    }

    console.log('✅ Session found for user:', session.user.email)

    // Decodificar state para obter tenantId e systemId
    let stateData
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
      console.log('✅ State decoded:', stateData)
    } catch (e) {
      console.log('❌ Invalid state parameter')
      throw new Error('Invalid state parameter')
    }

    const { tenantId, flow } = stateData

    if (!tenantId || flow !== 'tenant_oauth') {
      console.log('❌ Invalid OAuth callback parameters')
      throw new Error('Invalid OAuth callback parameters')
    }

    console.log('✅ Calling authorizeTenant for tenant:', tenantId)

    // Autorizar tenant com o código recebido
    const result = await authorizeTenant(tenantId, code, {
      authorizedBy: session.user.id!,
      companyName: '', // Será preenchido posteriormente
      adminEmail: session.user.email!
    })

    console.log('📊 AuthorizeTenant result:', result)

    if (!result.success) {
      console.log('❌ AuthorizeTenant failed:', result.error)
      throw new Error(result.error || 'Failed to complete OAuth authorization')
    }

    console.log('✅ OAuth authorization completed successfully!')
    return {
      success: true,
      data: {
        tenantId,
        message: 'OAuth authorization completed successfully'
      }
    }

  } catch (error) {
    console.error('❌ Process OAuth callback error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process OAuth callback'
    }
  }
}