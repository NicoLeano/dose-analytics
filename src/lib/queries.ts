import { supabase } from './supabase'

// Types
export interface MonthlyPnl {
  month: string
  platform: string
  gross_revenue: number
  discounts: number
  returns: number
  net_revenue: number
  revenue_ex_iva: number
  iva_collected: number
  orders: number
  cogs: number
  meta_ad_spend: number
  aov: number
}

export interface DailyPnl {
  date: string
  platform: string
  gross_revenue: number
  discounts: number
  returns: number
  net_revenue: number
  revenue_ex_iva: number
  iva_collected: number
  orders: number
  cogs: number
  meta_ad_spend: number
}

export interface CreativePerformance {
  creative_id: string
  creative_name: string
  thumbnail_url: string | null
  creative_type: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  roas: number
  cpa: number
  ctr: number
  first_active: string
  last_active: string
  status: 'active' | 'inactive'
}

export interface HaloCorrelation {
  source_channel: string
  target_channel: string
  lag_days: number
  correlation: number
  dollar_impact: number
  strength: 'strong' | 'moderate' | 'weak'
  calculated_at: string
}

export type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

export interface DateRange {
  start: string
  end: string
}

// Helper: get date range for period presets
export function getDateRangeForPeriod(period: Period): DateRange {
  const now = new Date()
  const end = now.toISOString().split('T')[0]
  let start: string

  switch (period) {
    case 'daily':
      // Last 30 days
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      start = thirtyDaysAgo.toISOString().split('T')[0]
      break
    case 'weekly':
      // Last 12 weeks
      const twelveWeeksAgo = new Date(now)
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)
      start = twelveWeeksAgo.toISOString().split('T')[0]
      break
    case 'monthly':
      // Last 12 months
      const twelveMonthsAgo = new Date(now)
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
      start = twelveMonthsAgo.toISOString().split('T')[0]
      break
    case 'quarterly':
      // Last 8 quarters (2 years)
      const twoYearsAgo = new Date(now)
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      start = twoYearsAgo.toISOString().split('T')[0]
      break
    case 'yearly':
      // Last 5 years
      const fiveYearsAgo = new Date(now)
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
      start = fiveYearsAgo.toISOString().split('T')[0]
      break
    default:
      // Default to last 12 months
      const defaultAgo = new Date(now)
      defaultAgo.setFullYear(defaultAgo.getFullYear() - 1)
      start = defaultAgo.toISOString().split('T')[0]
  }

  return { start, end }
}

// Query functions
export async function getMonthlyPnl(months: number = 6): Promise<MonthlyPnl[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('fct_monthly_pnl')
    .select('*')
    .order('month', { ascending: false })
    .limit(months * 4) // 4 rows per month (3 platforms + total)

  if (error) throw error
  return data || []
}

// Get monthly P&L with date range filter
export async function getMonthlyPnlByRange(range: DateRange): Promise<MonthlyPnl[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  // Convert to first-of-month dates for proper comparison with the month column (stored as date)
  const startMonth = range.start.slice(0, 7) + '-01'
  const endMonth = range.end.slice(0, 7) + '-01'

  const { data, error } = await supabase
    .from('fct_monthly_pnl')
    .select('*')
    .gte('month', startMonth)
    .lte('month', endMonth)
    .order('month', { ascending: false })

  if (error) throw error
  return data || []
}

