import { supabase } from './supabase'

// Types
export interface MonthlyPnl {
  month: string
  platform: string
  gross_revenue: number
  discounts: number
  net_revenue: number
  revenue_ex_iva: number
  iva_collected: number
  orders: number
  meta_ad_spend: number
  aov: number
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
