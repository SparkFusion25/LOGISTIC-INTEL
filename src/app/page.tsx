import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Globe, TrendingUp, Shield, Users, BarChart3, Search, Zap, CheckCircle, Star, Clock, Award, Target, PlayCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Logistic Intel - AI-Powered Global Trade Intelligence Platform',
  description: 'Transform your logistics operations with comprehensive trade intelligence, real-time freight analytics, and AI-powered market insights. Access 50M+ trade records across 200+ countries.',
  keywords: ['freight intelligence', 'global trade data', 'logistics analytics', 'supply chain intelligence', 'trade analytics', 'freight rates', 'market intelligence'],
  authors: [{ name: 'Logistic Intel' }],
  creator: 'Logistic Intel',
  publisher: 'Logistic Intel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://logistic-intel.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Logistic Intel - AI-Powered Global Trade Intelligence',
    description: 'Access comprehensive trade intelligence with real-time analytics and AI-powered insights for smarter logistics decisions.',
    url: 'https://logistic-intel.com',
    siteName: 'Logistic Intel',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Logistic Intel - Global Trade Intelligence Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logistic Intel - AI-Powered Global Trade Intelligence',
    description: 'Transform your logistics with comprehensive trade intelligence and real-time analytics.',
    images: ['/og-image.jpg'],
    creator: '@logistic_intel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function HomePage() {
  const features = [
    {
      icon: Globe,
      title: 'Global Trade Coverage',
      description: 'Access comprehensive trade data from 200+ countries with real-time updates and historical insights.',
    },
    {
      icon: TrendingUp,
      title: 'Market Intelligence',
      description: 'AI-powered analytics reveal market trends, pricing patterns, and emerging opportunities.',
    },
    {
      icon: Shield,
      title: 'Verified Data Sources',
      description: 'Trusted government databases, customs records, and verified commercial sources.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep dive into freight rates, route optimization, and competitive intelligence.',
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find exactly what you need with intelligent filters and natural language queries.',
    },
    {
      icon: Zap,
      title: 'Real-Time Alerts',
      description: 'Stay ahead with instant notifications on market changes and new opportunities.',
    },
  ]

  const stats = [
    { number: '50M+', label: 'Trade Records' },
    { number: '200+', label: 'Countries' },
    { number: '10K+', label: 'Active Users' },
    { number: '99.9%', label: 'Uptime' },
  ]

  const testimonials = [
    {
      quote: "Logistic Intel transformed our procurement strategy. We identified $2M in cost savings within the first quarter.",
      author: "Sarah Chen",
      title: "Chief Procurement Officer",
      company: "Global Manufacturing Corp",
      rating: 5,
    },
    {
      quote: "The market intelligence is unmatched. We spotted emerging trade routes before our competition.",
      author: "Marcus Rodriguez",
      title: "VP of Operations",
      company: "TransGlobal Logistics",
      rating: 5,
    },
    {
      quote: "Real-time freight rate tracking helped us optimize our shipping costs by 30%. Incredible platform.",
      author: "Lisa Wang",
      title: "Supply Chain Director",
      company: "TechFlow Solutions",
      rating: 5,
    },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small businesses getting started with trade intelligence',
      features: [
        'Access to basic trade data',
        'Monthly market reports',
        'Email support',
        'Up to 1,000 searches/month',
        'Standard data exports',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'Advanced features for growing logistics operations',
      features: [
        'Complete trade intelligence',
        'Real-time alerts & notifications',
        'Advanced analytics dashboard',
        'Unlimited searches',
        'API access',
        'Priority support',
        'Custom reports',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large organizations',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'Advanced security features',
        'SLA guarantees',
        'Training & onboarding',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Logistic Intel</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
              <Link href="/resources" className="text-gray-600 hover:text-gray-900 transition-colors">Resources</Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
              <Link href="/login" className="text-sky-600 hover:text-sky-700 font-semibold transition-colors">Sign In</Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all duration-300 font-semibold"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                  Trade Intelligence
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Access comprehensive global trade data, real-time freight analytics, and AI-powered market insights 
                to make smarter logistics decisions and drive business growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-bold hover:from-sky-500 hover:to-blue-600 transition-all duration-300 flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/demo"
                  className="bg-white border-2 border-sky-500 text-sky-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-sky-50 transition-all duration-300 flex items-center justify-center"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Link>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                14-day free trial • No credit card required • Cancel anytime
              </div>
            </div>

            {/* 3D Rotating Contact Cards */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full mb-4"></div>
                  <h3 className="font-bold text-gray-900 mb-2">Trade Analytics</h3>
                  <p className="text-sm text-gray-600">Real-time insights into global trade patterns</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-transform mt-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mb-4"></div>
                  <h3 className="font-bold text-gray-900 mb-2">Market Intelligence</h3>
                  <p className="text-sm text-gray-600">AI-powered market trend analysis</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-transform -mt-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-4"></div>
                  <h3 className="font-bold text-gray-900 mb-2">Freight Rates</h3>
                  <p className="text-sm text-gray-600">Live pricing from global carriers</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-transform mt-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-4"></div>
                  <h3 className="font-bold text-gray-900 mb-2">Supply Chain</h3>
                  <p className="text-sm text-gray-600">End-to-end visibility and optimization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Everything You Need for Trade Intelligence</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and insights to transform your logistics operations and drive smarter business decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Intelligence Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Find What You Need in <span className="text-sky-600">Seconds</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our intelligent search engine understands natural language queries and delivers precise results 
                from our comprehensive trade database.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Natural language search queries</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Advanced filtering and sorting options</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Real-time data from verified sources</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Export results in multiple formats</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-500">Search for shipments from China to USA containing electronics...</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">iPhone Components</p>
                      <p className="text-sm text-gray-600">Shenzhen → Los Angeles</p>
                    </div>
                    <span className="text-sky-600 font-semibold">$2,450/TEU</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Laptop Displays</p>
                      <p className="text-sm text-gray-600">Shanghai → Oakland</p>
                    </div>
                    <span className="text-gray-600 font-semibold">$2,180/TEU</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Semiconductors</p>
                      <p className="text-sm text-gray-600">Guangzhou → Long Beach</p>
                    </div>
                    <span className="text-gray-600 font-semibold">$2,680/TEU</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500">Found 1,247 shipments in 0.3 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Trusted by Industry Leaders</h2>
            <p className="text-xl text-gray-600">
              Join thousands of logistics professionals who rely on Logistic Intel for critical business decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`rounded-2xl shadow-lg overflow-hidden ${
                plan.popular 
                  ? 'ring-2 ring-sky-500 bg-gradient-to-b from-sky-50 to-white' 
                  : 'bg-white'
              }`}>
                {plan.popular && (
                  <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors text-center block ${
                      plan.popular
                        ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600'
                        : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Trade Intelligence?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of logistics professionals who trust Logistic Intel for critical business decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-8 py-4 rounded-lg font-bold hover:from-sky-500 hover:to-blue-600 transition-all duration-300 flex items-center"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all duration-300"
            >
              Schedule a Demo
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center text-sm text-slate-400">
            <CheckCircle className="w-4 h-4 mr-2" />
            14-day free trial • No credit card required • Cancel anytime
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Logistic Intel</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Transforming global trade intelligence with AI-powered analytics and comprehensive market insights 
                for logistics professionals worldwide.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <Users className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 Logistic Intel. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Logistic Intel',
            url: 'https://logistic-intel.com',
            logo: 'https://logistic-intel.com/logo.svg',
            description: 'AI-powered global trade intelligence and freight analytics platform for logistics professionals',
            foundingDate: '2024',
            industry: 'Logistics and Supply Chain',
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+1-800-LOGISTIC',
              contactType: 'Customer Service',
              email: 'hello@logistic-intel.com',
              availableLanguage: 'English'
            }
          }),
        }}
      />
    </div>
  )
}