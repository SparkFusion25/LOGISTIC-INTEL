'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  BarChart3, 
  Users, 
  Mail, 
  Globe,
  Package,
  Calculator,
  TrendingUp,
  MessageSquare,
  Settings,
  Bell,
  User,
  LogOut,
  Plus,
  Download,
  RefreshCw,
  Menu,
  X,
  Activity,
  CreditCard,
  Eye,
  ExternalLink,
  Phone
} from 'lucide-react'

// Import user components
import SearchPanel from '@/components/user/SearchPanel'
import CRMManager from '@/components/user/CRMManager'
import CampaignBuilder from '@/components/user/CampaignBuilder'

export default function UserDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<'search' | 'crm' | 'campaign' | 'quote' | 'tariff' | 'analytics' | 'email'>('search')

  const handleLogout = () => {
    localStorage.removeItem('user_session')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="flex items-center justify-between bg-white shadow p-6">
        <h1 className="text-2xl font-bold text-blue-800">📦 Logistic Intel</h1>
        <div className="space-x-4">
          <button 
            onClick={() => setTab('search')} 
            className={`tab-btn ${tab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            Search
          </button>
          <button 
            onClick={() => setTab('crm')} 
            className={`tab-btn ${tab === 'crm' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            CRM
          </button>
          <button 
            onClick={() => setTab('campaign')} 
            className={`tab-btn ${tab === 'campaign' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            Campaign
          </button>
          <button 
            onClick={() => setTab('quote')} 
            className={`tab-btn ${tab === 'quote' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            Quote
          </button>
          <button 
            onClick={() => setTab('tariff')} 
            className={`tab-btn ${tab === 'tariff' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            Tariffs
          </button>
          <button 
            onClick={() => setTab('analytics')} 
            className={`tab-btn ${tab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setTab('email')} 
            className={`tab-btn ${tab === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            Email
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-6 bg-white shadow rounded mt-4 mx-6">
        {tab === 'search' && <SearchPanel />}
        {tab === 'crm' && <CRMManager />}
        {tab === 'campaign' && <CampaignBuilder />}
        {tab === 'quote' && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quote Generator</h3>
            <p className="text-gray-500 mb-4">Air/Ocean/TL quote generation with PDF/HTML export</p>
            <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Form with Fields:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Origin/Destination (city, country)</li>
                <li>• Mode: Air | Ocean | TL</li>
                <li>• Weight / Volume / Incoterms</li>
                <li>• PDF/HTML export functionality</li>
              </ul>
            </div>
          </div>
        )}
        {tab === 'tariff' && (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tariff Calculator</h3>
            <p className="text-gray-500 mb-4">Flexport-style tariff calculation with real API data</p>
            <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• HS Code lookup and classification</li>
                <li>• Country-specific tariff rates</li>
                <li>• Duty and tax calculations</li>
                <li>• Trade agreement considerations</li>
              </ul>
            </div>
          </div>
        )}
        {tab === 'analytics' && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500 mb-4">Outreach stats, widget usage, and performance metrics</p>
            <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Analytics Include:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Email open rates and click tracking</li>
                <li>• Campaign performance metrics</li>
                <li>• Widget usage statistics</li>
                <li>• CRM activity insights</li>
              </ul>
            </div>
          </div>
        )}
        {tab === 'email' && (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Email Integration</h3>
            <p className="text-gray-500 mb-4">Gmail & Outlook OAuth with read tracking</p>
            <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Integration Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Gmail OAuth connection (Production-ready)</li>
                <li>• Outlook OAuth integration</li>
                <li>• Real-time read tracking via image pixels</li>
                <li>• Compose window from inside CRM</li>
                <li>• Track opens, replies, clicks, bounces</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}