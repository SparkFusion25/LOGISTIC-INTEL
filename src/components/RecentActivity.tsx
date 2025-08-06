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
  // Real data from API
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    setLoading(true);
    try {
      // Fetch recent shipments and CRM activities
      const [shipmentsResponse, crmResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/crm/contacts?limit=3')
      ]);

      const shipmentsData = await shipmentsResponse.json();
      const crmData = await crmResponse.json();

      const recentActivities: ActivityItem[] = [];

      // Add recent shipments as activities
      if (shipmentsData.success && shipmentsData.stats.recentShipments) {
        shipmentsData.stats.recentShipments.slice(0, 3).forEach((shipment: any, index: number) => {
          recentActivities.push({
            id: `shipment-${shipment.unified_id}`,
            type: 'lead',
            title: `${shipment.company_name}`,
            subtitle: `${shipment.shipment_type} shipment recorded`,
            timestamp: formatTimestamp(shipment.shipment_date)
          });
        });
      }

      // Add recent CRM contacts as activities
      if (crmData.success && crmData.contacts) {
        crmData.contacts.slice(0, 2).forEach((contact: any) => {
          recentActivities.push({
            id: `crm-${contact.id}`,
            type: 'email',
            title: `${contact.contact_name || 'Contact'}, ${contact.company_name}`,
            subtitle: `Added to CRM from ${contact.source || 'manual entry'}`,
            timestamp: formatTimestamp(contact.created_at)
          });
        });
      }

      setActivities(recentActivities.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      // Fallback to sample data
      setActivities([
        {
          id: 'fallback-1',
          type: 'lead',
          title: 'No recent activity',
          subtitle: 'Start by uploading XML data or adding contacts',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

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
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity found</p>
        ) : (
          activities.slice(0, 8).map((activity) => {
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
        })
        )}
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