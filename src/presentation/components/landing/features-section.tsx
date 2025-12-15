export default function FeaturesSection() {
  const features = [
    {
      title: "Customer Management",
      description: "Complete customer profiles with US-specific validations for SSN, EIN, and ZIP codes.",
      icon: "👥",
    },
    {
      title: "Project Tracking",
      description: "Track solar projects from initial planning through completion with status updates.",
      icon: "📊",
    },
    {
      title: "Equipment Catalog",
      description: "Manage solar panels, inverters, and other equipment with pricing and specifications.",
      icon: "⚡",
    },
    {
      title: "Automated Proposals",
      description: "Generate professional proposals with accurate cost calculations instantly.",
      icon: "💰",
    },
    {
      title: "Installation Management",
      description: "Schedule and track installations with real-time progress monitoring.",
      icon: "🏗️",
    },
    {
      title: "Performance Analytics",
      description: "Monitor system performance and generate detailed reports for your clients.",
      icon: "📈",
    },
  ]

  return (
    <div id="features" className="py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Manage Solar Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to run your solar business efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-muted rounded-lg p-8 hover:shadow-lg transition-shadow border border-border">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}