// app/dashboard/layout.tsx

import Sidebar from '@/components/dashboard/Sidebar';
import '@/app/globals.css'; // Or wherever your global styles live

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}