import { getHaloCorrelations, HaloCorrelation } from '@/lib/queries'
import { CorrelationCard } from '@/components/CorrelationCard'
import { HaloChart } from '@/components/HaloChart'

export const dynamic = 'force-dynamic' // Don't pre-render, fetch data at runtime

export default async function HaloPage() {
  let correlations: HaloCorrelation[] = []
  let error: string | null = null

  try {
    correlations = await getHaloCorrelations()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load correlations'
  }

  if (error || correlations.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Halo Effect Analysis</h1>
        <p className="text-zinc-500 mb-6">
          Cross-channel correlation — how paid media impacts marketplace sales
        </p>

        <div className="bg-zinc-100 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-lg font-semibold mb-2">No Correlation Data</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            {error || 'Connect your data sources and run dbt to calculate cross-channel correlations.'}
          </p>
        </div>

        {/* Explanation Card */}
        <div className="mt-8 bg-white rounded-xl border border-zinc-200 p-6">
          <h3 className="font-semibold mb-3">What is the Halo Effect?</h3>
          <p className="text-sm text-zinc-600 mb-4">
            The halo effect measures how advertising on one channel (like Meta Ads) influences
            sales on other channels (like Amazon or MercadoLibre). Customers may see your ad
            on Instagram, then search for your product on Amazon days later.
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-zinc-50 rounded-lg p-4">
              <div className="font-semibold text-emerald-600 mb-1">Strong (r ≥ 0.7)</div>
              <div className="text-zinc-500">High confidence the channels are connected</div>
            </div>
            <div className="bg-zinc-50 rounded-lg p-4">
              <div className="font-semibold text-amber-600 mb-1">Moderate (r 0.4-0.7)</div>
              <div className="text-zinc-500">Likely connection worth monitoring</div>
            </div>
            <div className="bg-zinc-50 rounded-lg p-4">
              <div className="font-semibold text-zinc-600 mb-1">Weak (r &lt; 0.4)</div>
              <div className="text-zinc-500">Little to no measurable connection</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Find the strongest correlation
  const strongest = correlations.reduce((max, c) =>
    Math.abs(c.correlation) > Math.abs(max.correlation) ? c : max
  , correlations[0])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Halo Effect Analysis</h1>
      <p className="text-zinc-500 mb-6">
        Cross-channel correlation — how paid media impacts marketplace sales
      </p>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-8">
        {/* Correlation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {correlations.map((corr, i) => (
            <CorrelationCard key={i} data={corr} />
          ))}
        </div>

        {/* Chart */}
        <div className="border-t border-zinc-100 pt-6">
          <h3 className="font-semibold mb-4">Correlation Comparison</h3>
          <HaloChart correlations={correlations} />
        </div>
      </div>

      {/* Insight Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <h3 className="font-semibold text-emerald-800 mb-2">Key Insight</h3>
        <p className="text-sm text-emerald-700">
          Strongest correlation: <strong>{strongest.source_channel.replace('_', ' ')}</strong> to{' '}
          <strong>{strongest.target_channel}</strong> with r = {strongest.correlation.toFixed(2)} at {strongest.lag_days}-day lag.
          {strongest.dollar_impact > 0 && (
            <> Every $1 spent yields an estimated ${strongest.dollar_impact.toFixed(2)} in {strongest.target_channel} revenue.</>
          )}
        </p>
      </div>
    </div>
  )
}
