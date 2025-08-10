'use client'

import { ArrowRight, Sparkles, CheckCircle, Crown, Users, Zap, Shield } from 'lucide-react'
import { PremiumUpsellCard } from './PremiumUpsellCard'

export function CTA() {
  const pricingTiers = [
    {
      name: 'Starter',
      price: 49,
      description: 'Perfect for growing teams',
      features: [
        '1,000 company lookups',
        'Basic contact enrichment',
        'Standard search filters',
        'Email support',
        '48-hour response time'
      ],
      cta: 'Start free trial',
      popular: false,
      icon: Users
    },
    {
      name: 'Pro',
      price: 149,
      description: 'Most popular choice',
      features: [
        '10,000 company lookups',
        'Premium intel & triggers',
        'Advanced heat scoring',
        'CRM integrations',
        'Priority support',
        'API access'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      icon: Crown
    },
    {
      name: 'Enterprise',
      price: null,
      description: 'For large organizations',
      features: [
        'Unlimited lookups',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'White-label options',
        'Advanced analytics'
      ],
      cta: 'Contact Sales',
      popular: false,
      icon: Shield
    }
  ]

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Transform Your Sales Process</span>
            </div>

            <h2 className="heading-xl mb-6">
              Choose your{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                intelligence level
              </span>
            </h2>

            <p className="body-lg text-muted max-w-2xl mx-auto">
              Join thousands of logistics professionals who use Logistic Intel to close deals 3x faster 
              and make smarter trade decisions.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier, index) => {
              const IconComponent = tier.icon
              return (
                <div
                  key={index}
                  className={`relative rounded-3xl p-8 ${
                    tier.popular
                      ? 'bg-gradient-to-br from-primary/10 to-accent/5 border-2 border-primary/30 scale-105'
                      : 'bg-card border border-border hover:border-primary/30'
                  } transition-all duration-200 hover:shadow-xl hover:-translate-y-1`}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-primary to-accent text-white text-sm font-medium px-4 py-2 rounded-full">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      tier.popular 
                        ? 'bg-gradient-to-br from-primary to-accent' 
                        : 'bg-gradient-to-br from-muted/20 to-muted/10'
                    }`}>
                      <IconComponent className={`w-8 h-8 ${tier.popular ? 'text-white' : 'text-ink'}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-ink mb-2">{tier.name}</h3>
                    <p className="text-muted text-sm mb-4">{tier.description}</p>
                    
                    <div className="mb-6">
                      {tier.price ? (
                        <>
                          <span className="text-4xl font-bold text-ink">${tier.price}</span>
                          <span className="text-muted ml-2">/month</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-ink">Custom</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-ink">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-6 rounded-2xl font-medium transition-all duration-200 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:-translate-y-0.5'
                        : 'border border-border bg-transparent text-ink hover:bg-surface hover:border-primary/30'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Premium Upsell Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="heading-lg mb-4">
                Unlock premium intelligence features
              </h3>
              <p className="text-muted max-w-2xl mx-auto">
                Get deeper insights, better targeting, and faster results with our premium add-ons
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <PremiumUpsellCard size="lg" />
            </div>
          </div>

          {/* Enterprise CTA */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-60"></div>
            
            <div className="relative bg-gradient-to-br from-card to-surface border border-primary/30 rounded-3xl p-8 md:p-12 text-center">
              {/* Enterprise Badge */}
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent font-medium">Enterprise Ready</span>
              </div>

              {/* Headline */}
              <h2 className="heading-lg mb-4">
                Ready to scale your freight intelligence?
              </h2>

              {/* Description */}
              <p className="body-lg text-muted max-w-2xl mx-auto mb-8">
                Get custom integrations, dedicated support, and enterprise-grade security 
                for your organization.
              </p>

              {/* Enterprise Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Zap className="w-5 h-5 text-accent" />
                  <span className="text-sm text-ink">Custom API limits</span>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="text-sm text-ink">SOC 2 compliance</span>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Users className="w-5 h-5 text-accent" />
                  <span className="text-sm text-ink">Dedicated support</span>
                </div>
              </div>

              {/* Main CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button className="btn-primary inline-flex items-center gap-2 group">
                  Schedule a demo
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="btn-secondary">
                  Contact Sales
                </button>
              </div>

              {/* Trust Elements */}
              <div className="pt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}