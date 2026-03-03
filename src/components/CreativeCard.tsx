import { CreativePerformance } from '@/lib/queries'

interface CreativeCardProps {
  creative: CreativePerformance
}

export function CreativeCard({ creative }: CreativeCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="aspect-square bg-zinc-100 relative">
        {creative.thumbnail_url ? (
          <img
            src={creative.thumbnail_url}
            alt={creative.creative_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {creative.creative_type || 'AD'}
        </span>
        <span className={`
          absolute top-2 right-2 w-2.5 h-2.5 rounded-full
          ${creative.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}
        `} />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm truncate mb-3" title={creative.creative_name}>
          {creative.creative_name}
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold text-zinc-900">{formatCurrency(creative.spend)}</div>
            <div className="text-xs text-zinc-500 uppercase">Spend</div>
          </div>
          <div>
            <div className={`font-bold ${creative.roas >= 3 ? 'text-emerald-600' : creative.roas >= 2 ? 'text-amber-600' : 'text-zinc-900'}`}>
              {creative.roas.toFixed(1)}x
            </div>
            <div className="text-xs text-zinc-500 uppercase">ROAS</div>
          </div>
          <div>
            <div className={`font-bold ${creative.cpa <= 150 ? 'text-emerald-600' : creative.cpa <= 250 ? 'text-amber-600' : 'text-rose-600'}`}>
              {formatCurrency(creative.cpa)}
            </div>
            <div className="text-xs text-zinc-500 uppercase">CPA</div>
          </div>
          <div>
            <div className="font-bold text-zinc-900">{creative.ctr.toFixed(2)}%</div>
            <div className="text-xs text-zinc-500 uppercase">CTR</div>
          </div>
        </div>
      </div>
    </div>
  )
}
