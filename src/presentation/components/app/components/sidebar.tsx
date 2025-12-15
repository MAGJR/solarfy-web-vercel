'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useUserRole } from '@/hooks/use-user-role'
import { useUserAccess } from '@/presentation/hooks/use-user-access'
import { authClient } from '@/infrastructure/auth/auth-client.config'
import { RolePermissionsService } from '@/domains/users/services/role-permissions.service'
import {
  OverviewIcon,
  MonitoringIcon,
  ReportsIcon,
  ProjectsIcon,
  SettingsIcon,
  SupportIcon,
  LeadsIcon
} from './icons'
import { FileText } from 'lucide-react'
import { Menu, ChevronDown, User, LogOut, Settings as SettingsIcon2 } from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
  roles?: string[] // If undefined, available to all roles
}

// Helper function to get icon component by name
const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'OverviewIcon':
      return <OverviewIcon />
    case 'MonitoringIcon':
      return <MonitoringIcon />
    case 'ReportsIcon':
      return <ReportsIcon />
    case 'ProjectsIcon':
      return <ProjectsIcon />
    case 'LeadsIcon':
      return <LeadsIcon />
    case 'SettingsIcon':
      return <SettingsIcon />
    case 'SupportIcon':
      return <SupportIcon />
    case 'FileTextIcon':
      return <FileText />
    default:
      return <OverviewIcon />
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { user, isLoading } = useUserRole()
  const { canAccessDashboard, canAccessMonitoring, canAccessSupport, canAccessSettings } = useUserAccess()
  const expandedProfileRef = useRef<HTMLDivElement>(null)
  const collapsedProfileRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        expandedProfileRef.current && !expandedProfileRef.current.contains(event.target as Node) &&
        collapsedProfileRef.current && !collapsedProfileRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  const getSidebarItems = () => {
    if (isLoading || !user) return []

    try {
      const sidebarConfig = RolePermissionsService.getSidebarItems(user.role as any)

      // Apply subscription-based filtering
      const filteredItems = sidebarConfig.filter(item => {
        switch (item.name) {
          case 'Dashboard':
            return canAccessDashboard
          case 'Monitoring':
            return canAccessMonitoring
          case 'Support':
            return canAccessSupport
          case 'Settings':
            return canAccessSettings
          default:
            return item.available // Keep original role-based filtering
        }
      })

      return filteredItems.map(item => ({
        name: item.name,
        href: item.href,
        icon: getIcon(item.icon)
      }))
    } catch (error) {
      console.error('Error getting sidebar items:', error)
      return []
    }
  }

  const sidebarItems = getSidebarItems()

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 dark:bg-background text-white dark:text-foreground transition-all duration-300 ease-in-out border-r border-gray-700 dark:border-border flex flex-col h-screen`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(var(--border)) transparent'
      }}
    >
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-border shrink-0">
        {!isCollapsed && (
          <Link href="/app" className="text-2xl font-bold text-purple-400 dark:text-primary">
            Solarfy
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 dark:hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-300 dark:text-foreground" />
        </button>
      </div>

      {/* Navigation Content - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-4 py-6"
           style={{
             scrollbarWidth: 'thin',
             scrollbarColor: 'rgb(var(--border)) transparent'
           }}>

        {/* Main Navigation */}
        <div>
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = item.href === '/app/settings'
                ? pathname.startsWith('/app/settings')
                : pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-sm dark:bg-primary dark:text-primary-foreground'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white dark:text-muted-foreground dark:hover:bg-muted/60 dark:hover:text-foreground'
                    }`}
                  >
                    <span className={`flex items-center justify-center ${
                      isCollapsed ? 'w-5 h-5' : 'w-5 h-5'
                    }`}>{item.icon}</span>
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile Section - Fixed at Bottom */}
      {user && !isCollapsed && (
        <div className="shrink-0 border-t border-gray-700 dark:border-border/50">
          <div className="p-4">
            <div className="relative" ref={expandedProfileRef}>
              {/* User Info Button */}
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-gray-800 dark:hover:bg-muted/60 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 dark:from-primary dark:to-primary/80 rounded-xl flex items-center justify-center text-white dark:text-primary-foreground font-semibold shadow-sm">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white dark:text-foreground truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 dark:text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                    isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 dark:bg-background border border-gray-700 dark:border-border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {/* User Role Display */}
                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-muted-foreground/80 border-b border-gray-700 dark:border-border/50 mb-1">
                      Role: <span className="text-purple-400 dark:text-primary font-medium">{user.role}</span>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/app/settings"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground hover:bg-gray-700 dark:hover:bg-muted/60 rounded-md transition-all duration-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <SettingsIcon2 className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsProfileMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-400 dark:text-destructive hover:bg-red-900/20 dark:hover:bg-destructive/10 rounded-md transition-all duration-200 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Profile Version */}
      {user && isCollapsed && (
        <div className="shrink-0 border-t border-gray-700 dark:border-border/50 p-4">
          <div className="relative" ref={collapsedProfileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex justify-center w-full p-3 rounded-xl hover:bg-gray-800 dark:hover:bg-muted/60 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 dark:from-primary dark:to-primary/80 rounded-lg flex items-center justify-center text-white dark:text-primary-foreground font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            {/* Collapsed Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 dark:bg-background border border-gray-700 dark:border-border rounded-lg shadow-lg z-50 min-w-48">
                <div className="p-2">
                  {/* User Info */}
                  <div className="px-3 py-2 border-b border-gray-700 dark:border-border/50 mb-1">
                    <p className="text-sm font-medium text-white dark:text-foreground truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-purple-400 dark:text-primary font-medium mt-1">
                      Role: {user.role}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <Link
                    href="/app/settings"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 dark:text-muted-foreground hover:text-white dark:hover:text-foreground hover:bg-gray-700 dark:hover:bg-muted/60 rounded-md transition-all duration-200"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <SettingsIcon2 className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsProfileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-400 dark:text-destructive hover:bg-red-900/20 dark:hover:bg-destructive/10 rounded-md transition-all duration-200 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(var(--border), 0.5);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(var(--border), 0.8);
        }
      `}</style>
    </div>
  )
}