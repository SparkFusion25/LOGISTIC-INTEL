'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  Users, 
  Mail, 
  BarChart3, 
  Target, 
  Package, 
  Zap,
  TrendingUp,
  LogOut
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/AuthButton';

interface MobileNavigationProps {
  navItems: Array<{
    href: string;
    label: string;
    icon: any;
  }>;
  onLogout?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  navItems, 
  onLogout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Logo size="sm" variant="default" showText={true} />
        
        <div className="flex items-center gap-3">
          {/* User Profile - Mobile */}
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`
        lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-700 to-indigo-800">
          <div className="flex items-center justify-between">
            <Logo size="md" variant="white" showText={true} />
            <button
              onClick={closeMenu}
              className="p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs text-indigo-200 mt-2">Trade Intelligence Platform</div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile User Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="sm:hidden mb-4">
            <AuthButton />
          </div>
          
          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                closeMenu();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation (Alternative) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-30 sm:hidden">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors
                  ${isActive 
                    ? 'text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate max-w-[50px]">{label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;