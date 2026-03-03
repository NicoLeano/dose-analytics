import { HaloCorrelation } from '@/lib/queries'

interface CorrelationCardProps {
  data: HaloCorrelation
}

const channelConfig: Record<string, { icon: string; color: string; label: string }> = {
  meta_ads: { icon: 'f', color: 'bg-sky-100 text-sky-600', label: 'Meta Ads' },
  tiktok_samples: { icon: '♪', color: 'bg-violet-100 text-violet-600', label: 'TikTok Samples' },
  google_pmax: { icon: 'G', color: 'bg-amber-100 text-amber-600', label: 'Google PMax' },
  amazon: { icon: 'a', color: 'bg-orange-100 text-orange-600', label: 'Amazon' },
  mercadolibre: { icon: 'm', color: 'bg-yellow-100 text-yellow-600', label: 'MercadoLibre' },
}

const strengthColors = {
  strong: 'bg-emerald-100 text-emerald-700',
  moderate: 'bg-amber-100 text-amber-700',
  weak: 'bg-zinc-100 text-zinc-600',
}

export function CorrelationCard({ data }: CorrelationCardProps) {
  const source = channelConfig[data.source_channel] || { icon: '?', color: 'bg-zinc-100 text-zinc-600', label: data.source_channel }
  const target = channelConfig[data.target_channel] || { icon: '?', color: 'bg-zinc-100 text-zinc-600', label: data.target_channel }

  return (
    <div className="bg-zinc-50 rounded-xl p-5">
      {/* Source Channel */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${source.color}`}>
          {source.icon}
        </span>
        <span className="font-semibold text-sm">
          {source.label}
        </span>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3 pl-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
        <span>correlates with</span>
      </div>

      {/* Target Channel */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${target.color}`}>
          {target.icon}
        </span>
        <span className="text-zinc-600 text-sm">
          {target.label}
        </span>
      </div>

      {/* Correlation Value */}
      <div className="text-3xl font-bold mb-2">
        r = {data.correlation.toFixed(2)}
      </div>

      {/* Strength Badge */}
      <span className={`text-xs font-semibold px-2 py-1 rounded ${strengthColors[data.strength]}`}>
        {data.strength}
      </span>

      {/* Impact Info */}
      <div className="mt-4 pt-4 border-t border-zinc-200 text-sm text-zinc-600">
        <div className="font-semibold text-zinc-900 mb-1">
          $1 spend → ${data.dollar_impact.toFixed(2)} revenue
        </div>
        <div className="text-xs text-zinc-500">
          Peak impact at {data.lag_days}-day lag
        </div>
      </div>
    </div>
  )
}
