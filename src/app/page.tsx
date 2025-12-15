import Navigation from "@/presentation/components/layout/navigation"
import HeroSection from "@/presentation/components/landing/hero-section"
import FeaturesSection from "@/presentation/components/landing/features-section"
import HowItWorksSection from "@/presentation/components/landing/how-it-works-section"
import Footer from "@/presentation/components/landing/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  )
}