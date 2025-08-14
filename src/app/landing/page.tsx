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
import Logo from '@/components/ui/Logo'
import { Hero } from '@/components/marketing/Hero'
import { CTA } from '@/components/marketing/CTA'
import dynamic from 'next/dynamic'
const BenchmarkWidget = dynamic(() => import('@/components/BenchmarkWidget'), { ssr: false })

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-sm text-white sticky top-0 z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo size="md" variant="white" showText={true} />
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

      {/* New Hero Section */}
      <Hero />

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

      {/* New CTA/Pricing Section */}
      <CTA />

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

      {/* Benchmark Widget */}
      <section className="container grid md:grid-cols-2 gap-6 py-8">
        <BenchmarkWidget />
      </section>

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