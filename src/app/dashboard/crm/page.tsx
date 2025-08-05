// app/dashboard/crm/page.tsx

'use client';
import CRMPanel from '@/components/widgets/CRMPanel';

export default function CRMPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">CRM Contact Center</h1>
      <CRMPanel />
    </div>
  );
}