import { Suspense } from 'react'
import { getPnlByPeriod, MonthlyPnl, Period, DateRange } from '@/lib/queries'
import { PnLTable, PlatformBreakdown } from '@/components/PnLTable'
import { RevenueChart } from '@/components/RevenueChart'
import { KPICard } from '@/components/KPICard'
import { DateFilter } from '@/components/DateFilter'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ period?: string; start?: string; end?: string }>
}

export default async function PnLPage({ searchParams }: PageProps) {
  const params = await searchParams
  const period = (params.period as Period) || 'monthly'
  const customRange: DateRange | undefined =
    period === 'custom' && params.start && params.end
      ? { start: params.start, end: params.end }
      : undefined

  let pnlData: MonthlyPnl[] = []
  let error: string | null = null

  try {
    pnlData = await getPnlByPeriod(period, customRange)
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load P&L data'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get period label for display
  const getPeriodLabel = () => {
    switch (period) {
      case 'daily':
        return 'Daily'
      case 'weekly':
        return 'Weekly'
      case 'monthly':
        return 'Monthly'
      case 'quarterly':
        return 'Quarterly'
      case 'yearly':
        return 'Yearly'
      case 'custom':
        return customRange ? `${customRange.start} to ${customRange.end}` : 'Custom'
      default:
        return 'Monthly'
    }
  }

  // Format the date/period column header
  const getDateColumnLabel = () => {
    switch (period) {
      case 'daily':
        return 'Date'
      case 'weekly':
        return 'Week Starting'
      case 'monthly':
        return 'Month'
      case 'quarterly':
        return 'Quarter'
      case 'yearly':
        return 'Year'
      case 'custom':
        return 'Date'
      default:
        return 'Period'
    }
  }

  if (error || pnlData.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">P&L Dashboard</h1>
            <p className="text-zinc-500">{getPeriodLabel()} profit & loss by platform</p>
          </div>
          <Suspense fallback={<div className="h-10 w-96 bg-zinc-100 rounded-lg animate-pulse" />}>
            <DateFilter />
          </Suspense>
        </div>

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

  // Get current period totals
  const totals = pnlData.filter((row) => row.platform === 'all_platforms')
  const currentPeriod = totals[0]
  const previousPeriod = totals[1]

  // Calculate period-over-period changes
  const revenueDelta =
    currentPeriod && previousPeriod
      ? (
          ((currentPeriod.net_revenue - previousPeriod.net_revenue) /
            previousPeriod.net_revenue) *
          100
        ).toFixed(1)
      : null
  const ordersDelta =
    currentPeriod && previousPeriod
      ? (
          ((currentPeriod.orders - previousPeriod.orders) / previousPeriod.orders) *
          100
        ).toFixed(1)
      : null

  // Format period for display
  const formatPeriodDate = (dateStr: string) => {
    if (period === 'yearly') {
      return dateStr
    }
    if (period === 'quarterly') {
      return dateStr // Already formatted as "2024-Q1"
    }
    if (period === 'daily' || period === 'custom') {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    if (period === 'weekly') {
      return `Week of ${new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`
    }
    // monthly
    return new Date(dateStr + '-01').toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">P&L Dashboard</h1>
          <p className="text-zinc-500">{getPeriodLabel()} profit & loss by platform</p>
        </div>
        <Suspense fallback={<div className="h-10 w-96 bg-zinc-100 rounded-lg animate-pulse" />}>
          <DateFilter />
        </Suspense>
      </div>

      {/* KPI Cards */}
      {currentPeriod && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <KPICard
            label={`Net Revenue (${period === 'daily' || period === 'custom' ? 'Today' : 'Current'})`}
            value={formatCurrency(currentPeriod.net_revenue)}
            trend={
              revenueDelta
                ? `${parseFloat(revenueDelta) >= 0 ? '+' : ''}${revenueDelta}%`
                : undefined
            }
            trendDirection={revenueDelta && parseFloat(revenueDelta) >= 0 ? 'up' : 'down'}
          />
          <KPICard label="Revenue ex-IVA" value={formatCurrency(currentPeriod.revenue_ex_iva)} />
          <KPICard label="Meta Ad Spend" value={formatCurrency(currentPeriod.meta_ad_spend)} />
          <KPICard
            label="Orders"
            value={currentPeriod.orders.toLocaleString()}
            trend={
              ordersDelta
                ? `${parseFloat(ordersDelta) >= 0 ? '+' : ''}${ordersDelta}%`
                : undefined
            }
            trendDirection={ordersDelta && parseFloat(ordersDelta) >= 0 ? 'up' : 'down'}
          />
          <KPICard label="AOV" value={formatCurrency(currentPeriod.aov)} />
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
        <h2 className="font-semibold mb-4">Revenue Trend</h2>
        <RevenueChart data={pnlData} />
      </div>

      {/* Platform Breakdown for Current Period */}
      {currentPeriod && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
          <h2 className="font-semibold mb-4">
            Platform Breakdown — {formatPeriodDate(currentPeriod.month)}
          </h2>
          <PlatformBreakdown data={pnlData} month={currentPeriod.month} />
        </div>
      )}

      {/* P&L Table */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">{getPeriodLabel()} Summary</h2>
        <PnLTable data={pnlData} dateLabel={getDateColumnLabel()} />
      </div>
    </div>
  )
}
