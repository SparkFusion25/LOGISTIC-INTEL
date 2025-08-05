export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  last_login: string;
}

export interface User {
  id: string;
  email: string;
  company: string;
  role: 'trial' | 'pro' | 'enterprise';
  signup_date: string;
  last_login: string;
  active_widgets: string[];
  plan_status: 'active' | 'cancelled' | 'expired';
  usage_count: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  user_id: string;
  user_email: string;
  company: string;
  type: 'linkedin' | 'email' | 'mixed';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  total_steps: number;
  created_at: string;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
  };
}

export interface Widget {
  id: string;
  name: 'tariff_calculator' | 'quote_generator' | 'campaign_builder' | 'crm_lookup';
  display_name: string;
  usage_count: number;
  active_users: number;
  last_used: string;
  status: 'active' | 'maintenance' | 'deprecated';
}

export interface EmailActivity {
  id: string;
  user_id: string;
  user_email: string;
  campaign_id: string;
  campaign_name: string;
  subject: string;
  recipient: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  timestamp: string;
  domain: string;
}

export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded';
  uptime_percentage: number;
  avg_response_time: number;
  last_error: string | null;
  last_checked: string;
}

export interface FeedbackItem {
  id: string;
  user_id: string;
  user_email: string;
  type: 'bug' | 'feature_request' | 'support' | 'feedback';
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: {
    count: number;
    breakdown: {
      trial: number;
      pro: number;
      enterprise: number;
    };
  };
  active_campaigns: number;
  widgets_in_use: number;
  top_users: Array<{
    id: string;
    email: string;
    company: string;
    usage_count: number;
  }>;
  api_status: {
    healthy: number;
    total: number;
  };
  campaign_metrics: {
    avg_open_rate: number;
    avg_reply_rate: number;
    total_emails_sent: number;
  };
}

export interface AdminAction {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: 'user' | 'campaign' | 'widget' | 'system';
  target_id: string;
  details: Record<string, any>;
  timestamp: string;
}