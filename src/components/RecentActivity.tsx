// src/components/RecentActivity.tsx

'use client';

import React from 'react';
import { User, Mail, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'lead' | 'email';
  title: string;
  subtitle: string;
  timestamp: string;
}

const RecentActivity: React.FC = () => {
  // Placeholder data - replace with real data from Supabase/CRM
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'lead',
      title: 'John Doe, Tesla',
      subtitle: 'Electric Vehicle Components',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'lead',
      title: 'Ana L., GE Appliances',
      subtitle: 'Home Appliance Parts',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'email',
      title: 'DSV Quote Follow-up',
      subtitle: 'Sent to maria.garcia@dsv.com',
      timestamp: '6 hours ago'
    },
    {
      id: '4',
      type: 'lead',
      title: 'Michael Chen, Foxconn',
      subtitle: 'Electronics Manufacturing',
      timestamp: '1 day ago'
    },
    {
      id: '5',
      type: 'email',
      title: 'Ocean Freight Inquiry',
      subtitle: 'Sent to operations@maersk.com',
      timestamp: '1 day ago'
    },
    {
      id: '6',
      type: 'lead',
      title: 'Sarah Williams, Amazon',
      subtitle: 'E-commerce Logistics',
      timestamp: '2 days ago'
    },
    {
      id: '7',
      type: 'email',
      title: 'Air Freight Proposal',
      subtitle: 'Sent to logistics@fedex.com',
      timestamp: '2 days ago'
    },
    {
      id: '8',
      type: 'lead',
      title: 'Roberto Silva, Walmart',
      subtitle: 'Retail Supply Chain',
      timestamp: '3 days ago'
    }
  ];

  const getIcon = (type: string) => {
    return type === 'lead' ? User : Mail;
  };

  const getIconColor = (type: string) => {
    return type === 'lead' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🕓 Recent Activity</h3>
      <div className="space-y-3">
        {activities.slice(0, 8).map((activity) => {
          const IconComponent = getIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(activity.type)}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.type === 'lead' ? 'Lead: ' : 'Email: '}{activity.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {activity.timestamp}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all activity →
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;