'use client';

import React from 'react';

interface CompanyDrawerProps {
  companyId: string;
  plan: string;
}

export default function CompanyDrawer({ companyId, plan }: CompanyDrawerProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6">
        <h1>Company Drawer: {companyId}</h1>
        <p>Plan: {plan}</p>
      </div>
    </div>
  );
}
