'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

interface DateFilterProps {
  className?: string
}

export function DateFilter({ className = '' }: DateFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPeriod = (searchParams.get('period') as Period) || 'monthly'
  const customStart = searchParams.get('start') || ''
  const customEnd = searchParams.get('end') || ''

  const [showCustom, setShowCustom] = useState(currentPeriod === 'custom')
  const [startDate, setStartDate] = useState(customStart)
  const [endDate, setEndDate] = useState(customEnd)

  const updateParams = useCallback(
    (period: Period, start?: string, end?: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('period', period)

      if (period === 'custom' && start && end) {
        params.set('start', start)
        params.set('end', end)
      } else {
        params.delete('start')
        params.delete('end')
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const handlePeriodChange = (period: Period) => {
    if (period === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      updateParams(period)
    }
  }

  const handleCustomApply = () => {
    if (startDate && endDate) {
      updateParams('custom', startDate, endDate)
    }
  }

  const periods: { value: Period; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
  ]

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex rounded-lg border border-zinc-200 bg-white p-1">
        {periods.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handlePeriodChange(value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              currentPeriod === value
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <span className="text-zinc-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <button
            onClick={handleCustomApply}
            disabled={!startDate || !endDate}
            className="px-3 py-1.5 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
