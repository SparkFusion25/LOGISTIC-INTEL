// Mock data for admin dashboard components

export const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@logisticsinc.com',
    company: 'Logistics Inc.',
    plan: 'Enterprise',
    status: 'active',
    created: '2024-01-15',
    lastLogin: '2024-08-15T10:30:00Z'
  },
  {
    id: '2', 
    name: 'Sarah Chen',
    email: 'sarah@globaltrade.com',
    company: 'Global Trade Solutions',
    plan: 'Professional',
    status: 'active',
    created: '2024-02-20',
    lastLogin: '2024-08-14T16:45:00Z'
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    email: 'mike@freightpro.com', 
    company: 'FreightPro',
    plan: 'Starter',
    status: 'inactive',
    created: '2024-03-10',
    lastLogin: '2024-08-10T09:15:00Z'
  }
]

export const mockApiStatus = [
  {
    service: 'Supabase Database',
    status: 'operational',
    responseTime: '45ms',
    uptime: '99.9%',
    lastChecked: '2024-08-15T12:00:00Z'
  },
  {
    service: 'Search API',
    status: 'operational', 
    responseTime: '120ms',
    uptime: '99.7%',
    lastChecked: '2024-08-15T12:00:00Z'
  },
  {
    service: 'Trade Data Feed',
    status: 'degraded',
    responseTime: '2.1s',
    uptime: '98.5%',
    lastChecked: '2024-08-15T12:00:00Z'
  },
  {
    service: 'Email Service',
    status: 'operational',
    responseTime: '89ms', 
    uptime: '99.8%',
    lastChecked: '2024-08-15T12:00:00Z'
  }
]

export const mockEmails = [
  {
    id: '1',
    subject: 'Welcome to Logistic Intel',
    template: 'welcome',
    sentCount: 1247,
    openRate: '34.2%',
    clickRate: '8.7%',
    lastSent: '2024-08-15T08:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    subject: 'Weekly Trade Intelligence Report', 
    template: 'weekly-report',
    sentCount: 892,
    openRate: '42.1%',
    clickRate: '12.3%',
    lastSent: '2024-08-14T09:00:00Z',
    status: 'active'
  },
  {
    id: '3',
    subject: 'Platform Update Notification',
    template: 'update',
    sentCount: 2156,
    openRate: '28.9%',
    clickRate: '5.4%',
    lastSent: '2024-08-13T14:00:00Z',
    status: 'paused'
  }
]

export const mockFeedback = [
  {
    id: '1',
    user: 'John Smith',
    email: 'john@logisticsinc.com',
    subject: 'Search Performance',
    message: 'The search functionality is great but could be faster for large queries.',
    type: 'feature',
    priority: 'medium',
    status: 'open',
    created: '2024-08-14T10:30:00Z'
  },
  {
    id: '2',
    user: 'Sarah Chen', 
    email: 'sarah@globaltrade.com',
    subject: 'Dashboard Layout',
    message: 'Love the new dashboard design! Much more intuitive than before.',
    type: 'compliment',
    priority: 'low',
    status: 'closed',
    created: '2024-08-13T16:45:00Z'
  },
  {
    id: '3',
    user: 'Anonymous',
    email: 'user@example.com',
    subject: 'Data Export Issue',
    message: 'Having trouble exporting large datasets. The download fails after 30 seconds.',
    type: 'bug',
    priority: 'high', 
    status: 'in-progress',
    created: '2024-08-15T09:15:00Z'
  }
]

export const mockWidgets = [
  {
    id: 'search-panel',
    name: 'Search Panel',
    type: 'search',
    usage: 15420,
    performance: '95%',
    lastUpdated: '2024-08-15T11:00:00Z',
    status: 'active'
  },
  {
    id: 'trade-news',
    name: 'Trade News Feed',
    type: 'content',
    usage: 8932,
    performance: '88%',
    lastUpdated: '2024-08-15T10:30:00Z',
    status: 'active'
  },
  {
    id: 'benchmark-widget',
    name: 'Benchmark Widget',
    type: 'analytics',
    usage: 5647,
    performance: '92%',
    lastUpdated: '2024-08-15T09:45:00Z',
    status: 'maintenance'
  },
  {
    id: 'interactive-map',
    name: 'Interactive Shipment Map',
    type: 'visualization',
    usage: 3421,
    performance: '76%',
    lastUpdated: '2024-08-14T16:20:00Z',
    status: 'issues'
  }
]