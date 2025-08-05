// src/components/QuickActions.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { Search, UserPlus, Mail } from 'lucide-react';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Run Market Search',
      description: 'Find new trade opportunities',
      href: '/dashboard/search',
      icon: Search,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Add New Contact',
      description: 'Expand your CRM database',
      href: '/dashboard/crm',
      icon: UserPlus,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Launch Campaign',
      description: 'Start email outreach',
      href: '/dashboard/email',
      icon: Mail,
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Link
              key={index}
              href={action.href}
              className={`${action.color} text-white p-4 rounded-lg transition-colors group`}
            >
              <div className="flex flex-col items-center text-center">
                <IconComponent className="w-6 h-6 mb-2" />
                <span className="font-medium text-sm">{action.title}</span>
                <span className="text-xs opacity-90 mt-1">{action.description}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;