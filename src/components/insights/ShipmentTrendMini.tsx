'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface RecentTrend {
  success: boolean;
  company: string;
  total_shipments: number;
  current_month: number;
  peak_month: string;
  peak_count: number;
  trend: string;
  trend_direction: 'up' | 'down' | 'stable';
  months_data: Array<{
    shipment_month: string;
    shipment_count: number;
  }>;
}

interface ShipmentTrendMiniProps {
  companyName: string;
  className?: string;
}

const ShipmentTrendMini: React.FC<ShipmentTrendMiniProps> = ({ companyName, className = '' }) => {
  const [trend, setTrend] = useState<RecentTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyName) {
      fetchTrendData();
    }
  }, [companyName]);

  const fetchTrendData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/company-trends/recent?company=${encodeURIComponent(companyName.toLowerCase())}`);
      const data = await response.json();
      
      if (data.success) {
        setTrend(data);
      } else {
        setError('No data');
      }
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
      setError('Error');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return <Minus className="w-3 h-3 text-gray-600" />;
    }
  };

  const getTrendEmoji = (direction: string) => {
    switch (direction) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '📊';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'bg-green-50 text-green-700 border-green-200';
      case 'down': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        <div className="animate-pulse flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <div className="w-8 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !trend) {
    return (
      <div className={`inline-flex items-center text-xs text-gray-400 ${className}`}>
        <BarChart3 className="w-3 h-3 mr-1" />
        No data
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {/* Emoji Badge Version */}
      <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getTrendColor(trend.trend_direction)}`}>
        <span className="mr-1">{getTrendEmoji(trend.trend_direction)}</span>
        <span>{trend.total_shipments}</span>
        <span className="ml-1 text-xs">({trend.trend})</span>
      </div>

      {/* Mini Sparkline */}
      <div className="flex items-end space-x-0.5 h-4">
        {trend.months_data.slice(-4).map((month, index) => {
          const maxCount = Math.max(...trend.months_data.map(m => m.shipment_count));
          const height = maxCount > 0 ? (month.shipment_count / maxCount * 12) + 2 : 2;
          
          return (
            <div
              key={index}
              className="w-1 bg-blue-400 rounded-sm"
              style={{ height: `${height}px` }}
              title={`${month.shipment_count} shipments`}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipmentTrendMini;