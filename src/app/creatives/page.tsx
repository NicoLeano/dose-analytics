import { getCreativePerformance, CreativePerformance } from '@/lib/queries'
import { CreativeCard } from '@/components/CreativeCard'
import { KPICard } from '@/components/KPICard'

export const dynamic = 'force-dynamic' // Don't pre-render, fetch data at runtime

export default async function CreativesPage() {
  let creatives: CreativePerformance[] = []
  let error: string | null = null

  try {
    creatives = await getCreativePerformance(24)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load creatives'
  }

  if (error || creatives.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Creative Analytics</h1>
        <p className="text-zinc-500 mb-6">Meta Ads performance by creative</p>

        <div className="bg-zinc-100 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🎨</div>
          <h2 className="text-lg font-semibold mb-2">No Creative Data</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            {error || 'Connect Airbyte to Meta Ads and run dbt to see creative performance data here.'}
          </p>
        </div>
      </div>
    )
  }

  const totals = creatives.reduce((acc, c) => ({
    spend: acc.spend + (c.spend || 0),
    conversions: acc.conversions + (c.conversions || 0),
    revenue: acc.revenue + (c.revenue || 0),
  }), { spend: 0, conversions: 0, revenue: 0 })

  const avgRoas = creatives.length > 0
    ? creatives.reduce((sum, c) => sum + (c.roas || 0), 0) / creatives.length
    : 0
  const avgCpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0
  const activeCount = creatives.filter(c => c.status === 'active').length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Creative Analytics</h1>
      <p className="text-zinc-500 mb-6">Meta Ads performance by creative</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Spend" value={formatCurrency(totals.spend)} />
        <KPICard
          label="Avg ROAS"
          value={`${avgRoas.toFixed(1)}x`}
          trendDirection={avgRoas >= 3 ? 'up' : avgRoas >= 2 ? 'neutral' : 'down'}
        />
        <KPICard label="Avg CPA" value={formatCurrency(avgCpa)} />
        <KPICard label="Active Creatives" value={activeCount} subtitle={`of ${creatives.length} total`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {creatives.map((creative) => (
          <CreativeCard key={creative.creative_id} creative={creative} />
        ))}
      </div>
    </div>
  )
}
