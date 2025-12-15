'use client'

type TelemetryTab = 'telemetry' | 'status'

interface TelemetryNavigationProps {
  activeTab: TelemetryTab
  onTabChange: (tab: TelemetryTab) => void
  systemName?: string
  hasDevices?: boolean
  hasTelemetry?: boolean
  hasStatus?: boolean
}

export default function TelemetryNavigation({
  activeTab,
  onTabChange,
  systemName = 'Solar System',
  hasDevices = true,
  hasTelemetry = true,
  hasStatus = true
}: TelemetryNavigationProps) {
  const getTabs = () => {
    const tabs = []

    // Telemetry tab (combina system + detailed)
    if (hasTelemetry) {
      tabs.push({
        name: 'Telemetry',
        id: 'telemetry' as TelemetryTab,
        current: activeTab === 'telemetry',
        description: 'Real-time system telemetry and metrics'
      })
    }

    // Status tab (includes both system status and devices)
    if (hasStatus || hasDevices) {
      tabs.push({
        name: 'Status',
        id: 'status' as TelemetryTab,
        current: activeTab === 'status',
        description: 'System status, devices and hardware information'
      })
    }

    return tabs
  }

  const tabs = getTabs()

  return (
    <div className="bg-card border-b border-border">
      <div className="w-full">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-foreground">
            System Monitoring
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time monitoring and telemetry data for {systemName}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${
                tab.current
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
              title={tab.description}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}