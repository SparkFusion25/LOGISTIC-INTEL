'use client';

import { BarChart3, DollarSign, Users, TrendingUp, Mail, Search, Target, Package, Globe, Zap, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { 
    title: 'Companies Tracked', 
    value: '1,840', 
    icon: Users, 
    change: '+12%',
    changeType: 'positive' as const,
    description: 'Active trade partners'
  },
  { 
    title: 'Recent Quotes Sent', 
    value: '92', 
    icon: DollarSign, 
    change: '+8%',
    changeType: 'positive' as const,
    description: 'This week'
  },
  { 
    title: 'Avg Benchmark Cost', 
    value: '$1,200', 
    icon: BarChart3, 
    change: '-3%',
    changeType: 'positive' as const,
    description: 'Per TEU'
  },
  { 
    title: 'Email Open Rate', 
    value: '48.7%', 
    icon: Mail, 
    change: '+15%',
    changeType: 'positive' as const,
    description: 'Campaign performance'
  },
];

const quickActions = [
  {
    title: 'Trade Intelligence Search',
    description: 'Search global trade data and shipment records',
    icon: Search,
    href: '/dashboard/search',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    title: 'CRM Contact Center',
    description: 'Manage leads and track outreach progress',
    icon: Users,
    href: '/dashboard/crm',
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600'
  },
  {
    title: 'Email Outreach Hub',
    description: 'Launch intelligence-driven email campaigns',
    icon: Mail,
    href: '/dashboard/email',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600'
  },
  {
    title: 'Quote Generator',
    description: 'Create professional shipping quotes',
    icon: Package,
    href: '/dashboard/widgets/quote',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600'
  },
  {
    title: 'Tariff Calculator',
    description: 'Calculate duties, taxes, and landed costs',
    icon: Target,
    href: '/dashboard/widgets/tariff',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  },
];

const recentActivity = [
  { 
    action: 'Email opened by Sarah Chen (Apple Inc.)', 
    time: '2 minutes ago', 
    type: 'email',
    icon: Mail,
    color: 'text-green-600'
  },
  { 
    action: 'New lead added: Tesla Motors - Michael Zhang', 
    time: '15 minutes ago', 
    type: 'crm',
    icon: Users,
    color: 'text-blue-600'
  },
  { 
    action: 'Quote generated for Amazon logistics', 
    time: '1 hour ago', 
    type: 'quote',
    icon: Package,
    color: 'text-orange-600'
  },
  { 
    action: 'Trade search: Electronics from Vietnam', 
    time: '2 hours ago', 
    type: 'search',
    icon: Search,
    color: 'text-indigo-600'
  },
];

// Simple responsive card component (inline to avoid import issues)
function ResponsiveCard({ title, value, description, icon: Icon, iconColor, trend, size }: {
  title: string;
  value: string;
  description: string;
  icon: any;
  iconColor: string;
  trend: { value: string; isPositive: boolean };
  size: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gray-50 ${iconColor}`}>
          <Icon size={24} />
        </div>
        <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

// Simple benchmark widget (inline to avoid import issues)
function BenchmarkWidget() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        Market Benchmark
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>China</option>
              <option>United States</option>
              <option>Germany</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>United States</option>
              <option>Germany</option>
              <option>United Kingdom</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HS Code (optional)</label>
          <input 
            type="text" 
            placeholder="e.g., 8517.12"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 hover:bg-indigo-700 transition-colors">
          Analyze
        </button>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Estimates based on recent shipments matching the lane and filters.</p>
        </div>
      </div>
    </div>
  );
}

// Simple trade news feed (inline to avoid import issues)
function TradeNewsFeed() {
  const newsItems = [
    {
      title: "Global shipping rates stabilize amid reduced demand",
      summary: "Ocean freight rates show signs of stability after months of volatility...",
      source: "Maritime Executive",
      time: "2 hours ago",
      category: "Ocean Freight"
    },
    {
      title: "New trade agreement between US and Vietnam takes effect",
      summary: "The bilateral trade agreement is expected to boost electronics exports...",
      source: "Trade Finance Global",
      time: "4 hours ago",
      category: "Trade Policy"
    },
    {
      title: "Port congestion eases at major European terminals",
      summary: "Hamburg and Rotterdam report improved processing times...",
      source: "Port Technology",
      time: "6 hours ago",
      category: "Ports"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-indigo-600" />
        Global Trade News
      </h3>
      <div className="space-y-4">
        {newsItems.map((item, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.summary}</p>
                <p className="text-xs text-gray-500">Source: {item.source}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome back, Valesco! 👋</h2>
            <p className="text-indigo-200 text-sm sm:text-base">
              Your trade intelligence platform is ready. Here's what's happening with your logistics operations.
            </p>
          </div>
          <div className="hidden md:block">
            <Globe className="w-16 h-16 text-indigo-300" />
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map(({ title, value, icon: Icon, change, changeType, description }) => (
            <ResponsiveCard
              key={title}
              title={title}
              value={value}
              description={description}
              icon={Icon}
              iconColor="text-indigo-600"
              trend={{
                value: change,
                isPositive: changeType === 'positive'
              }}
              size="md"
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map(({ title, description, icon: Icon, href, color, hoverColor }) => (
            <Link
              key={title}
              href={href}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-indigo-300"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`${color} ${hoverColor} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                {title}
              </h4>
              <p className="text-sm text-gray-600">{description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BenchmarkWidget />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ocean Freight Volume</span>
              <span className="text-sm font-medium text-gray-900">1.2M TEU</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Air Cargo Volume</span>
              <span className="text-sm font-medium text-gray-900">230.4K MT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Routes</span>
              <span className="text-sm font-medium text-gray-900">47</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & At a Glance */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                  <activity.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
            Platform Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Trade Data APIs</span>
              </div>
              <span className="text-xs text-green-700 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Email Services</span>
              </div>
              <span className="text-xs text-green-700 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">CRM Sync</span>
              </div>
              <span className="text-xs text-green-700 font-medium">Live</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Market Data</span>
              </div>
              <span className="text-xs text-yellow-700 font-medium">Updating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Trade News Feed */}
      <TradeNewsFeed />
    </div>
  );
}
