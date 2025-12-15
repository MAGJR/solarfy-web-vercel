import Link from 'next/link'

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-background to-muted py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Manage Your Solar Energy{" "}
            <span className="block text-primary">Projects Efficiently</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Complete solar energy project management system. From customer acquisition to
            installation monitoring, streamline your solar business with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="#features"
              className="bg-card text-primary border-2 border-primary px-8 py-3 rounded-lg text-lg font-semibold hover:bg-accent transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}