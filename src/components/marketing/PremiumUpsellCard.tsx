'use client'

import { Crown, CheckCircle, ArrowRight, Zap, Shield, Users } from 'lucide-react'

interface PremiumUpsellCardProps {
  size?: 'sm' | 'md' | 'lg'
}

export function PremiumUpsellCard({ size = 'md' }: PremiumUpsellCardProps) {
  const isLarge = size === 'lg'
  
  const premiumFeatures = [
    {
      icon: Shield,
      title: 'Advanced Filtering',
      description: 'Filter by trade lanes, tariff codes, and compliance status'
    },
    {
      icon: Zap,
      title: 'Real-time Alerts',
      description: 'Get notified when your competitors ship new routes'
    },
    {
      icon: Users,
      title: 'Decision Makers',
      description: 'Access contact info for procurement and logistics teams'
    },
    {
      icon: Crown,
      title: 'Priority Support',
      description: '24/7 dedicated support and custom data requests'
    }
  ]

  return (
    <div className={`card relative overflow-hidden ${isLarge ? 'p-8' : 'p-6'}`}>
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10"></div>
      
      {/* Crown icon */}
      <div className="absolute top-4 right-4 p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
        <Crown className="w-5 h-5 text-white" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold text-sm mb-2">
            <Zap className="w-4 h-4 text-primary" />
            PREMIUM INTELLIGENCE
          </div>
          <h3 className={`font-bold text-ink mb-2 ${isLarge ? 'text-xl' : 'text-lg'}`}>
            Unlock Complete Market Intelligence
          </h3>
          <p className="text-muted text-sm">
            Get access to decision-makers, advanced analytics, and exclusive insights
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid gap-4 mb-6 ${isLarge ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {premiumFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <IconComponent className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-ink text-sm mb-1">{feature.title}</h4>
                  <p className="text-muted text-xs leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="btn-primary inline-flex items-center gap-2 group w-full justify-center">
            Upgrade to Premium
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-xs text-muted mt-2">
            30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}