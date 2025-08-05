'use client';

import { useEffect, useState } from 'react';
import { fetchBenchmarkData } from '@/lib/api/benchmark';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BenchmarkData {
  volume: Array<{
    month: string;
    tons: number;
    value_usd: number;
  }>;
  rates: {
    low: number;
    avg: number;
    high: number;
    carriers: string[];
    frequency: string;
    valid_until: string;
  };
  metadata: {
    origin: string;
    destination: string;
    hsCode: string;
    mode: string;
    timeRange: string;
    lastUpdated: string;
  };
}

export default function MarketBenchmarkEstimator() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState('Ocean');
  const [hsCode, setHsCode] = useState('');
  const [timeRange, setTimeRange] = useState('90d');
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (origin && destination) {
      setLoading(true);
      fetchBenchmarkData({ origin, destination, hsCode, mode, timeRange })
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [origin, destination, hsCode, mode, timeRange]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📈 Market Benchmark Estimator
        </h3>
        <p className="text-gray-600 text-sm">
          Compare lane-level trade volumes and benchmark freight rates.
        </p>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Origin Country
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. China"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Country
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. United States"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mode
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="Ocean">Ocean</option>
            <option value="Air">Air</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HS Code (optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
            placeholder="e.g. 8517"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Range
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last 1 year</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading benchmark data...</span>
        </div>
      )}

      {/* Charts */}
      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trade Volume Chart */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gray-800">
              Trade Volume & Value Over Time
            </h4>
            <div className="h-64">
              <Line
                data={{
                  labels: data.volume.map((v) => v.month),
                  datasets: [
                    {
                      label: 'Volume (tons)',
                      data: data.volume.map((v) => v.tons),
                      borderColor: '#2563eb',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      fill: false,
                      tension: 0.4,
                    },
                    {
                      label: 'Value (USD)',
                      data: data.volume.map((v) => v.value_usd),
                      borderColor: '#16a34a',
                      backgroundColor: 'rgba(22, 163, 74, 0.1)',
                      fill: false,
                      tension: 0.4,
                      yAxisID: 'y1',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      type: 'linear' as const,
                      display: true,
                      position: 'left' as const,
                    },
                    y1: {
                      type: 'linear' as const,
                      display: true,
                      position: 'right' as const,
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Freight Rate Chart */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gray-800">
              Freight Rate Benchmark
            </h4>
            <div className="h-64">
              <Bar
                data={{
                  labels: ['Low', 'Average', 'High'],
                  datasets: [
                    {
                      label: `USD per ${mode === 'Air' ? 'kg' : 'container'}`,
                      data: [
                        data.rates.low,
                        data.rates.avg,
                        data.rates.high,
                      ],
                      backgroundColor: ['#fbbf24', '#3b82f6', '#ef4444'],
                      borderColor: ['#f59e0b', '#2563eb', '#dc2626'],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
            
            {/* Rate Details */}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div><strong>Carriers:</strong> {data.rates.carriers.join(', ')}</div>
              <div><strong>Frequency:</strong> {data.rates.frequency}</div>
              <div><strong>Valid Until:</strong> {data.rates.valid_until}</div>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!data && !loading && origin && destination && (
        <div className="text-center py-12 text-gray-500">
          <p>No benchmark data available for this trade lane.</p>
          <p className="text-sm mt-2">Try adjusting your search parameters.</p>
        </div>
      )}

      {/* Instructions */}
      {!origin || !destination ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">🌍 Enter origin and destination countries to get started</p>
          <p className="text-sm">Get real-time trade volume and freight rate insights for any trade lane</p>
        </div>
      ) : null}
    </div>
  );
}