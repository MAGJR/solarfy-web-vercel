'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/infrastructure/auth/auth-client.config'

export function useUserRole() {
  const [user, setUser] = useState<{
    id: string
    name: string | null
    email: string
    role: string
    tenantId: string | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        console.log('🔍 Getting user info...')
        const session = await authClient.getSession()
        console.log('📝 Session:', session.data?.user)

        if (session.data?.user) {
          console.log('👤 Session user email:', session.data.user.email)

          const response = await fetch('/api/user/role', {
            headers: {
              'Content-Type': 'application/json',
            },
          })

          console.log('📡 API Response status:', response.status)

          if (response.ok) {
            const userData = await response.json()
            console.log('✅ User data from API:', userData)

            const finalUser = {
              id: session.data.user.id,
              name: session.data.user.name,
              email: session.data.user.email,
              role: userData.role || 'VIEWER',
              tenantId: userData.tenantId || null
            }

            console.log('🎯 Final user object:', finalUser)
            console.log('🔍 User role being set to:', finalUser.role)
            setUser(finalUser)
          } else {
            console.log('❌ API response not ok, fallback to VIEWER')
            // Fallback para role padrão
            setUser({
              id: session.data.user.id,
              name: session.data.user.name,
              email: session.data.user.email,
              role: 'VIEWER',
              tenantId: null
            })
          }
        }
      } catch (error) {
        console.error('❌ Error getting user info:', error)
      } finally {
        console.log('🏁 Finished loading user info')
        setIsLoading(false)
      }
    }

    getUserInfo()
  }, [])

  return { user, isLoading }
}