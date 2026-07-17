import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import type { LucideIcon } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  label: string
  value: number
  displayValue?: string
  icon: LucideIcon
  gradient: string
  sparkline?: number[]
  sparkColor?: string
  loading?: boolean
}

export function SummaryCard({
  label,
  value,
  displayValue,
  icon: Icon,
  gradient,
  sparkline,
  sparkColor = '#2563EB',
  loading,
}: SummaryCardProps) {
  const animated = useCountUp(value)
  const sparkData = (sparkline ?? []).map((v, i) => ({ i, v }))

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(37,99,235,0.35)]'
      )}
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--surface-border)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-35"
        style={{ background: gradient }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105'
          )}
          style={{ background: gradient }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        {sparkData.length > 1 && (
          <div className="h-10 w-20 opacity-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sparkColor} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.5} fill={`url(#spark-${label})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <p
        className="mt-4 font-display text-2xl font-extrabold tabular-nums tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {loading ? '···' : displayValue ?? animated.toLocaleString('id-ID')}
      </p>
      <p className="mt-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  )
}
