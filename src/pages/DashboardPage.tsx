import { useEffect, useState } from 'react'
import { Boxes, Wallet, PackageCheck, HandCoins, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/utils'
import type { DashboardStats } from '@/types'

const COLORS = ['#0f5c8a', '#f0a83f', '#2e9e63', '#c0392b', '#7e57c2']

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)

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
      for (const a of list) {
        conditionCounts[a.condition as keyof typeof conditionCounts]++
      }

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

    loadStats()
  }, [])

  const cards = [
    { label: 'Total Aset', value: stats.totalAssets, icon: Boxes, color: 'text-primary' },
    { label: 'Total Nilai Aset', value: formatRupiah(stats.totalValue), icon: Wallet, color: 'text-emerald-600' },
    { label: 'Aset Aktif', value: stats.activeAssets, icon: PackageCheck, color: 'text-emerald-600' },
    { label: 'Sedang Dipinjam', value: stats.loanedAssets, icon: HandCoins, color: 'text-amber-600' },
    { label: 'Aset Rusak', value: stats.damagedAssets, icon: AlertTriangle, color: 'text-destructive' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Ringkasan pengelolaan aset Inspektorat Kabupaten Sumba Barat</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <c.icon className={`h-5 w-5 mb-2 ${c.color}`} />
              <p className="text-xl font-bold">{loading ? '...' : c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Aset per Kategori</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0f5c8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Kondisi Aset</CardTitle></CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byCondition} dataKey="value" nameKey="name" outerRadius={90} label>
                  {stats.byCondition.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Aset per Ruangan</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byRoom} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#f0a83f" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Penambahan Aset per Tahun</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byYear}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="year" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#2e9e63" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
