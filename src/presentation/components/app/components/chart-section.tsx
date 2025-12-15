import Card from './card'

export default function ChartSection() {
  return (
    <Card title="Project Overview" description="Projects timeline, revenue, and performance metrics">
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">Chart visualization will be implemented here</p>
        </div>
      </div>
    </Card>
  )
}