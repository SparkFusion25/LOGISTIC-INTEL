'use client';

import React from 'react';
import { Search, TrendingUp, Mail, Users, BarChart3, Globe, Zap, Brain } from 'lucide-react';

export default function DemoLanding() {
  // Mock data for perfect screenshot
  const mockSearchResults = [
    {
      id: '1',
      company: 'Samsung Electronics',
      mode: 'ocean',
      origin: 'Busan, South Korea',
      destination: 'Long Beach, USA',
      commodity: 'Electronics Components',
      hsCode: '8471.30.01',
      value: '$2.4M',
      date: '2025-01-15',
      trend: '+23%',
      shipments: 126,
      direction: 'up'
    },
    {
      id: '2',
      company: 'Tesla Inc',
      mode: 'air',
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
      commodity: 'Electric Vehicle Parts',
      hsCode: '8703.80.00',
      value: '$1.8M',
      date: '2025-01-12',
      trend: '+15%',
      shipments: 89,
      direction: 'up'
    },
    {
      id: '3',
      company: 'Apple Inc',
      mode: 'ocean',
      origin: 'Shenzhen, China',
      destination: 'Oakland, USA',
      commodity: 'Consumer Electronics',
      hsCode: '8517.12.00',
      value: '$3.1M',
      date: '2025-01-10',
      trend: '+31%',
      shipments: 203,
      direction: 'up'
    }
  ];

  const dashboardStats = {
    totalShipments: 1247,
    oceanShipments: 892,
    airShipments: 355,
    totalValue: 12400000,
    crmContacts: 89,
    activeCampaigns: 5
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Logistic Intel</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Live Demo</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Turn shipment data into sales leads — instantly.
          </h1>
          <p className="text-xl text-gray-600">
            See your supply chain like never before with AI-powered trade intelligence
          </p>
        </div>

        {/* Main Demo Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left: Search Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              {/* Search Header */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value="Samsung"
                    readOnly
                    className="flex-1 border-0 bg-transparent text-lg font-medium text-gray-900 focus:outline-none"
                  />
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                    1,247 results
                  </span>
                </div>
              </div>

              {/* Search Results */}
              <div className="divide-y divide-gray-100">
                {mockSearchResults.map((result, index) => (
                  <div key={result.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.mode === 'air' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                          }`}>
                            {result.mode.toUpperCase()}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">{result.company}</h3>
                          
                          {/* Trend Badge */}
                          <div className="inline-flex items-center px-2 py-1 rounded-full border bg-green-50 text-green-700 border-green-200 text-xs font-medium">
                            <span className="mr-1">📈</span>
                            <span>{result.shipments}</span>
                            <span className="ml-1 text-xs">({result.trend})</span>
                          </div>
                          
                          {/* Mini Sparkline */}
                          <div className="flex items-end space-x-0.5 h-4">
                            {[8, 12, 15, 18].map((height, i) => (
                              <div
                                key={i}
                                className="w-1 bg-blue-400 rounded-sm"
                                style={{ height: `${height}px` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div><span className="font-medium">Origin:</span> {result.origin}</div>
                          <div><span className="font-medium">Value:</span> {result.value}</div>
                          <div><span className="font-medium">Destination:</span> {result.destination}</div>
                          <div><span className="font-medium">Date:</span> {result.date}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                          <Users className="w-4 h-4" />
                          Add to CRM
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                          <Mail className="w-4 h-4" />
                          Send Campaign
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Dashboard Stats */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalShipments.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">CRM Contacts</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardStats.crmContacts}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardStats.activeCampaigns}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Trend Analysis</p>
                    <p className="text-sm text-gray-600">Live shipment patterns over 12 months</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Smart CRM</p>
                    <p className="text-sm text-gray-600">Auto-generated leads from shippers</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email Campaigns</p>
                    <p className="text-sm text-gray-600">Gmail + Outlook outreach built-in</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instant Search</p>
                    <p className="text-sm text-gray-600">Filter by company, HS Code, region</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg shadow-lg hover:bg-blue-700 transition-colors">
            <span>Start Free Trial</span>
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Turn supply chain data into revenue • No credit card required</p>
        </div>
      </div>
    </div>
  );
}