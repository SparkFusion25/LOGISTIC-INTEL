// src/components/SummaryTile.tsx

import React from 'react';

interface SummaryTileProps {
  icon: string;
  title: string;
  value: number | string;
  subtitle?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

const SummaryTile: React.FC<SummaryTileProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryTile;