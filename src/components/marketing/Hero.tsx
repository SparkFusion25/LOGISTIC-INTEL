'use client'

import { ArrowRight, Play, Sparkles, TrendingUp, Users, Globe } from 'lucide-react'
import { Typewriter } from './Typewriter'
import { MapMini } from './MapMini'

export function Hero() {
  const trustLogos = [
    'Maersk', 'FedEx', 'DHL', 'UPS', 'Amazon', 'Walmart'
  ]

  const typewriterPhrases = [
    'decision-makers',
    'trade lanes', 
    'tariff exposure',
    'market trends',
    'supply chains',
    'freight insights'
  ]

  const liveStats = [
    { icon: Globe, value: '2.4M+', label: 'Live shipments' },
    { icon: Users, value: '180K+', label: 'Contacts enriched' },
    { icon: TrendingUp, value: '94%', label: 'Accuracy rate' }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 179, 164, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(124, 139, 255, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="text-center lg:text-left">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted">Enterprise-grade freight intelligence</span>
            </div>

            {/* Main Headline with Typewriter */}
            <h1 className="heading-xl mb-6">
              Freight intelligence that reveals{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <Typewriter phrases={typewriterPhrases} />
              </span>
            </h1>

            {/* Subheading */}
            <p className="body-lg text-muted max-w-xl lg:max-w-none mx-auto mb-8">
              See decision-makers, lanes, and tariff exposure for any company. 
              Add to CRM to unlock premium intel and close deals 3x faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button className="btn-primary inline-flex items-center gap-2 group">
                Get a demo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="btn-secondary inline-flex items-center gap-2 group">
                <Play className="w-4 h-4" />
                Explore live data
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
              {liveStats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div key={index} className="text-center lg:text-left">
                    <div className="flex items-center gap-2 justify-center lg:justify-start mb-1">
                      <IconComponent className="w-4 h-4 text-primary" />
                      <span className="font-bold text-ink text-lg">{stat.value}</span>
                    </div>
                    <span className="text-xs text-muted">{stat.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column - Interactive Map */}
          <div className="order-first lg:order-last">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-60 animate-pulse-glow"></div>
              
              {/* Map Container */}
              <div className="relative">
                <MapMini />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Strip */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted mb-6">Trusted by logistics leaders worldwide</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60 max-w-4xl mx-auto">
            {trustLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-8 text-muted text-sm font-medium bg-surface/30 backdrop-blur-sm rounded-lg px-4 py-2 hover:bg-surface/50 transition-all duration-200"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent"></div>
    </section>
  )
}