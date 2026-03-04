import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getPlatformPnl, getPlatformDailyPnl, MonthlyPnl, Period, DateRange, getDateRangeForPeriod } from '@/lib/queries'
import { PnLTable } from '@/components/PnLTable'
import { RevenueChart } from '@/components/RevenueChart'
import { KPICard } from '@/components/KPICard'
import { DateFilter } from '@/components/DateFilter'

export const dynamic = 'force-dynamic'

const platformConfig: Record<string, { name: string; color: string; dbName: string }> = {
  shopify: { name: 'Shopify', color: 'bg-green-500', dbName: 'shopify' },
  amazon: { name: 'Amazon', color: 'bg-orange-500', dbName: 'amazon' },
  mercadolibre: { name: 'MercadoLibre', color: 'bg-yellow-500', dbName: 'mercadolibre' },
  tiktok: { name: 'TikTok Shop', color: 'bg-pink-500', dbName: 'tiktok' },
}

interface PageProps {
  params: Promise<{ platform: string }>
  searchParams: Promise<{ period?: string; start?: string; end?: string }>
}

export default async function PlatformPnLPage({ params, searchParams }: PageProps) {
  const { platform } = await params
  const config = platformConfig[platform]

  if (!config) {
    notFound()
  }

  const queryParams = await searchParams
  const period = (queryParams.period as Period) || 'monthly'
  const customRange: DateRange | undefined =
    period === 'custom' && queryParams.start && queryParams.end
      ? { start: queryParams.start, end: queryParams.end }
      : undefined

  let pnlData: MonthlyPnl[] = []
  let error: string | null = null

  try {
    if (period === 'monthly') {
      pnlData = await getPlatformPnl(config.dbName, 12)
    } else {
      const range = customRange || getDateRangeForPeriod(period)
      const dailyData = await getPlatformDailyPnl(config.dbName, range)
      // Convert to MonthlyPnl format
      pnlData = dailyData.map(d => ({
        month: d.date,
        platform: d.platform,
        gross_revenue: d.gross_revenue,
        discounts: d.discounts,
        returns: d.returns,
        net_revenue: d.net_revenue,
        revenue_ex_iva: d.revenue_ex_iva,
        iva_collected: d.iva_collected,
        orders: d.orders,
        cogs: d.cogs,
        meta_ad_spend: d.meta_ad_spend,
        aov: d.orders > 0 ? d.net_revenue / d.orders : 0,
      }))
    }
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

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'quarterly': return 'Quarterly'
      case 'yearly': return 'Yearly'
      case 'custom': return customRange ? `${customRange.start} to ${customRange.end}` : 'Custom'
      default: return 'Monthly'
    }
  }

  const getDateColumnLabel = () => {
    switch (period) {
      case 'daily': return 'Date'
      case 'weekly': return 'Week Starting'
      case 'monthly': return 'Month'
      case 'quarterly': return 'Quarter'
      case 'yearly': return 'Year'
      default: return 'Period'
    }
  }

  if (error || pnlData.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${config.color}`} />
            <div>
              <h1 className="text-2xl font-bold mb-1">{config.name} P&L</h1>
              <p className="text-zinc-500">{getPeriodLabel()} profit & loss</p>
            </div>
          </div>
          <Suspense fallback={<div className="h-10 w-96 bg-zinc-100 rounded-lg animate-pulse" />}>
            <DateFilter />
          </Suspense>
        </div>

        <div className="bg-zinc-100 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-lg font-semibold mb-2">No {config.name} Data</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            {error || `No sales data available for ${config.name}. Connect this platform in Airbyte to see data here.`}
          </p>
        </div>
      </div>
    )
  }

  // For platform-specific view, treat each row as its own total
  const dataWithTotals = pnlData.map(row => ({
    ...row,
    platform: 'all_platforms' // Trick PnLTable into showing all rows
  }))

  const currentPeriod = pnlData[0]
  const previousPeriod = pnlData[1]

  const revenueDelta = currentPeriod && previousPeriod && previousPeriod.net_revenue > 0
    ? (((currentPeriod.net_revenue - previousPeriod.net_revenue) / previousPeriod.net_revenue) * 100).toFixed(1)
    : null

  const ordersDelta = currentPeriod && previousPeriod && previousPeriod.orders > 0
    ? (((currentPeriod.orders - previousPeriod.orders) / previousPeriod.orders) * 100).toFixed(1)
    : null

  // Calculate totals
  const totalRevenue = pnlData.reduce((sum, r) => sum + r.net_revenue, 0)
  const totalOrders = pnlData.reduce((sum, r) => sum + r.orders, 0)
  const totalAdSpend = pnlData.reduce((sum, r) => sum + r.meta_ad_spend, 0)
  const avgAov = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${config.color}`} />
          <div>
            <h1 className="text-2xl font-bold mb-1">{config.name} P&L</h1>
            <p className="text-zinc-500">{getPeriodLabel()} profit & loss</p>
          </div>
        </div>
        <Suspense fallback={<div className="h-10 w-96 bg-zinc-100 rounded-lg animate-pulse" />}>
          <DateFilter />
        </Suspense>
      </div>

      {/* KPI Cards */}
      {currentPeriod && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <KPICard
            label="Net Revenue (Current)"
            value={formatCurrency(currentPeriod.net_revenue)}
            trend={revenueDelta ? `${parseFloat(revenueDelta) >= 0 ? '+' : ''}${revenueDelta}%` : undefined}
            trendDirection={revenueDelta && parseFloat(revenueDelta) >= 0 ? 'up' : 'down'}
          />
          <KPICard label="Revenue ex-IVA" value={formatCurrency(currentPeriod.revenue_ex_iva)} />
          <KPICard label="COGS" value={formatCurrency(currentPeriod.cogs || 0)} />
          <KPICard
            label="Orders"
            value={currentPeriod.orders.toLocaleString()}
            trend={ordersDelta ? `${parseFloat(ordersDelta) >= 0 ? '+' : ''}${ordersDelta}%` : undefined}
            trendDirection={ordersDelta && parseFloat(ordersDelta) >= 0 ? 'up' : 'down'}
          />
          <KPICard label="AOV" value={formatCurrency(currentPeriod.aov)} />
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
        <h2 className="font-semibold mb-4">Period Summary</h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-zinc-500">Total Revenue</div>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">Total Orders</div>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">Avg AOV</div>
            <div className="text-2xl font-bold">{formatCurrency(avgAov)}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">Ad Spend</div>
            <div className="text-2xl font-bold">{formatCurrency(totalAdSpend)}</div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
        <h2 className="font-semibold mb-4">Revenue Trend</h2>
        <RevenueChart data={dataWithTotals} />
      </div>

      {/* P&L Table */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h2 className="font-semibold mb-4">{getPeriodLabel()} Details</h2>
        <PnLTable data={dataWithTotals} dateLabel={getDateColumnLabel()} />
      </div>
    </div>
  )
}
