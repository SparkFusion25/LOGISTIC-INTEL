import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Globe, Users, Target, Award, BarChart3, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Logistic Intel - Global Trade Intelligence Platform',
  description: 'Learn about Logistic Intel, the AI-powered platform transforming logistics operations with comprehensive trade intelligence and real-time freight analytics.',
  keywords: ['about logistic intel', 'trade intelligence', 'logistics platform', 'freight analytics', 'company'],
}

export default function AboutPage() {
  const stats = [
    { label: 'Trade Records', value: '50M+', icon: BarChart3 },
    { label: 'Countries Covered', value: '200+', icon: Globe },
    { label: 'Active Users', value: '10K+', icon: Users },
    { label: 'Data Sources', value: '100+', icon: Zap },
  ]

  const values = [
    {
      icon: Target,
      title: 'Precision',
      description: 'Delivering accurate, verified trade data for informed decision-making'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Leveraging AI and machine learning to transform logistics intelligence'
    },
    {
      icon: Users,
      title: 'Partnership',
      description: 'Building lasting relationships with our clients through exceptional service'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Maintaining the highest standards in data quality and platform reliability'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Logistic Intel
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Logistic Intel</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              We're transforming global logistics through AI-powered trade intelligence, providing businesses with the insights they need to optimize their supply chains and make informed decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              To democratize access to global trade intelligence by providing logistics professionals with comprehensive, 
              real-time data and AI-powered insights that drive smarter business decisions and operational excellence.
            </p>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <p className="text-lg text-gray-700 italic">
                "We believe that access to accurate trade data should not be a competitive advantage for only the largest corporations. 
                Every logistics professional deserves the tools to succeed in the global marketplace."
              </p>
              <div className="mt-6 text-sky-600 font-semibold">— Logistic Intel Team</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-sky-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Logistics Operations?
          </h2>
          <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Join thousands of logistics professionals who trust Logistic Intel for their trade intelligence needs.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-white text-sky-600 font-semibold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Logistic Intel</span>
            </div>
            <p className="text-gray-400 mb-6">AI-powered global trade intelligence platform</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-400">
              © 2024 Logistic Intel. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}