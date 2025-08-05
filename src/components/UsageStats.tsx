// src/components/UsageStats.tsx

'use client';

import React from 'react';
import { BarChart3, Users, Zap, Mail } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ElementType;
}

const UsageStats: React.FC = () => {
  // Placeholder data - replace with real usage stats
  const stats: StatItem[] = [
    {
      id: 'crm',
      label: 'CRM Contacts Added',
      value: 23,
      max: 50,
      color: 'bg-blue-500',
      icon: Users
    },
    {
      id: 'phantom',
      label: 'PhantomBuster Campaigns',
      value: 7,
      max: 15,
      color: 'bg-purple-500',
      icon: Zap
    },
    {
      id: 'emails',
      label: 'Gmail/Outlook Emails Sent',
      value: 42,
      max: 100,
      color: 'bg-green-500',
      icon: Mail
    }
  ];

  const getPercentage = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-5 h-5 text-gray-700 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">📈 Usage Stats</h3>
      </div>
      
      <div className="space-y-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          const percentage = getPercentage(stat.value, stat.max);
          
          return (
            <div key={stat.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <IconComponent className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{stat.label}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {stat.value} / {stat.max}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${stat.color} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>This month</span>
                <span>{percentage.toFixed(0)}% of target</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {Math.round(stats.reduce((acc, stat) => acc + getPercentage(stat.value, stat.max), 0) / stats.length)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.round(stats.reduce((acc, stat) => acc + getPercentage(stat.value, stat.max), 0) / stats.length)}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default UsageStats;