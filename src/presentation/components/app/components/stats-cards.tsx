import Card from './card'

export default function StatsCards() {
  const stats = [
    {
      title: 'Total Customers',
      value: '156',
      change: '+12%',
      changeType: 'positive' as const,
      icon: '👥',
    },
    {
      title: 'Active Projects',
      value: '42',
      change: '+8%',
      changeType: 'positive' as const,
      icon: '🏗️',
    },
    {
      title: 'Completed Installations',
      value: '89',
      change: '+23%',
      changeType: 'positive' as const,
      icon: '✅',
    },
    {
      title: 'Revenue This Month',
      value: '$45,678',
      change: '+15%',
      changeType: 'positive' as const,
      icon: '💰',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 5xl:grid-cols-12 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">{stat.icon}</span>
            <span
              className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stat.change}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
          <p className="text-sm text-gray-600">{stat.title}</p>
        </Card>
      ))}
    </div>
  )
}