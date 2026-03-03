interface KPICardProps {
  label: string
  value: string | number
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export function KPICard({ label, value, trend, trendDirection = 'neutral', subtitle }: KPICardProps) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-rose-600',
    neutral: 'text-zinc-500',
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="text-sm text-zinc-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[trendDirection]}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>
      )}
    </div>
  )
}
