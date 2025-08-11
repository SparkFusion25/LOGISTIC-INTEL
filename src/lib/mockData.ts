export const mockData = {
  getDashboardStats: () => ({
    total_users: {
      count: 1002,
      breakdown: { trial: 450, pro: 412, enterprise: 140 }
    },
    active_campaigns: 127,
    widgets_in_use: 390,
    top_users: [
      { id: '1', email: 'john@acme.com', company: 'ACME Corp', usage_count: 245 },
      { id: '2', email: 'sarah@globaltrade.com', company: 'Global Trade Inc', usage_count: 198 },
      { id: '3', email: 'mike@logistics.com', company: 'Logistics Pro', usage_count: 176 },
      { id: '4', email: 'emma@shipping.com', company: 'Shipping Solutions', usage_count: 165 },
      { id: '5', email: 'alex@freight.com', company: 'Freight Masters', usage_count: 142 }
    ],
    api_status: { healthy: 8, total: 10 },
    campaign_metrics: { avg_open_rate: 24.5, avg_reply_rate: 3.2, total_emails_sent: 15420 }
  }),

  getUsers: () => [
    { id: '1', email: 'john@acme.com', company: 'ACME Corp', role: 'enterprise' as const, signup_date: '2024-01-15', last_login: '2024-01-20', active_widgets: ['tariff_calculator', 'quote_generator', 'campaign_builder'], plan_status: 'active' as const, usage_count: 245 },
    { id: '2', email: 'sarah@globaltrade.com', company: 'Global Trade Inc', role: 'pro' as const, signup_date: '2024-01-10', last_login: '2024-01-19', active_widgets: ['tariff_calculator', 'crm_lookup'], plan_status: 'active' as const, usage_count: 198 },
    { id: '3', email: 'mike@logistics.com', company: 'Logistics Pro', role: 'trial' as const, signup_date: '2024-01-18', last_login: '2024-01-20', active_widgets: ['quote_generator'], plan_status: 'active' as const, usage_count: 176 }
  ],

  getCampaigns: () => [
    { id: '1', name: 'Q1 Outreach Campaign', description: 'Targeting logistics companies in North America', user_id: '1', user_email: 'john@acme.com', company: 'ACME Corp', type: 'email' as const, status: 'active' as const, total_steps: 5, created_at: '2024-01-15', metrics: { sent: 150, opened: 45, clicked: 12, replied: 3, bounced: 2 } },
    { id: '2', name: 'LinkedIn Outreach', description: 'Connecting with freight forwarders', user_id: '2', user_email: 'sarah@globaltrade.com', company: 'Global Trade Inc', type: 'linkedin' as const, status: 'active' as const, total_steps: 3, created_at: '2024-01-12', metrics: { sent: 75, opened: 25, clicked: 8, replied: 2, bounced: 0 } }
  ],

  getWidgets: () => [
    { id: '1', name: 'tariff_calculator' as const, display_name: 'Tariff Calculator', usage_count: 1250, active_users: 340, last_used: '2024-01-20', status: 'active' as const },
    { id: '2', name: 'quote_generator' as const, display_name: 'Quote Generator', usage_count: 890, active_users: 245, last_used: '2024-01-20', status: 'active' as const },
    { id: '3', name: 'campaign_builder' as const, display_name: 'Campaign Builder', usage_count: 567, active_users: 127, last_used: '2024-01-19', status: 'active' as const },
    { id: '4', name: 'crm_lookup' as const, display_name: 'CRM Lookup', usage_count: 423, active_users: 98, last_used: '2024-01-18', status: 'active' as const }
  ],

  getEmailActivity: () => [
    { id: '1', user_id: '1', user_email: 'john@acme.com', campaign_id: '1', campaign_name: 'Q1 Outreach Campaign', subject: 'Partnership Opportunity in Logistics', recipient: 'contact@targetcompany.com', status: 'opened' as const, timestamp: '2024-01-20T10:30:00Z', domain: 'targetcompany.com' },
    { id: '2', user_id: '2', user_email: 'sarah@globaltrade.com', campaign_id: '2', campaign_name: 'LinkedIn Outreach', subject: 'Connect for Trade Opportunities', recipient: 'manager@freight.com', status: 'clicked' as const, timestamp: '2024-01-19T15:45:00Z', domain: 'freight.com' }
  ],

  getAPIEndpoints: () => [
    { id: '1', name: 'Comtrade API', url: 'https://comtradeapi.un.org', status: 'up' as const, uptime_percentage: 99.2, avg_response_time: 450, last_error: null, last_checked: '2024-01-20T12:00:00Z' },
    { id: '2', name: 'US Census API', url: 'https://api.census.gov', status: 'up' as const, uptime_percentage: 98.7, avg_response_time: 320, last_error: null, last_checked: '2024-01-20T12:00:00Z' },
    { id: '3', name: 'DataForSEO API', url: 'https://api.dataforseo.com', status: 'degraded' as const, uptime_percentage: 95.1, avg_response_time: 1200, last_error: 'Rate limit exceeded', last_checked: '2024-01-20T12:00:00Z' }
  ],

  getFeedback: () => [
    { id: '1', user_id: '1', user_email: 'john@acme.com', type: 'bug' as const, title: 'Tariff calculator not loading', description: 'The tariff calculator widget shows a loading spinner indefinitely', status: 'in_progress' as const, priority: 'high' as const, assigned_to: 'dev-team', created_at: '2024-01-19T09:30:00Z', updated_at: '2024-01-19T14:20:00Z' },
    { id: '2', user_id: '2', user_email: 'sarah@globaltrade.com', type: 'feature_request' as const, title: 'Export campaign results to Excel', description: 'Would like to export campaign analytics to Excel format', status: 'new' as const, priority: 'medium' as const, assigned_to: null, created_at: '2024-01-18T16:15:00Z', updated_at: '2024-01-18T16:15:00Z' }
  ]
}