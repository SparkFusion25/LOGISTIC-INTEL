// src/app/dashboard/layout.tsx
import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-5">
        <h2 className="text-xl font-bold mb-6">Logistic Intel</h2>
        <nav className="space-y-4">
          <Link href="/dashboard/search" className="block hover:underline">Search</Link>
          <Link href="/dashboard/crm" className="block hover:underline">CRM</Link>
          <Link href="/dashboard/email" className="block hover:underline">Email</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
}