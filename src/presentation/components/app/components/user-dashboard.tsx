'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/infrastructure/auth/auth-client.config'
import { ServiceRequestModal } from './service-request-modal'
import { createProjectRequest } from '@/app/app/project-requests/actions'
import { CreateProjectRequestInput } from '@/domains/project-requests/entities/project-request.entity'
import { toast } from 'sonner'

export default function UserDashboard() {
  const [userProjects, setUserProjects] = useState<any[]>([])
  const [userStats, setUserStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalKw: 0,
    co2Saved: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch real user projects from API
        const response = await fetch('/api/projects')

        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }

        const data = await response.json()

        if (data.success && data.projects) {
          // Transform project data for UI
          const transformedProjects = data.projects.map((project: any) => ({
            id: project.id,
            name: project.name,
            status: project.status,
            kw: project.estimatedKw,
            completionDate: project.updatedAt, // Using updatedAt as completion date for now
            address: project.address,
            description: project.description
          }))

          setUserProjects(transformedProjects)

          // Calculate stats
          const totalProjects = transformedProjects.length
          const completedProjects = transformedProjects.filter((p: any) => p.status === 'COMPLETED').length
          const totalKw = transformedProjects.reduce((sum: number, p: any) => sum + (p.kw || 0), 0)
          const co2Saved = Math.round(totalKw * 136) // Rough estimate: 1kW = 136kg CO2 saved per year

          setUserStats({
            totalProjects,
            completedProjects,
            totalKw: Math.round(totalKw * 10) / 10, // Round to 1 decimal
            co2Saved
          })
        } else {
          // No projects found
          setUserProjects([])
          setUserStats({
            totalProjects: 0,
            completedProjects: 0,
            totalKw: 0,
            co2Saved: 0
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Set empty state on error
        setUserProjects([])
        setUserStats({
          totalProjects: 0,
          completedProjects: 0,
          totalKw: 0,
          co2Saved: 0
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleCreateProjectRequest = async (data: any) => {
    setIsSubmitting(true)

    try {
      // Transform service request data to project request format
      const projectRequestData: CreateProjectRequestInput = {
        serviceType: 'RESIDENTIAL_INSTALLATION', // Default - would be determined by service
        priority: 'NORMAL',
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: 'Brazil',
        title: `Request: ${data.serviceTitle || 'Solar Service'}`,
        description: data.message || 'Customer requested information about solar energy services.',
        estimatedBudget: undefined,
        propertyType: data.propertyType as any,
        roofType: undefined,
        createdById: '', // Will be set in the action
        tenantId: '', // Will be set in the action
      }

      const result = await createProjectRequest(projectRequestData)

      if (result.success) {
        toast.success('Service request sent successfully! We will contact you soon.')
        setIsModalOpen(false)

        // Optional: Reload data or update UI
        // await fetchUserData()
      } else {
        toast.error(result.error || 'Error sending request. Please try again.')
      }
    } catch (error) {
      console.error('Error creating project request:', error)
      toast.error('Error sending request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Solar Projects</h1>
          <p className="text-muted-foreground">Track your solar energy installations</p>
        </div>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          onClick={() => setIsModalOpen(true)}
        >
          Request Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 5xl:grid-cols-12 gap-6">
        <div className="bg-card rounded-lg shadow p-6 border border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold text-foreground">{userStats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">{userStats.completedProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">⚡</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">Total Power</p>
              <p className="text-2xl font-bold text-foreground">{userStats.totalKw} kW</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-6 border border-border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">🌱</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              <p className="text-2xl font-bold text-foreground">{userStats.co2Saved} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-card rounded-lg shadow border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Your Projects</h3>
        </div>
        {userProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have any projects yet.</p>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Request Your First Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Power (kW)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {userProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        project.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : project.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {project.kw || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {project.address || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {project.completionDate
                        ? new Date(project.completionDate).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary hover:text-primary/80 mr-3">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-muted rounded-lg p-6 border border-border">
        <h3 className="text-lg font-medium text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="bg-card text-primary border border-border px-4 py-3 rounded-md hover:bg-muted transition-colors text-sm font-medium"
            onClick={() => setIsModalOpen(true)}
          >
            📋 Request Service
          </button>
          <button className="bg-card text-primary border border-border px-4 py-3 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            📊 View Reports
          </button>
          <button className="bg-card text-primary border border-border px-4 py-3 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            📞 Contact Support
          </button>
        </div>
      </div>

      {/* Service Request Modal */}
      <ServiceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProjectRequest}
        isLoading={isSubmitting}
      />
    </div>
  )
}