// Get daily P&L with date range filter
export async function getDailyPnlByRange(range: DateRange): Promise<DailyPnl[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('fct_daily_pnl')
    .select('*')
    .gte('date', range.start)
    .lte('date', range.end)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

// Aggregate daily data to weekly
export function aggregateToWeekly(dailyData: DailyPnl[]): MonthlyPnl[] {
  const weekMap = new Map<string, Map<string, DailyPnl[]>>()

  dailyData.forEach((row) => {
    const date = new Date(row.date)
    // Get week start (Monday)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(date.setDate(diff))
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, new Map())
    }
    const platformMap = weekMap.get(weekKey)!
    if (!platformMap.has(row.platform)) {
      platformMap.set(row.platform, [])
    }
    platformMap.get(row.platform)!.push(row)
  })

  const result: MonthlyPnl[] = []
  weekMap.forEach((platformMap, weekKey) => {
    let totalGross = 0, totalDiscounts = 0, totalReturns = 0, totalNet = 0, totalExIva = 0
    let totalIva = 0, totalOrders = 0, totalCogs = 0, totalAdSpend = 0

    platformMap.forEach((rows, platform) => {
      const gross = rows.reduce((sum, r) => sum + r.gross_revenue, 0)
      const discounts = rows.reduce((sum, r) => sum + r.discounts, 0)
      const returns = rows.reduce((sum, r) => sum + r.returns, 0)
      const net = rows.reduce((sum, r) => sum + r.net_revenue, 0)
      const exIva = rows.reduce((sum, r) => sum + r.revenue_ex_iva, 0)
      const iva = rows.reduce((sum, r) => sum + r.iva_collected, 0)
      const orders = rows.reduce((sum, r) => sum + r.orders, 0)
      const cogs = rows.reduce((sum, r) => sum + r.cogs, 0)
      const adSpend = rows.reduce((sum, r) => sum + r.meta_ad_spend, 0)

      result.push({
        month: weekKey,
        platform,
        gross_revenue: gross,
        discounts,
        returns,
        net_revenue: net,
        revenue_ex_iva: exIva,
        iva_collected: iva,
        orders,
        cogs,
        meta_ad_spend: adSpend,
        aov: orders > 0 ? net / orders : 0,
      })

      totalGross += gross
      totalDiscounts += discounts
      totalReturns += returns
      totalNet += net
      totalExIva += exIva
      totalIva += iva
      totalOrders += orders
      totalCogs += cogs
      totalAdSpend += adSpend
    })

    result.push({
      month: weekKey,
      platform: 'all_platforms',
      gross_revenue: totalGross,
      discounts: totalDiscounts,
      returns: totalReturns,
      net_revenue: totalNet,
      revenue_ex_iva: totalExIva,
      iva_collected: totalIva,
      orders: totalOrders,
      cogs: totalCogs,
      meta_ad_spend: totalAdSpend,
      aov: totalOrders > 0 ? totalNet / totalOrders : 0,
    })
  })

  return result.sort((a, b) => b.month.localeCompare(a.month))
}

// Aggregate daily data to quarterly
export function aggregateToQuarterly(dailyData: DailyPnl[]): MonthlyPnl[] {
  const quarterMap = new Map<string, Map<string, DailyPnl[]>>()

  dailyData.forEach((row) => {
    const date = new Date(row.date)
    const quarter = Math.floor(date.getMonth() / 3) + 1
    const quarterKey = `${date.getFullYear()}-Q${quarter}`

    if (!quarterMap.has(quarterKey)) {
      quarterMap.set(quarterKey, new Map())
    }
    const platformMap = quarterMap.get(quarterKey)!
    if (!platformMap.has(row.platform)) {
      platformMap.set(row.platform, [])
    }
    platformMap.get(row.platform)!.push(row)
  })

  const result: MonthlyPnl[] = []
  quarterMap.forEach((platformMap, quarterKey) => {
    let totalGross = 0, totalDiscounts = 0, totalReturns = 0, totalNet = 0, totalExIva = 0
    let totalIva = 0, totalOrders = 0, totalCogs = 0, totalAdSpend = 0

    platformMap.forEach((rows, platform) => {
      const gross = rows.reduce((sum, r) => sum + r.gross_revenue, 0)
      const discounts = rows.reduce((sum, r) => sum + r.discounts, 0)
      const returns = rows.reduce((sum, r) => sum + r.returns, 0)
      const net = rows.reduce((sum, r) => sum + r.net_revenue, 0)
      const exIva = rows.reduce((sum, r) => sum + r.revenue_ex_iva, 0)
      const iva = rows.reduce((sum, r) => sum + r.iva_collected, 0)
      const orders = rows.reduce((sum, r) => sum + r.orders, 0)
      const cogs = rows.reduce((sum, r) => sum + r.cogs, 0)
      const adSpend = rows.reduce((sum, r) => sum + r.meta_ad_spend, 0)

      result.push({
        month: quarterKey,
        platform,
        gross_revenue: gross,
        discounts,
        returns,
        net_revenue: net,
        revenue_ex_iva: exIva,
        iva_collected: iva,
        orders,
        cogs,
        meta_ad_spend: adSpend,
        aov: orders > 0 ? net / orders : 0,
      })

      totalGross += gross
      totalDiscounts += discounts
      totalReturns += returns
      totalNet += net
      totalExIva += exIva
      totalIva += iva
      totalOrders += orders
      totalCogs += cogs
      totalAdSpend += adSpend
    })

    result.push({
      month: quarterKey,
      platform: 'all_platforms',
      gross_revenue: totalGross,
      discounts: totalDiscounts,
      returns: totalReturns,
      net_revenue: totalNet,
      revenue_ex_iva: totalExIva,
      iva_collected: totalIva,
      orders: totalOrders,
      cogs: totalCogs,
      meta_ad_spend: totalAdSpend,
      aov: totalOrders > 0 ? totalNet / totalOrders : 0,
    })
  })

  return result.sort((a, b) => b.month.localeCompare(a.month))
}

