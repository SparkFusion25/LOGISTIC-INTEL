import React from 'react';
import SummaryTile from '@/components/dashboard/SummaryTile';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function DashboardHome() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Welcome to Logistic Intel</h1>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryTile title="Total Leads" value="1,247" />
        <SummaryTile title="Emails Sent" value="562" />
        <SummaryTile title="Open Rate" value="48.7%" />
        <SummaryTile title="Recent Imports" value="87" />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  );
}