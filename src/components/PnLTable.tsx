import { MonthlyPnl } from '@/lib/queries'

interface PnLTableProps {
  data: MonthlyPnl[]
}

export function PnLTable({ data }: PnLTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Group by month, showing totals
  const totalsOnly = data.filter(row => row.platform === 'all_platforms')

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left py-3 px-4 font-semibold text-zinc-600">Month</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Gross Revenue</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Discounts</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Net Revenue</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">IVA</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Revenue ex-IVA</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Ad Spend</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">Orders</th>
            <th className="text-right py-3 px-4 font-semibold text-zinc-600">AOV</th>
          </tr>
        </thead>
        <tbody>
          {totalsOnly.map((row, i) => (
            <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
              <td className="py-3 px-4 font-medium">{formatMonth(row.month)}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(row.gross_revenue)}</td>
              <td className="py-3 px-4 text-right text-rose-600">
                {row.discounts > 0 ? `-${formatCurrency(row.discounts)}` : '-'}
              </td>
              <td className="py-3 px-4 text-right font-medium">{formatCurrency(row.net_revenue)}</td>
              <td className="py-3 px-4 text-right text-zinc-500">{formatCurrency(row.iva_collected)}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(row.revenue_ex_iva)}</td>
              <td className="py-3 px-4 text-right text-rose-600">
                {row.meta_ad_spend > 0 ? formatCurrency(row.meta_ad_spend) : '-'}
              </td>
              <td className="py-3 px-4 text-right">{row.orders.toLocaleString()}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(row.aov)}</td>
            </tr>
          ))}
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
