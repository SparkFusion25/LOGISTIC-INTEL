'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { LogOut, Search, Users, Mail, BarChart3, Target, Package, Settings, Home, Zap, TrendingUp } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import Logo from '@/components/ui/Logo';
import MobileNavigation from '@/components/ui/MobileNavigation';

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: Home },
    { href: '/dashboard/search', label: 'Search', icon: Search },
    { href: '/dashboard/crm', label: 'CRM', icon: Users },
    { href: '/dashboard/email', label: 'Email', icon: Mail },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/campaigns', label: 'Campaigns', icon: Target },
    { href: '/dashboard/campaigns/analytics', label: 'Campaign Analytics', icon: TrendingUp },
    { href: '/dashboard/campaigns/follow-ups', label: 'Follow-Up Automation', icon: Zap },
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
    <>
      {/* Mobile Navigation */}
      <MobileNavigation 
        navItems={navItems} 
        onLogout={handleLogout}
      />
      
      <div className="flex h-screen bg-[#0B1220] text-white/90">
        {/* Premium Sidebar - Hidden on Mobile */}
        <aside className="hidden lg:flex w-64 bg-[#111a2a] border-r border-white/10 flex-col">
        {/* Logo Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-600 to-indigo-700">
          <Logo 
            size="lg" 
            variant="white" 
            showText={true}
            className="text-white"
          />
          <div className="text-xs text-white/80 mt-2">Trade Intelligence Platform</div>
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
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon 
                  size={18} 
                  className={`mr-3 ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                  }`} 
                />
                <span className="font-medium">{label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <Zap className="w-4 h-4 text-white/90" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 bg-[#0B1220]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white/90">Valesco</div>
              <div className="text-xs text-white/60">Premium Account</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-sm text-white/70 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Premium Top Bar - Hidden on Mobile */}
          <header className="hidden lg:block bg-[#0B1220]/80 backdrop-blur border-b border-white/10 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white tracking-wide">
                {pathname === '/dashboard' && 'Dashboard Overview'}
                {pathname === '/dashboard/search' && 'Trade Intelligence Search'}
                {pathname === '/dashboard/crm' && 'CRM Contact Center'}
                {pathname === '/dashboard/email' && 'Email Outreach Hub'}
                {pathname === '/dashboard/analytics' && 'Analytics Dashboard'}
                {pathname === '/dashboard/campaigns' && 'Campaign Builder'}
                {pathname === '/dashboard/widgets/quote' && 'Quote Generator'}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/15 text-emerald-300 rounded-full text-xs font-medium ring-1 ring-emerald-400/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                Live Data
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Intelligence Platform</span>
              </div>
              <AuthButton />
            </div>
          </div>
        </header>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-y-auto bg-[#0B1220]">
            <div className="p-3 sm:p-6 pb-20 sm:pb-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}