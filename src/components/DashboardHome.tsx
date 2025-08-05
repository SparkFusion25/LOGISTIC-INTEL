// src/components/DashboardHome.tsx

'use client';

import React, { useState, useEffect } from 'react';
import SummaryTile from './SummaryTile';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import UsageStats from './UsageStats';

const DashboardHome: React.FC = () => {
  const [userName, setUserName] = useState('Valesco');

  // In a real app, fetch user data from Supabase here
  useEffect(() => {
    // Mock user data - replace with actual Supabase user fetch
    const mockUser = localStorage.getItem('user');
    if (mockUser) {
      try {
        const userData = JSON.parse(mockUser);
        if (userData.name) {
          setUserName(userData.name.split(' ')[0]); // First name only
        }
      } catch (error) {
        console.log('Using default username');
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👋 Welcome back, {userName}
        </h1>
        <p className="text-gray-600">Here's a quick snapshot of your activity</p>
      </div>

      {/* Summary Tiles - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryTile
          icon="📦"
          title="Leads Added This Week"
          value={23}
          subtitle="8 new this week"
          color="blue"
        />
        <SummaryTile
          icon="📈"
          title="Searches Performed"
          value={47}
          subtitle="15 new opportunities"
          color="green"
        />
        <SummaryTile
          icon="📬"
          title="Emails Sent"
          value={156}
          subtitle="92% delivery rate"
          color="orange"
        />
      </div>

      {/* Quick Actions Section */}
      <QuickActions />

      {/* Two Column Layout: Recent Activity + Usage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <UsageStats />
      </div>
    </div>
  );
};

export default DashboardHome;