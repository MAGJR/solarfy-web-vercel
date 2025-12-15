import type { Metadata } from 'next'
import DashboardWrapper from '@/presentation/components/app/components/dashboard-wrapper'
import { ReactQueryProvider } from '@/lib/react-query'

export const metadata: Metadata = {
  title: 'Dashboard - Solarfy',
  description: 'Solarfy dashboard for solar energy project management',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryProvider>
      <DashboardWrapper>{children}</DashboardWrapper>
    </ReactQueryProvider>
  )
}