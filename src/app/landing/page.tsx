'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Globe, 
  TrendingUp, 
  Users, 
  Zap, 
  Database, 
  BarChart3, 
  Mail, 
  Linkedin, 
  Ship, 
  Plane, 
  MapPin, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Play, 
  Package, 
  Grid3x3,
  ChevronDown,
  Menu,
  X,
  Shield,
  Clock,
  Award,
  Sparkles
} from 'lucide-react'

const LogisticIntelLanding = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('search')
  const [isVisible, setIsVisible] = useState({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      id: 'search',
      icon: Search,
      title: 'Smart Company Lookup',
      description: 'AI-powered search for global trade data and company intelligence',
      details: [
        'Real-time company search with fuzzy matching',
        'Historical trade data spanning 10+ years',
        'HS code and commodity classification',
        'Multi-source data aggregation & validation'
      ],
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into air freight and ocean shipping patterns',
      details: [
        'Turkey air & ocean export analytics',
        'Port and airport performance metrics',
        'Predictive volume forecasting',
        'Multi-modal route optimization'
      ],
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'crm',
      icon: Users,
      title: 'Intelligent CRM',
      description: 'Next-generation contact management with automated outreach',
      details: [
        'AI-powered contact enrichment',
        'Automated email campaign sequences',
        'Activity tracking & lead scoring',
        'LinkedIn & social integration'
      ],
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'intelligence',
      icon: Zap,
      title: 'Trade Intelligence',
      description: 'Machine learning insights for strategic trade decisions',
      details: [
        'Market opportunity identification',
        'Competitive landscape analysis',
        'Risk assessment & mitigation',
        'Predictive trade flow modeling'
      ],
      gradient: 'from-orange-500 to-orange-600'
    }
  ]

  const pricingTiers = [
    {
      name: 'Starter',
      price: '$79',
      period: '/month',
      description: 'Perfect for small logistics teams',
      features: [
        '500 company searches/month',
        '12-month trade history access',
        'Basic trade analytics dashboard',
        '100 CRM contacts',
        'Email & phone contact data',
        'Email support',
        'Basic reporting'
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false,
      savings: null
    },
    {
      name: 'Professional',
      price: '$150',
      period: '/month',
      description: 'For growing trade operations',
      features: [
        'Unlimited company searches',
        'Full historical data access (20+ years)',
        'Advanced ocean & air analytics',
        '1,000 CRM contacts',
        '500 enriched LinkedIn profiles',
        'Automated email campaigns',
        'Priority support',
        'Custom reporting & exports',
        'API access (5,000 calls/month)'
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
      savings: 'Save $300/year'
    },
    {
      name: 'Enterprise',
      price: '$299',
      period: '/month',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Advanced air freight analytics',
        'Unlimited CRM contacts',
        '2,000 enriched LinkedIn profiles',
        'Full automation suite',
        'Unlimited API access',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      popular: false,
      savings: 'Custom pricing'
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Logistics",
      company: "Pacific Trade Solutions",
      avatar: "SC",
      content: "Logistic Intel transformed how we identify trade opportunities. The combined air & ocean analytics gave us complete visibility into global trade flows. Our deal closure rate increased by 60%.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Business Development Director",
      company: "Global Freight Network",
      avatar: "MR", 
      content: "The ocean freight data is incredibly detailed and accurate. We can now track competitor shipping patterns across both air and sea routes instantly. Game-changing for our competitive analysis.",
      rating: 5
    },
    {
      name: "Jennifer Walsh",
      role: "Sales Director",
      company: "Maritime Solutions Inc",
      avatar: "JW",
      content: "Our lead conversion rate increased by 40% after implementing the CRM tools. The LinkedIn enrichment features are absolutely game-changing for B2B outreach in the logistics industry.",
      rating: 5
    }
  ]

  const integrations = [
    { name: 'UN Comtrade', icon: '🌐', description: 'Global trade database' },
    { name: 'US Census', icon: '📊', description: 'Official trade statistics' },
    { name: 'BTS Transtats', icon: '✈️', description: 'Air cargo data' },
    { name: 'LinkedIn Sales', icon: '💼', description: 'Professional networks' },
    { name: 'Stripe', icon: '💳', description: 'Secure payments' },
    { name: 'Supabase', icon: '⚡', description: 'Real-time database' }
  ]

  const stats = [
    { number: '50M+', label: 'Trade Records', icon: Database },
    { number: '200+', label: 'Countries', icon: Globe },
    { number: '99.9%', label: 'Uptime', icon: Shield },
    { number: '24/7', label: 'Support', icon: Clock }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-sm text-white sticky top-0 z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                Logistic Intel
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors duration-200">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors duration-200">Pricing</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors duration-200">Reviews</a>
              <button 
                onClick={() => router.push('/login')}
                className="text-slate-300 hover:text-white transition-colors duration-200"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-sky-500 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-700">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
                <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Reviews</a>
                <button 
                  onClick={() => router.push('/login')}
                  className="text-left text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold w-full"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-sky-500/10 backdrop-blur-sm border border-sky-500/20 rounded-full px-6 py-2">
                <span className="text-sky-400 text-sm font-medium flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Powered by AI & Real-time Data
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
              <span className="bg-gradient-to-r from-white via-sky-100 to-white bg-clip-text text-transparent">
                Global Trade Intelligence
              </span>
              <span className="block text-slate-300 text-4xl md:text-5xl mt-4">
                for Modern Logistics
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Unlock actionable insights into international air & ocean shipment volumes, trade patterns, and sales opportunities with our comprehensive intelligence platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <button 
                onClick={() => router.push('/login')}
                className="group bg-gradient-to-r from-sky-400 to-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-2xl hover:shadow-sky-500/25 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 flex items-center">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-sky-400" />
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Enhanced Dashboard Preview */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Company Search Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Smart Company Search</h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search global companies..." 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none transition-colors"
                  />
                  <Search className="absolute right-4 top-4 w-5 h-5 text-slate-400" />
                </div>
                <button className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-sky-500 hover:to-blue-600 transition-all duration-200">
                  Search Trade Data
                </button>
                <div className="text-sm text-slate-400">
                  <div className="flex items-center justify-between mb-2">
                    <span>Recent searches:</span>
                    <span className="text-sky-400">50M+ records</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      ACME Trading Corp
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Global Logistics Inc
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Analytics Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Live Analytics</h3>
                </div>
                <div className="text-xs text-emerald-400 bg-emerald-400/20 px-2 py-1 rounded-full">LIVE</div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Air Export</div>
                    <div className="text-2xl font-bold text-white">230.4K</div>
                    <div className="text-xs text-emerald-400">+12.5%</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Ocean Export</div>
                    <div className="text-2xl font-bold text-white">1.2M</div>
                    <div className="text-xs text-emerald-400">+8.3%</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300 flex items-center">
                      <Plane className="w-4 h-4 mr-2 text-blue-400" />
                      Frankfurt
                    </span>
                    <span className="text-sm font-semibold text-white">55.1K</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-1000" style={{width: '70%'}}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300 flex items-center">
                      <Ship className="w-4 h-4 mr-2 text-emerald-400" />
                      Hamburg
                    </span>
                    <span className="text-sm font-semibold text-white">320K</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full transition-all duration-1000" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced CRM Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold">CRM & Outreach</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-white">EW</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">Ethan Wright</div>
                    <div className="text-sm text-slate-400">Purchasing Manager</div>
                    <div className="text-xs text-slate-500">ACME Corp • San Francisco</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gradient-to-r from-sky-400 to-blue-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:from-sky-500 hover:to-blue-600 transition-all duration-200">
                    Send Email
                  </button>
                  <button className="bg-white/10 border border-white/20 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">
                    LinkedIn
                  </button>
                </div>
                
                <div className="text-xs text-slate-400 bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span>Email open rate:</span>
                    <span className="text-emerald-400 font-semibold">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Response rate:</span>
                    <span className="text-emerald-400 font-semibold">34%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-slate-50 to-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <div className="bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium">
                Complete Trade Intelligence Platform
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Everything you need to dominate
              <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                global trade
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From AI-powered search to automated outreach, our platform provides the complete toolkit for modern logistics professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.id}
                  className={`group bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 ${
                    activeTab === feature.id ? 'ring-2 ring-sky-400 shadow-2xl transform -translate-y-2' : ''
                  }`}
                  onClick={() => setActiveTab(feature.id)}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-start text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-24 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Powered by the world's most
              <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                trusted data sources
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Access real-time trade data from authoritative global APIs and databases
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="group text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-sky-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{integration.icon}</div>
                <h3 className="font-bold text-slate-800 mb-2">{integration.name}</h3>
                <p className="text-xs text-slate-600">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-slate-50 to-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Trusted by Industry Leaders
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              What our customers say
            </h2>
            <p className="text-xl text-slate-600">
              Join thousands of logistics professionals who trust Logistic Intel
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12 border border-slate-200">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl md:text-3xl font-medium text-slate-800 leading-relaxed italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-6">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className="font-bold text-xl text-slate-800">{testimonials[currentTestimonial].name}</div>
                  <div className="text-slate-600">{testimonials[currentTestimonial].role}</div>
                  <div className="text-slate-500">{testimonials[currentTestimonial].company}</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-sky-500 scale-125' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing */}
      <section id="pricing" className="py-24 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                Simple, Transparent Pricing
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Choose the plan that
              <span className="block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                scales with your business
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              Start free, upgrade as you grow. No hidden fees, cancel anytime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl border-2 p-8 transition-all duration-300 ${
                  tier.popular 
                    ? 'border-sky-400 shadow-2xl scale-105 bg-gradient-to-br from-sky-50 to-white' 
                    : 'border-slate-200 hover:border-sky-300 hover:shadow-xl'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {tier.savings && (
                  <div className="absolute -top-3 -right-3">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {tier.savings}
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-slate-800">{tier.price}</span>
                    <span className="text-slate-600 ml-2">{tier.period}</span>
                  </div>
                  <p className="text-slate-600">{tier.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => router.push('/login')}
                  className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-200 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600 shadow-lg hover:shadow-xl'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-slate-600 mb-4">All plans include 14-day free trial • No credit card required</p>
            <a href="#" className="text-sky-600 hover:text-sky-700 font-semibold">
              Need a custom plan? Contact our sales team →
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-sky-500/20 backdrop-blur-sm border border-sky-500/30 rounded-full px-6 py-2">
              <span className="text-sky-400 text-sm font-medium">Ready to get started?</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Transform your trade intelligence
            <span className="block bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
              starting today
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join thousands of logistics professionals who use Logistic Intel to identify opportunities, analyze markets, and accelerate growth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => router.push('/login')}
              className="group w-full sm:w-auto bg-gradient-to-r from-sky-400 to-blue-500 text-white px-10 py-5 rounded-xl text-xl font-bold hover:from-sky-500 hover:to-blue-600 transition-all duration-300 shadow-2xl hover:shadow-sky-500/25 hover:scale-105"
            >
              Start Your Free Trial
              <ArrowRight className="w-6 h-6 ml-3 inline group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="group w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-white/20 transition-all duration-300">
              <Play className="w-6 h-6 mr-3 inline group-hover:scale-110 transition-transform" />
              Schedule Demo
            </button>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
              ✓ 14-day free trial &nbsp;&nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp;&nbsp; ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Grid3x3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                  Logistic Intel
                </span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Empowering logistics professionals with AI-powered trade intelligence and comprehensive market insights for informed business decisions.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <Linkedin className="w-5 h-5 text-slate-400 hover:text-white" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <Mail className="w-5 h-5 text-slate-400 hover:text-white" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">&copy; 2025 Logistic Intel. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-500 text-sm">Made with ❤️ for the logistics industry</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  )
}

export default LogisticIntelLanding