// Aggregate daily data to yearly
export function aggregateToYearly(dailyData: DailyPnl[]): MonthlyPnl[] {
  const yearMap = new Map<string, Map<string, DailyPnl[]>>()

  dailyData.forEach((row) => {
    const date = new Date(row.date)
    const yearKey = `${date.getFullYear()}`

    if (!yearMap.has(yearKey)) {
      yearMap.set(yearKey, new Map())
    }
    const platformMap = yearMap.get(yearKey)!
    if (!platformMap.has(row.platform)) {
      platformMap.set(row.platform, [])
    }
    platformMap.get(row.platform)!.push(row)
  })

  const result: MonthlyPnl[] = []
  yearMap.forEach((platformMap, yearKey) => {
    let totalGross = 0, totalDiscounts = 0, totalReturns = 0, totalNet = 0, totalExIva = 0
    let totalIva = 0, totalOrders = 0, totalCogs = 0, totalAdSpend = 0

    platformMap.forEach((rows, platform) => {
      const gross = rows.reduce((sum, r) => sum + r.gross_revenue, 0)
      const discounts = rows.reduce((sum, r) => sum + r.discounts, 0)
      const returns = rows.reduce((sum, r) => sum + r.returns, 0)
      const net = rows.reduce((sum, r) => sum + r.net_revenue, 0)
      const exIva = rows.reduce((sum, r) => sum + r.revenue_ex_iva, 0)
      const iva = rows.reduce((sum, r) => sum + r.iva_collected, 0)
      const orders = rows.reduce((sum, r) => sum + r.orders, 0)
      const cogs = rows.reduce((sum, r) => sum + r.cogs, 0)
      const adSpend = rows.reduce((sum, r) => sum + r.meta_ad_spend, 0)

      result.push({
        month: yearKey,
        platform,
        gross_revenue: gross,
        discounts,
        returns,
        net_revenue: net,
        revenue_ex_iva: exIva,
        iva_collected: iva,
        orders,
        cogs,
        meta_ad_spend: adSpend,
        aov: orders > 0 ? net / orders : 0,
      })

      totalGross += gross
      totalDiscounts += discounts
      totalReturns += returns
      totalNet += net
      totalExIva += exIva
      totalIva += iva
      totalOrders += orders
      totalCogs += cogs
      totalAdSpend += adSpend
    })

    result.push({
      month: yearKey,
      platform: 'all_platforms',
      gross_revenue: totalGross,
      discounts: totalDiscounts,
      returns: totalReturns,
      net_revenue: totalNet,
      revenue_ex_iva: totalExIva,
      iva_collected: totalIva,
      orders: totalOrders,
      cogs: totalCogs,
      meta_ad_spend: totalAdSpend,
      aov: totalOrders > 0 ? totalNet / totalOrders : 0,
    })
  })

  return result.sort((a, b) => b.month.localeCompare(a.month))
}

