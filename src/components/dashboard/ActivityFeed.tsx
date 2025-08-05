'use client';

import { Clock, Mail, Search, User } from 'lucide-react';

const activityData = [
  {
    type: 'email',
    title: 'Email opened by Andrea from TechAxis',
    time: '2 minutes ago',
    icon: <Mail className="text-blue-500 w-4 h-4" />,
  },
  {
    type: 'crm',
    title: 'New lead added: Logistics Inc.',
    time: '10 minutes ago',
    icon: <User className="text-green-500 w-4 h-4" />,
  },
  {
    type: 'search',
    title: 'Searched trade lane: US → Vietnam',
    time: '30 minutes ago',
    icon: <Search className="text-yellow-500 w-4 h-4" />,
  },
  {
    type: 'email',
    title: 'Campaign sent: Q3 Freight Trends',
    time: '1 hour ago',
    icon: <Mail className="text-blue-500 w-4 h-4" />,
  },
];

export default function ActivityFeed() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent Activity</h2>
      <ul className="divide-y divide-gray-200">
        {activityData.map((activity, idx) => (
          <li key={idx} className="py-2 flex items-start gap-3">
            <div className="flex-shrink-0">{activity.icon}</div>
            <div>
              <p className="text-sm text-gray-800">{activity.title}</p>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.time}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}