import { MonthlyPnl } from '@/lib/queries'

interface PnLTableProps {
  data: MonthlyPnl[]
  dateLabel?: string
}

export function PnLTable({ data, dateLabel = 'Month' }: PnLTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPeriod = (dateStr: string) => {
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    // Handle monthly format (2024-01)
    if (dateStr.length === 7) {
      const date = new Date(dateStr + '-01')
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    // Fallback
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Group by period, showing totals
  const totalsOnly = data.filter(row => row.platform === 'all_platforms')

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left py-3 px-4 font-semibold text-zinc-600">{dateLabel}</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Gross Revenue</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Discounts</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Returns</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Net Revenue</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">IVA</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Revenue ex-IVA</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">COGS</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Gross Profit</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Ad Spend</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Orders</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">AOV</th>
          </tr>
        </thead>
        <tbody>
          {totalsOnly.map((row, i) => {
            const grossProfit = row.revenue_ex_iva - (row.cogs || 0)
            return (
              <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
                <td className="py-3 px-4 font-medium">{formatPeriod(row.month)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(row.gross_revenue)}</td>
                <td className="py-3 px-4 text-right text-rose-600">
                  {row.discounts > 0 ? `-${formatCurrency(row.discounts)}` : '-'}
                </td>
                <td className="py-3 px-4 text-right text-rose-600">
                  {(row.returns || 0) > 0 ? `-${formatCurrency(row.returns)}` : '-'}
                </td>
                <td className="py-3 px-4 text-right font-medium">{formatCurrency(row.net_revenue)}</td>
                <td className="py-3 px-4 text-right text-zinc-500">{formatCurrency(row.iva_collected)}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(row.revenue_ex_iva)}</td>
                <td className="py-3 px-4 text-right text-rose-600">
                  {(row.cogs || 0) > 0 ? formatCurrency(row.cogs) : '-'}
                </td>
                <td className="py-3 px-4 text-right font-medium text-emerald-600">
                  {formatCurrency(grossProfit)}
                </td>
                <td className="py-3 px-4 text-right text-rose-600">
                  {row.meta_ad_spend > 0 ? formatCurrency(row.meta_ad_spend) : '-'}
                </td>
                <td className="py-3 px-4 text-right">{row.orders.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">{formatCurrency(row.aov)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface PlatformBreakdownProps {
  data: MonthlyPnl[]
  month: string
}

export function PlatformBreakdown({ data, month }: PlatformBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const monthData = data.filter(row =>
    row.month === month && row.platform !== 'all_platforms'
  )

  const platformColors: Record<string, string> = {
    shopify: 'bg-green-100 text-green-700',
    amazon: 'bg-orange-100 text-orange-700',
    mercadolibre: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {monthData.map((row) => (
        <div key={row.platform} className="bg-zinc-50 rounded-lg p-4">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${platformColors[row.platform] || 'bg-zinc-100'}`}>
            {row.platform}
          </span>
          <div className="mt-3">
            <div className="text-2xl font-bold">{formatCurrency(row.net_revenue)}</div>
            <div className="text-xs text-zinc-500">{row.orders} orders</div>
          </div>
        </div>
      ))}
    </div>
  )
}
