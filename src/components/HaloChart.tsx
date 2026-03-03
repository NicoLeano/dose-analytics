'use client'

import { HaloCorrelation } from '@/lib/queries'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface HaloChartProps {
  correlations: HaloCorrelation[]
}

export function HaloChart({ correlations }: HaloChartProps) {
  const labels = correlations.map(c =>
    `${c.source_channel.replace('_', ' ')} → ${c.target_channel} (${c.lag_days}d)`
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Correlation (r)',
        data: correlations.map(c => c.correlation),
        backgroundColor: correlations.map(c => {
          if (c.correlation >= 0.7) return 'rgba(16, 185, 129, 0.8)' // emerald
          if (c.correlation >= 0.4) return 'rgba(245, 158, 11, 0.8)' // amber
          return 'rgba(161, 161, 170, 0.8)' // zinc
        }),
        borderRadius: 6,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const corr = correlations[context.dataIndex]
            const value = context.raw as number
            return [
              `Correlation: ${value.toFixed(2)}`,
              `$1 spend → $${corr.dollar_impact.toFixed(2)} revenue`,
              `Strength: ${corr.strength}`,
            ]
          },
        },
      },
    },
    scales: {
      x: {
        min: -1,
        max: 1,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  )
}