// Convert daily data to MonthlyPnl format (for daily view)
export function dailyToMonthlyFormat(dailyData: DailyPnl[]): MonthlyPnl[] {
  const dateMap = new Map<string, DailyPnl[]>()

  dailyData.forEach((row) => {
    if (!dateMap.has(row.date)) {
      dateMap.set(row.date, [])
    }
    dateMap.get(row.date)!.push(row)
  })

  const result: MonthlyPnl[] = []
  dateMap.forEach((rows, date) => {
    let totalGross = 0, totalDiscounts = 0, totalReturns = 0, totalNet = 0, totalExIva = 0
    let totalIva = 0, totalOrders = 0, totalCogs = 0, totalAdSpend = 0

    rows.forEach((row) => {
      result.push({
        month: date,
        platform: row.platform,
        gross_revenue: row.gross_revenue,
        discounts: row.discounts,
        returns: row.returns,
        net_revenue: row.net_revenue,
        revenue_ex_iva: row.revenue_ex_iva,
        iva_collected: row.iva_collected,
        orders: row.orders,
        cogs: row.cogs,
        meta_ad_spend: row.meta_ad_spend,
        aov: row.orders > 0 ? row.net_revenue / row.orders : 0,
      })

      totalGross += row.gross_revenue
      totalDiscounts += row.discounts
      totalReturns += row.returns
      totalNet += row.net_revenue
      totalExIva += row.revenue_ex_iva
      totalIva += row.iva_collected
      totalOrders += row.orders
      totalCogs += row.cogs
      totalAdSpend += row.meta_ad_spend
    })

    result.push({
      month: date,
      platform: 'all_platforms',
      gross_revenue: totalGross,
      discounts: totalDiscounts,
      returns: totalReturns,
      net_revenue: totalNet,
      revenue_ex_iva: totalExIva,
      iva_collected: totalIva,
      orders: totalOrders,
      cogs: totalCogs,
      meta_ad_spend: totalAdSpend,
      aov: totalOrders > 0 ? totalNet / totalOrders : 0,
    })
  })

  return result.sort((a, b) => b.month.localeCompare(a.month))
}

// Main function to get P&L data based on period
export async function getPnlByPeriod(
  period: Period,
  customRange?: DateRange
): Promise<MonthlyPnl[]> {
  // For monthly view, use the simple query that was working before
  if (period === 'monthly') {
    return getMonthlyPnl(12)
  }

  const range = period === 'custom' && customRange
    ? customRange
    : getDateRangeForPeriod(period)

  // For other periods, fetch daily data and aggregate
  const dailyData = await getDailyPnlByRange(range)

  switch (period) {
    case 'daily':
    case 'custom':
      return dailyToMonthlyFormat(dailyData)
    case 'weekly':
      return aggregateToWeekly(dailyData)
    case 'quarterly':
      return aggregateToQuarterly(dailyData)
    case 'yearly':
      return aggregateToYearly(dailyData)
    default:
      return dailyToMonthlyFormat(dailyData)
  }
}

export async function getCreativePerformance(limit: number = 20): Promise<CreativePerformance[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('fct_creative_performance')
    .select('*')
    .order('spend', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getHaloCorrelations(): Promise<HaloCorrelation[]> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('fct_halo_correlations')
    .select('*')
    .order('correlation', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDailyPnl(days: number = 30) {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('fct_daily_pnl')
    .select('*')
    .order('date', { ascending: false })
    .limit(days * 3) // 3 platforms per day

  if (error) throw error
  return data || []
}
