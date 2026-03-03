import { getMonthlyPnl, MonthlyPnl } from '@/lib/queries'
import { PnLTable, PlatformBreakdown } from '@/components/PnLTable'
import { RevenueChart } from '@/components/RevenueChart'
import { KPICard } from '@/components/KPICard'

export const dynamic = 'force-dynamic' // Don't pre-render, fetch data at runtime

export default async function PnLPage() {
  let pnlData: MonthlyPnl[] = []
  let error: string | null = null

  try {
    pnlData = await getMonthlyPnl(12)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load P&L data'
  }

  if (error || pnlData.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">P&L Dashboard</h1>
        <p className="text-zinc-500 mb-6">Monthly profit & loss by platform</p>

        <div className="bg-zinc-100 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">💰</div>
          <h2 className="text-lg font-semibold mb-2">No P&L Data</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            {error || 'Connect Airbyte to your sales platforms and run dbt to see P&L data here.'}
          </p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get current month totals
  const totals = pnlData.filter(row => row.platform === 'all_platforms')
  const currentMonth = totals[0]
  const previousMonth = totals[1]

  // Calculate MoM changes
  const revenueDelta = currentMonth && previousMonth
    ? ((currentMonth.net_revenue - previousMonth.net_revenue) / previousMonth.net_revenue * 100).toFixed(1)
    : null
  const ordersDelta = currentMonth && previousMonth
    ? ((currentMonth.orders - previousMonth.orders) / previousMonth.orders * 100).toFixed(1)
    : null

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">P&L Dashboard</h1>
      <p className="text-zinc-500 mb-6">Monthly profit & loss by platform</p>

      {/* KPI Cards */}
      {currentMonth && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <KPICard
            label="Net Revenue (MTD)"
            value={formatCurrency(currentMonth.net_revenue)}
            trend={revenueDelta ? `${parseFloat(revenueDelta) >= 0 ? '+' : ''}${revenueDelta}%` : undefined}
            trendDirection={revenueDelta && parseFloat(revenueDelta) >= 0 ? 'up' : 'down'}
          />
          <KPICard
            label="Revenue ex-IVA"
            value={formatCurrency(currentMonth.revenue_ex_iva)}
          />
          <KPICard
            label="Meta Ad Spend"
            value={formatCurrency(currentMonth.meta_ad_spend)}
          />
          <KPICard
            label="Orders"
            value={currentMonth.orders.toLocaleString()}
            trend={ordersDelta ? `${parseFloat(ordersDelta) >= 0 ? '+' : ''}${ordersDelta}%` : undefined}
            trendDirection={ordersDelta && parseFloat(ordersDelta) >= 0 ? 'up' : 'down'}
          />
          <KPICard
            label="AOV"
            value={formatCurrency(currentMonth.aov)}
          />
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
        <h2 className="font-semibold mb-4">Revenue Trend</h2>
        <RevenueChart data={pnlData} />
      </div>

      {/* Platform Breakdown for Current Month */}
      {currentMonth && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <h2 className="font-semibold mb-4">
            Platform Breakdown — {new Date(currentMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <PlatformBreakdown data={pnlData} month={currentMonth.month} />
        </div>
      )}

      {/* P&L Table */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">Monthly Summary</h2>
        <PnLTable data={pnlData} />
      </div>
    </div>
  )
}
