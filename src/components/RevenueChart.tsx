'use client'

import { MonthlyPnl } from '@/lib/queries'
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
  Filler,
  TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface RevenueChartProps {
  data: MonthlyPnl[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Filter to totals only and reverse for chronological order
  const totals = data
    .filter(row => row.platform === 'all_platforms')
    .reverse()

  const labels = totals.map(row => {
    const dateStr = row.month
    // Handle quarterly format (2024-Q1)
    if (dateStr.includes('-Q')) {
      return dateStr
    }
    // Handle yearly format (2024)
    if (/^\d{4}$/.test(dateStr)) {
      return dateStr
    }
    // Handle daily/weekly format (2024-01-15)
    if (dateStr.length === 10) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    // Handle monthly format (2024-01)
    if (dateStr.length === 7) {
      const date = new Date(dateStr + '-01')
      return date.toLocaleDateString('en-US', { month: 'short' })
    }
    // Fallback
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short' })
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Net Revenue',
        data: totals.map(row => row.net_revenue),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Ad Spend',
        data: totals.map(row => row.meta_ad_spend),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(context.raw as number)
            return `${context.dataset.label}: ${value}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  }

  return (
    <div className="h-72">
      <Line data={chartData} options={options} />
    </div>
  )
}
