"use client"

import { useState, useEffect } from 'react'
import { authClient } from '@/infrastructure/auth/auth-client.config'

interface User {
  id: string
  email: string
  name?: string
  role?: string
  image?: string
  emailVerified: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession()
        if (session?.data?.user) {
          setUser(session.data.user)
          setIsSignedIn(true)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  return {
    user,
    isSignedIn,
    loading
  }
}