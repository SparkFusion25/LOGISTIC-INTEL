// app/dashboard/email/page.tsx

'use client';
import EmailIntegration from '@/components/widgets/EmailIntegration';

export default function EmailPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Outreach & Campaign Tools</h1>
      <EmailIntegration />
    </div>
  );
}