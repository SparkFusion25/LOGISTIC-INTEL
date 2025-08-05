// components/dashboard/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const linkStyle = (path: string) =>
    pathname === path
      ? 'font-semibold text-blue-400'
      : 'text-white hover:text-blue-200';

  return (
    <aside className="w-64 bg-gray-900 h-full text-white">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Logistic Intel
      </div>
      <nav className="flex flex-col gap-4 p-6">
        <Link href="/dashboard" className={linkStyle('/dashboard')}>Dashboard</Link>
        <Link href="/dashboard/search" className={linkStyle('/dashboard/search')}>Search</Link>
        <Link href="/dashboard/crm" className={linkStyle('/dashboard/crm')}>CRM</Link>
        <Link href="/dashboard/email" className={linkStyle('/dashboard/email')}>Email</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;