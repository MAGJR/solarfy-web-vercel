import Card from './card'

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'project_created',
      message: 'New project created for John Doe',
      time: '2 hours ago',
      icon: '🏗️',
    },
    {
      id: 2,
      type: 'proposal_sent',
      message: 'Proposal sent to Sarah Johnson',
      time: '4 hours ago',
      icon: '📧',
    },
    {
      id: 3,
      type: 'installation_completed',
      message: 'Installation completed at 123 Main St',
      time: '1 day ago',
      icon: '✅',
    },
    {
      id: 4,
      type: 'customer_added',
      message: 'New customer registered: Mike Wilson',
      time: '2 days ago',
      icon: '👤',
    },
  ]

  return (
    <Card title="Recent Activity">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <span className="text-xl">{activity.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}