'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { LogOut, Search, Users, Mail, BarChart3, Target, Package, Settings, Home, Zap, TrendingUp, Globe } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/search', label: 'Search', icon: Search },
  { href: '/dashboard/crm', label: 'CRM', icon: Users },
  { href: '/dashboard/email', label: 'Email', icon: Mail },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Target },
  { href: '/dashboard/widgets/quote', label: 'Quote Generator', icon: Package },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const handleLogout = () => {
    // In production, this would clear session and redirect
    localStorage.removeItem('user_session');
    window.location.href = '/landing';
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Premium Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-700 to-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <div className="text-xl font-bold text-white tracking-wide">LOGISTIC INTEL</div>
              <div className="text-xs text-indigo-200">Trade Intelligence Platform</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <Icon 
                  size={18} 
                  className={`mr-3 ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'
                  }`} 
                />
                <span className="font-medium">{label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <Zap className="w-4 h-4 text-indigo-200" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Valesco</div>
              <div className="text-xs text-gray-600">Premium Account</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
                {pathname === '/dashboard' && 'Dashboard Overview'}
                {pathname === '/dashboard/search' && 'Trade Intelligence Search'}
                {pathname === '/dashboard/crm' && 'CRM Contact Center'}
                {pathname === '/dashboard/email' && 'Email Outreach Hub'}
                {pathname === '/dashboard/analytics' && 'Analytics Dashboard'}
                {pathname === '/dashboard/campaigns' && 'Campaign Builder'}
                {pathname === '/dashboard/widgets/quote' && 'Quote Generator'}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Data
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Intelligence Platform</span>
              </div>
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold text-indigo-700">Valesco</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}