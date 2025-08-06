'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calendar, Package } from 'lucide-react';

interface MonthlyTrend {
  shipment_month: string;
  shipment_count: number;
  total_value_usd: number;
  shipment_type: string;
}

interface TrendSummary {
  company_name: string;
  active_months: number;
  total_shipments_12m: number;
  avg_monthly_shipments: number;
  peak_month_shipments: number;
  latest_shipment_month: string;
  trend_indicator: number;
  activity_status: 'active' | 'recent' | 'dormant' | 'inactive';
}

interface CompanyTrendChartProps {
  companyName: string;
  className?: string;
}

const CompanyTrendChart: React.FC<CompanyTrendChartProps> = ({ companyName, className = '' }) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>([]);
  const [summary, setSummary] = useState<TrendSummary | null>(null);
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
      const [monthlyResponse, summaryResponse] = await Promise.all([
        fetch(`/api/company-trends?company=${encodeURIComponent(companyName.toLowerCase())}&months=12`),
        fetch(`/api/company-trends/summary?company=${encodeURIComponent(companyName.toLowerCase())}`)
      ]);

      const monthlyData = await monthlyResponse.json();
      const summaryData = await summaryResponse.json();

      if (monthlyData.success) {
        setMonthlyData(monthlyData.trends || []);
      }

      if (summaryData.success) {
        setSummary(summaryData.summary);
      }

      if (!monthlyData.success && !summaryData.success) {
        setError('No shipment data found for this company');
      }
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
      setError('Failed to load trend data');
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getActivityBadge = (status: string) => {
    const badges = {
      active: { text: '🔥 Active', color: 'bg-green-100 text-green-800' },
      recent: { text: '📊 Recent', color: 'bg-blue-100 text-blue-800' },
      dormant: { text: '⚠️ Dormant', color: 'bg-yellow-100 text-yellow-800' },
      inactive: { text: '⏸️ Inactive', color: 'bg-gray-100 text-gray-800' }
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };

  const getTrendIcon = (indicator: number) => {
    if (indicator > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (indicator < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart3 className="w-4 h-4 text-gray-600" />;
  };

  const maxShipments = Math.max(...monthlyData.map(d => d.shipment_count), 1);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || (!monthlyData.length && !summary)) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">No shipment data available</p>
          <p className="text-xs text-gray-400">
            {companyName} hasn't appeared in trade data yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            📈 Shipment Activity Trend
          </h3>
          <p className="text-sm text-gray-600">
            12-month shipment history for {companyName}
          </p>
        </div>
        {summary && (
          <div className="text-right">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityBadge(summary.activity_status).color}`}>
              {getActivityBadge(summary.activity_status).text}
            </span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.total_shipments_12m}</p>
            <p className="text-xs text-gray-600">Total Shipments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.peak_month_shipments}</p>
            <p className="text-xs text-gray-600">Peak Month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.active_months}</p>
            <p className="text-xs text-gray-600">Active Months</p>
          </div>
          <div className="text-center flex items-center justify-center">
            {getTrendIcon(summary.trend_indicator)}
            <span className="ml-1 text-sm font-medium">
              {summary.trend_indicator > 0 ? '+' : ''}{summary.trend_indicator.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      {monthlyData.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Calendar className="w-3 h-3 mr-1" />
            Last 12 months
          </div>
          
          {monthlyData.slice(-12).map((month, index) => (
            <div key={month.shipment_month} className="flex items-center space-x-3">
              <div className="w-16 text-xs text-gray-600 font-mono">
                {formatMonth(month.shipment_month)}
              </div>
              <div className="flex-1 relative">
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(month.shipment_count / maxShipments) * 100}%`,
                      minWidth: month.shipment_count > 0 ? '8px' : '0px'
                    }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs font-medium text-gray-700">
                    {month.shipment_count} shipments
                  </span>
                </div>
              </div>
              <div className="w-20 text-xs text-gray-500 text-right">
                ${(month.total_value_usd / 1000).toFixed(0)}K
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No monthly trend data available</p>
        </div>
      )}

      {/* Footer */}
      {summary && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Latest activity: {formatMonth(summary.latest_shipment_month)}
            </span>
            <span>
              Avg: {summary.avg_monthly_shipments.toFixed(1)} shipments/month
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyTrendChart;