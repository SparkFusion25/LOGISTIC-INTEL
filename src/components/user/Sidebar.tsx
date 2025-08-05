import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-gray-900 text-white h-full">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Logistic Intel
      </div>
      <nav className="flex flex-col gap-4 p-6">
        <Link 
          href="/dashboard" 
          className={`hover:text-blue-400 transition-colors ${isActive('/dashboard') ? 'font-bold text-blue-400' : ''}`}
        >
          Dashboard
        </Link>
        <Link 
          href="/dashboard/search" 
          className={`hover:text-blue-400 transition-colors ${isActive('/dashboard/search') ? 'font-bold text-blue-400' : ''}`}
        >
          Search
        </Link>
        <Link 
          href="/dashboard/crm" 
          className={`hover:text-blue-400 transition-colors ${isActive('/dashboard/crm') ? 'font-bold text-blue-400' : ''}`}
        >
          CRM
        </Link>
        <Link 
          href="/dashboard/email" 
          className={`hover:text-blue-400 transition-colors ${isActive('/dashboard/email') ? 'font-bold text-blue-400' : ''}`}
        >
          Email
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;