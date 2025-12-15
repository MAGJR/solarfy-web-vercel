'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import { redirect } from 'next/navigation'
import SettingsNavigation from '@/presentation/components/app/components/settings-navigation'
import CompanyInfo from './components/company-info'
import InviteUsers from './components/invite-users'
import ManageUsers from './components/manage-users'
import UserProfile from './components/user-profile'
import BillingSettings from './components/billing-settings'

type SettingsTab = 'company' | 'invite' | 'users' | 'profile' | 'billing' | 'integrations'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  tenantId: string | null
  createdAt: string
  status: 'active' | 'inactive'
}

interface SettingsLayoutProps {
  children?: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { user } = useUserRole()
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<SettingsTab>('company')

  useEffect(() => {
    if (user && !['ADMIN', 'MANAGER', 'USER', 'VIEWER'].includes(user.role)) {
      redirect('/app')
    }
  }, [user, redirect])

  useEffect(() => {
    // Skip tab sync for dynamic routes like user edit pages
    if (pathname.includes('/settings/user/') && pathname.includes('/edit')) {
      return // Don't change activeTab for edit pages
    }

    // Sync URL with active tab based on user role
    if (pathname === '/app/settings' || pathname === '/app/settings/') {
      setActiveTab(user?.role === 'VIEWER' ? 'profile' : 'company')
    } else if (pathname === '/app/settings/invite') {
      setActiveTab('invite')
    } else if (pathname === '/app/settings/user') {
      setActiveTab('users')
    } else if (pathname === '/app/settings/profile') {
      setActiveTab('profile')
    } else if (pathname === '/app/settings/billing') {
      setActiveTab('billing')
    } else if (pathname === '/app/settings/enphase' || pathname.startsWith('/app/settings/enphase')) {
      setActiveTab('integrations')
    }
  }, [pathname, user])

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab)

    // Update URL without page reload based on tab
    let url: string
    switch (tab) {
      case 'company':
        url = '/app/settings'
        break
      case 'profile':
        url = '/app/settings/profile'
        break
      case 'billing':
        url = '/app/settings/billing'
        break
      case 'invite':
        url = '/app/settings/invite'
        break
      case 'users':
        url = '/app/settings/user'
        break
      case 'integrations':
        url = '/app/settings/enphase'
        break
      default:
        url = '/app/settings'
    }
    router.push(url, { scroll: false })
  }

  if (!user || !['ADMIN', 'MANAGER', 'USER', 'VIEWER'].includes(user.role)) {
    return null
  }

  const renderContent = () => {
    // Create a user object with all required properties
    const fullUser: User = {
      id: user?.id || '',
      name: user?.name || null,
      email: user?.email || '',
      role: user?.role || '',
      tenantId: user?.tenantId || null,
      createdAt: new Date().toISOString(),
      status: 'active'
    }

    // For dynamic routes (like user edit pages), render children directly
    if (pathname.includes('/settings/user/') && pathname.includes('/edit')) {
      return <>{children}</>
    }

    // For integration routes, render children directly
    if (pathname.startsWith('/app/settings/enphase')) {
      return <>{children}</>
    }

    // Render content based on user role and active tab
    if (user.role === 'VIEWER') {
      switch (activeTab) {
        case 'profile':
          return <UserProfile user={fullUser} />
        case 'billing':
          return <BillingSettings user={fullUser} />
        default:
          return <UserProfile user={fullUser} />
      }
    } else {
      // ADMIN/MANAGER content
      switch (activeTab) {
        case 'company':
          return <CompanyInfo user={fullUser} />
        case 'invite':
          return <InviteUsers user={fullUser} />
        case 'users':
          return <ManageUsers user={fullUser} />
        default:
          return <CompanyInfo user={fullUser} />
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SettingsNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole={user.role}
      />

      <div className="py-6">
        {renderContent()}
      </div>
    </div>
  )
}