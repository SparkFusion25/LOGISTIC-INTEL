// src/components/DashboardHome.tsx

'use client';

import React, { useState, useEffect } from 'react';
import SummaryTile from './SummaryTile';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import UsageStats from './UsageStats';

const DashboardHome: React.FC = () => {
  const [userName, setUserName] = useState('Valesco');
  const [dashboardStats, setDashboardStats] = useState({
    totalShipments: 0,
    totalValue: 0,
    recentLeads: 0,
    oceanShipments: 0,
    airShipments: 0,
    distinctShippers: 0,
    distinctConsignees: 0,
    latestUpload: '',
    recentShipments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.name) {
          setUserName(userData.name.split(' ')[0]); // First name only
        }
      } catch (error) {
        console.log('Using default username');
      }
    }
    
    // Fetch real dashboard statistics
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setDashboardStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
          icon="🌊"
          title="Ocean Shipments"
          value={loading ? '...' : dashboardStats.oceanShipments}
          subtitle={loading ? 'Loading...' : `${dashboardStats.distinctShippers} unique shippers`}
          color="blue"
        />
        <SummaryTile
          icon="✈️"
          title="Air Shipments"
          value={loading ? '...' : dashboardStats.airShipments}
          subtitle={loading ? 'Loading...' : `${dashboardStats.distinctConsignees} unique consignees`}
          color="green"
        />
        <SummaryTile
          icon="📦"
          title="Total Shipments"
          value={loading ? '...' : dashboardStats.totalShipments}
          subtitle={loading ? 'Loading...' : `$${(dashboardStats.totalValue / 1000000).toFixed(1)}M total value`}
          color="purple"
        />
      </div>

      {/* Quick Actions Section */}
      <QuickActions />

      {/* Latest Upload Info */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Latest Data Upload</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Latest file: <span className="font-medium">{loading ? 'Loading...' : dashboardStats.latestUpload}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardStats.totalShipments > 0 
                ? `${dashboardStats.totalShipments} total shipment records processed`
                : 'No shipment data yet - upload XML files to get started'
              }
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/upload'}
            className="btn-primary text-sm"
          >
            Upload XML Data
          </button>
        </div>
        {dashboardStats.recentShipments && dashboardStats.recentShipments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Shipments:</h4>
            <div className="space-y-1">
              {dashboardStats.recentShipments.slice(0, 3).map((shipment: any, index: number) => (
                <div key={index} className="text-xs text-gray-600 flex justify-between">
                  <span>{shipment.company_name}</span>
                  <span>{shipment.shipment_type} • {shipment.shipment_date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Recent Activity + Usage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <UsageStats />
      </div>
    </div>
  );
};

export default DashboardHome;