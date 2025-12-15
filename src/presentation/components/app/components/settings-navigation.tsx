'use client'

type SettingsTab = 'company' | 'invite' | 'users' | 'profile' | 'billing' | 'integrations'

interface SettingsNavigationProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
  userRole: string
}

export default function SettingsNavigation({ activeTab, onTabChange, userRole }: SettingsNavigationProps) {
  // Different tabs based on user role
  const getTabs = () => {
    if (userRole === 'VIEWER') {
      return [
        {
          name: 'Profile',
          id: 'profile' as SettingsTab,
          current: activeTab === 'profile'
        },
        {
          name: 'Billing',
          id: 'billing' as SettingsTab,
          current: activeTab === 'billing'
        }
      ]
    } else {
      // ADMIN/MANAGER tabs
      return [
        {
          name: 'Company Info',
          id: 'company' as SettingsTab,
          current: activeTab === 'company'
        },
        {
          name: 'Invite Users',
          id: 'invite' as SettingsTab,
          current: activeTab === 'invite'
        },
        {
          name: 'Manage Users',
          id: 'users' as SettingsTab,
          current: activeTab === 'users'
        },
        {
          name: 'Integrations',
          id: 'integrations' as SettingsTab,
          current: activeTab === 'integrations'
        }
      ]
    }
  }

  const tabs = getTabs()

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-foreground">
            {userRole === 'VIEWER' ? 'My Settings' : 'Settings'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {userRole === 'VIEWER'
              ? 'Manage your profile and account settings'
              : 'Manage your company settings, users, and permissions'
            }
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${
                tab.current
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}