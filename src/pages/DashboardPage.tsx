import { useEffect, useState } from 'react'
import {
  Boxes, Wallet, PackageCheck, HandCoins, AlertTriangle, ClipboardCheck,
  Clock, ArrowUpRight, Wrench, CalendarClock,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatRupiah, formatDate } from '@/lib/utils'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { useAuth } from '@/contexts/AuthContext'
import rumahAdatSumba from '@/assets/login/rumah-adat-sumba.jpg'
import type { DashboardStats } from '@/types'

const COLORS = ['#10B981', '#FFD54F', '#EF4444', '#2563EB', '#7e57c2']

const emptyStats: DashboardStats = {
  totalAssets: 0,
  totalValue: 0,
  activeAssets: 0,
  loanedAssets: 0,
  damagedAssets: 0,
  byCategory: [],
  byRoom: [],
  byCondition: [],
  byYear: [],
}

interface ActivityItem {
  id: string
  action: string
  entity_type: string
  details: string | null
  created_at: string
  actor: string
}

interface AttentionItem {
  id: string
  title: string
  subtitle: string
  icon: 'loan' | 'maintenance'
}

const glassCard = 'rounded-2xl border p-5 backdrop-blur-xl'
const glassCardStyle = { background: 'var(--surface)', borderColor: 'var(--surface-border)' }

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [attention, setAttention] = useState<AttentionItem[]>([])

  useEffect(() => {
    async function loadStats() {
      setLoading(true)

      const { data: assets } = await supabase
        .from('assets')
        .select('id, status, condition, acquisition_value, acquisition_year, category_id, room_id')

      const list = assets ?? []

      const { data: categories } = await supabase.from('asset_categories').select('id, name')
      const { data: rooms } = await supabase.from('rooms').select('id, name')

      const catMap = new Map((categories ?? []).map((c) => [c.id, c.name]))
      const roomMap = new Map((rooms ?? []).map((r) => [r.id, r.name]))

      const byCategoryMap = new Map<string, number>()
      const byRoomMap = new Map<string, number>()
      const byYearMap = new Map<string, number>()
      let totalValue = 0
      let activeAssets = 0
      let loanedAssets = 0
      let damagedAssets = 0

      for (const a of list) {
        totalValue += a.acquisition_value ?? 0
        if (a.status === 'aktif') activeAssets++
        if (a.status === 'dipinjam') loanedAssets++
        if (a.condition === 'rusak_ringan' || a.condition === 'rusak_berat') damagedAssets++

        const catName = catMap.get(a.category_id) ?? 'Lainnya'
        byCategoryMap.set(catName, (byCategoryMap.get(catName) ?? 0) + 1)

        const roomName = a.room_id ? roomMap.get(a.room_id) ?? 'Lainnya' : 'Belum diset'
        byRoomMap.set(roomName, (byRoomMap.get(roomName) ?? 0) + 1)

        const year = String(a.acquisition_year)
        byYearMap.set(year, (byYearMap.get(year) ?? 0) + 1)
      }

      const conditionCounts = { baik: 0, rusak_ringan: 0, rusak_berat: 0 }
      for (const a of list) conditionCounts[a.condition as keyof typeof conditionCounts]++

      setStats({
        totalAssets: list.length,
        totalValue,
        activeAssets,
        loanedAssets,
        damagedAssets,
        byCategory: Array.from(byCategoryMap, ([name, value]) => ({ name, value })),
        byRoom: Array.from(byRoomMap, ([name, value]) => ({ name, value })),
        byCondition: [
          { name: 'Baik', value: conditionCounts.baik },
          { name: 'Rusak Ringan', value: conditionCounts.rusak_ringan },
          { name: 'Rusak Berat', value: conditionCounts.rusak_berat },
        ],
        byYear: Array.from(byYearMap, ([year, value]) => ({ year, value })).sort((a, b) => Number(a.year) - Number(b.year)),
      })
      setLoading(false)
    }

    async function loadActivity() {
      const { data } = await supabase
        .from('activity_logs')
        .select('id, action, entity_type, details, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(6)

      type Row = {
        id: string
        action: string
        entity_type: string
        details: string | null
        created_at: string
        profiles: { full_name: string } | null
      }
      const rows = (data ?? []) as unknown as Row[]

      setActivity(
        rows.map((row) => ({
          id: row.id,
          action: row.action,
          entity_type: row.entity_type,
          details: row.details,
          created_at: row.created_at,
          actor: row.profiles?.full_name ?? 'Sistem',
        }))
      )
    }

    async function loadAttention() {
      const today = new Date().toISOString().slice(0, 10)
      const inTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)

      const { data: overdueLoans } = await supabase
        .from('asset_loans')
        .select('id, expected_return_date, assets(name)')
        .eq('status', 'disetujui')
        .lt('expected_return_date', today)
        .limit(5)

      const { data: upcomingMaintenance } = await supabase
        .from('asset_maintenance')
        .select('id, scheduled_date, assets(name)')
        .is('completed_date', null)
        .gte('scheduled_date', today)
        .lte('scheduled_date', inTwoWeeks)
        .limit(5)

      const items: AttentionItem[] = [
        ...(overdueLoans ?? []).map((l) => ({
          id: `loan-${l.id}`,
          title: (l as unknown as { assets: { name: string } | null }).assets?.name ?? 'Aset dipinjam',
          subtitle: `Jatuh tempo kembali ${formatDate(l.expected_return_date)}`,
          icon: 'loan' as const,
        })),
        ...(upcomingMaintenance ?? []).map((m) => ({
          id: `maint-${m.id}`,
          title: (m as unknown as { assets: { name: string } | null }).assets?.name ?? 'Aset',
          subtitle: `Terjadwal pemeliharaan ${formatDate(m.scheduled_date)}`,
          icon: 'maintenance' as const,
        })),
      ]
      setAttention(items)
    }

    loadStats()
    loadActivity()
    loadAttention()
  }, [])

  const sparkTotal = stats.byYear.map((y) => y.value)

  const cards = [
    { label: 'Total Aset', value: stats.totalAssets, icon: Boxes, gradient: 'linear-gradient(135deg,#2563EB,#0B1F3A)', spark: sparkTotal, sparkColor: '#2563EB' },
    { label: 'Total Nilai Aset', value: stats.totalValue, displayValue: formatRupiah(stats.totalValue), icon: Wallet, gradient: 'linear-gradient(135deg,#FFD54F,#F4B400)', sparkColor: '#FFD54F' },
    { label: 'Aset Aktif', value: stats.activeAssets, icon: PackageCheck, gradient: 'linear-gradient(135deg,#10B981,#0f5c4a)', sparkColor: '#10B981' },
    { label: 'Sedang Dipinjam', value: stats.loanedAssets, icon: HandCoins, gradient: 'linear-gradient(135deg,#7e57c2,#4a2f8f)', sparkColor: '#7e57c2' },
    { label: 'Aset Rusak', value: stats.damagedAssets, icon: AlertTriangle, gradient: 'linear-gradient(135deg,#EF4444,#7a1414)', sparkColor: '#EF4444' },
  ]

  return (
    <div className="space-y-4 pt-1">
      {/* Hero welcome banner */}
      <div className="relative overflow-hidden rounded-3xl border" style={{ borderColor: 'var(--surface-border)' }}>
        <img src={rumahAdatSumba} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(7,26,53,0.94)_15%,rgba(7,26,53,0.75)_55%,rgba(7,26,53,0.4)_100%)]" />
        <div className="relative z-10 flex flex-col gap-4 p-6 md:p-8">
          <p className="text-sm text-white/70">
            Selamat datang, <span className="font-semibold text-white">{profile?.full_name ?? 'Pengguna'}</span> &middot; Online
          </p>
          <h1 className="max-w-xl font-display text-2xl font-extrabold leading-tight text-white md:text-3xl">
            Kelola aset daerah dengan lebih efektif, transparan, dan akuntabel.
          </h1>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-white/80">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
              {stats.totalAssets.toLocaleString('id-ID')} unit aset tercatat
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
              {formatRupiah(stats.totalValue)} total nilai
            </span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <SummaryCard
            key={c.label}
            label={c.label}
            value={c.value}
            displayValue={c.displayValue}
            icon={c.icon}
            gradient={c.gradient}
            sparkline={c.spark}
            sparkColor={c.sparkColor}
            loading={loading}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={glassCard} style={glassCardStyle}>
          <h3 className="mb-3 font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Aset per Kategori</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="name" fontSize={11} tick={{ fill: 'var(--text-faint)' }} />
                <YAxis fontSize={11} allowDecimals={false} tick={{ fill: 'var(--text-faint)' }} />
                <Tooltip contentStyle={{ background: '#0B1F3A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={glassCard} style={glassCardStyle}>
          <h3 className="mb-3 font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Kondisi Aset</h3>
          <div className="flex h-64 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byCondition} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {stats.byCondition.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0B1F3A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={glassCard} style={glassCardStyle}>
          <h3 className="mb-3 font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Aset per Ruangan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byRoom} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis type="number" fontSize={11} allowDecimals={false} tick={{ fill: 'var(--text-faint)' }} />
                <YAxis type="category" dataKey="name" fontSize={11} width={100} tick={{ fill: 'var(--text-faint)' }} />
                <Tooltip contentStyle={{ background: '#0B1F3A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="value" fill="#FFD54F" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={glassCard} style={glassCardStyle}>
          <h3 className="mb-3 font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Penambahan Aset per Tahun</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="year" fontSize={11} tick={{ fill: 'var(--text-faint)' }} />
                <YAxis fontSize={11} allowDecimals={false} tick={{ fill: 'var(--text-faint)' }} />
                <Tooltip contentStyle={{ background: '#0B1F3A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity + attention */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={glassCard} style={glassCardStyle}>
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            <Clock className="h-4 w-4 text-brand-gold" /> Aktivitas Terbaru
          </h3>
          {activity.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Belum ada aktivitas tercatat.</p>
          ) : (
            <ul className="space-y-4">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-indigo" />
                  <div className="min-w-0">
                    <p style={{ color: 'var(--text-primary)' }}>
                      <span className="font-semibold">{a.action}</span>{' '}
                      <span style={{ color: 'var(--text-muted)' }}>({a.entity_type})</span>
                    </p>
                    {a.details && <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{a.details}</p>}
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      Oleh {a.actor} &middot; {formatDate(a.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={glassCard} style={glassCardStyle}>
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            <ClipboardCheck className="h-4 w-4 text-brand-gold" /> Perlu Perhatian
          </h3>
          {attention.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Tidak ada peminjaman terlambat atau pemeliharaan mendesak.</p>
          ) : (
            <ul className="space-y-3">
              {attention.map((item) => (
                <li key={item.id} className="flex items-start gap-3 rounded-xl border px-3 py-2.5" style={{ borderColor: 'var(--surface-border)' }}>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
                    {item.icon === 'loan' ? <ArrowUpRight className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                    <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <CalendarClock className="h-3 w-3" /> {item.subtitle}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
