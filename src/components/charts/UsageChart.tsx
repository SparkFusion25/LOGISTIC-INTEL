'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
)

interface UsageChartProps {
  type: 'line' | 'bar' | 'doughnut'
  title: string
  data: any
  options?: any
  height?: number
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9',
      },
    },
    x: {
      grid: {
        color: '#f1f5f9',
      },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
}

export default function UsageChart({ 
  type, 
  title, 
  data, 
  options, 
  height = 300 
}: UsageChartProps) {
  const chartOptions = {
    ...(type === 'doughnut' ? doughnutOptions : defaultOptions),
    ...options,
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={chartOptions} />
      case 'bar':
        return <Bar data={data} options={chartOptions} />
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />
      default:
        return null
    }
  }

  return (
    <div className="admin-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  )
}

// Utility functions for creating chart data
export const createLineChartData = (labels: string[], datasets: any[]) => ({
  labels,
  datasets: datasets.map((dataset, index) => ({
    ...dataset,
    borderColor: [
      'rgb(59, 130, 246)', // blue
      'rgb(16, 185, 129)', // green
      'rgb(139, 92, 246)', // purple
      'rgb(245, 158, 11)', // orange
      'rgb(239, 68, 68)', // red
    ][index % 5],
    backgroundColor: [
      'rgba(59, 130, 246, 0.1)',
      'rgba(16, 185, 129, 0.1)',
      'rgba(139, 92, 246, 0.1)',
      'rgba(245, 158, 11, 0.1)',
      'rgba(239, 68, 68, 0.1)',
    ][index % 5],
    borderWidth: 2,
    fill: true,
  })),
})

export const createBarChartData = (labels: string[], datasets: any[]) => ({
  labels,
  datasets: datasets.map((dataset, index) => ({
    ...dataset,
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
    ][index % 5],
    borderColor: [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(139, 92, 246)',
      'rgb(245, 158, 11)',
      'rgb(239, 68, 68)',
    ][index % 5],
    borderWidth: 1,
  })),
})

export const createDoughnutChartData = (labels: string[], data: number[]) => ({
  labels,
  datasets: [
    {
      data,
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(139, 92, 246)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 2,
    },
  ],
})