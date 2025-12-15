import {
  Sidebar,
  DashboardHeader,
  StatsCards,
  RecentActivity,
  ChartSection,
} from './components'

interface DashboardLayoutProps {
  pageTitle?: string
  children?: React.ReactNode
}

export default function DashboardLayout({ pageTitle, children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader pageTitle={pageTitle} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          {children ? (
            children
          ) : (
            <div>
              <StatsCards />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ChartSection />
                </div>
                <div>
                  <RecentActivity />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}