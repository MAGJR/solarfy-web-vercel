export default function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Sign Up",
      description: "Create your account and verify your email to get started.",
    },
    {
      step: "2",
      title: "Add Customers",
      description: "Import or add your customers with their information and requirements.",
    },
    {
      step: "3",
      title: "Create Projects",
      description: "Design solar projects and generate professional proposals.",
    },
    {
      step: "4",
      title: "Manage Installations",
      description: "Schedule and track installations with real-time updates.",
    },
  ]

  return (
    <div id="how-it-works" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Solarfy Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started with Solarfy in four simple steps and transform your solar business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}