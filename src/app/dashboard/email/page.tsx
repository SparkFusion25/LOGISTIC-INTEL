// app/dashboard/email/page.tsx

'use client';

import dynamic from 'next/dynamic';

const EmailIntegration = dynamic(() => import('@/components/dashboard/EmailIntegration'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-gray-600">Loading Email Outreach Hub...</span>
    </div>
  )
});

export default function EmailPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600 text-lg">
          Launch intelligence-driven email campaigns with professional templates, CRM integration, and real-time tracking analytics.
        </p>
      </div>
      <EmailIntegration />
    </div>
  );
}