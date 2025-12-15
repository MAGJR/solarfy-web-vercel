'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-background border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Solarfy</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link
              href="/auth/signin"
              className="text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="#features" className="block text-foreground hover:text-primary px-3 py-2">
                Features
              </Link>
              <Link href="#how-it-works" className="block text-foreground hover:text-primary px-3 py-2">
                How It Works
              </Link>
              <Link href="#pricing" className="block text-foreground hover:text-primary px-3 py-2">
                Pricing
              </Link>
              <Link href="/auth/signin" className="block text-foreground hover:text-primary px-3 py-2">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 mx-3"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}