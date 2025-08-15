'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, TrendingUp, Mail, Linkedin, Zap, Eye, MessageCircle, 
  Send, Users, Clock, Download, Filter, RefreshCw, Activity,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  tradeLane: string;
  industry: string;
  status: string;
  created_at: string;
}

interface OutreachLog {
  id: string;
  campaign_id: string;
  contact_email: string;
  contact_name: string;
  channel: 'Email' | 'LinkedIn' | 'PhantomBuster';
  status: 'Sent' | 'Opened' | 'Replied' | 'Clicked' | 'Failed' | 'Bounced';
  timestamp: string;
  campaign_name: string;
  subject?: string;
  message_preview?: string;
}

interface CampaignMetrics {
  email_sent: number;
  email_opened: number;
  email_replied: number;
  email_clicked: number;
  email_bounced: number;
  linkedin_sent: number;
  linkedin_connected: number;
  phantombuster_sent: number;
  phantombuster_connected: number;
  open_rate: number;
  reply_rate: number;
  click_rate: number;
  bounce_rate: number;
  total_contacts: number;
}

export default function CampaignAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
        <p className="text-gray-600">Track and analyze your email campaign performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
              <p className="text-sm text-emerald-600 mt-1">+12% vs last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">34.2%</p>
              <p className="text-sm text-emerald-600 mt-1">+5.1% vs last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Click Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">8.7%</p>
              <p className="text-sm text-emerald-600 mt-1">+2.3% vs last month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">156</p>
              <p className="text-sm text-emerald-600 mt-1">+18% vs last month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Analytics</h3>
        <p className="text-gray-600">Detailed campaign analytics and reporting features are coming soon.</p>
      </div>
    </div>
  )
}