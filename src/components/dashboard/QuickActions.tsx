'use client';

import { useRouter } from 'next/navigation';
import { Mail, Search, Users } from 'lucide-react';

const actions = [
  {
    label: 'New Search',
    icon: <Search className="w-5 h-5 mr-2" />,
    href: '/dashboard/search',
  },
  {
    label: 'CRM Contacts',
    icon: <Users className="w-5 h-5 mr-2" />,
    href: '/dashboard/crm',
  },
  {
    label: 'Send Email',
    icon: <Mail className="w-5 h-5 mr-2" />,
    href: '/dashboard/email',
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}