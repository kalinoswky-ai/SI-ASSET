import { useEffect, useState } from 'react'
import { Plus, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { FormField, FormSelect } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/Toast'
import { formatDate } from '@/lib/utils'
import type { Asset, AssetMutation, Room } from '@/types'

export default function MutasiPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<AssetMutation[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<AssetMutation>>({})

  async function load() {
    setLoading(true)
    const { data: m } = await supabase
      .from('asset_mutations')
      .select('*, asset:assets(*)')
      .order('mutation_date', { ascending: false })
    const { data: a } = await supabase.from('assets').select('*')
    const { data: r } = await supabase.from('rooms').select('*')
    setItems((m ?? []) as unknown as AssetMutation[])
    setAssets((a ?? []) as Asset[])
    setRooms((r ?? []) as Room[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function submit() {
    if (!form.asset_id || !form.to_room_id || !form.reason) {
      toast('Lengkapi seluruh kolom wajib terlebih dahulu', 'error')
      return
    }
    const asset = assets.find((a) => a.id === form.asset_id)
    const { asset: _asset, ...payload } = form
    await supabase.from('asset_mutations').insert({
      ...payload,
      asset_id: form.asset_id,
      reason: form.reason,
      from_room_id: asset?.room_id ?? null,
      mutation_date: form.mutation_date || new Date().toISOString(),
      approved_by: profile?.id,
    })
    await supabase.from('assets').update({ room_id: form.to_room_id }).eq('id', form.asset_id)
    toast('Mutasi berhasil dicatat', 'success')
    setOpen(false)
    setForm({})
    load()
  }

  function roomName(id: string | null) {
    return rooms.find((r) => r.id === id)?.name ?? '-'
  }

  const columns: DataTableColumn<AssetMutation>[] = [
    { key: 'asset', label: 'Aset', render: (m) => m.asset?.name ?? '-' },
    {
      key: 'perpindahan',
      label: 'Perpindahan',
      sortable: false,
      render: (m) => (
        <span className="flex items-center gap-1.5 text-xs">
          {roomName(m.from_room_id)} <ArrowRight className="h-3 w-3" style={{ color: 'var(--text-faint)' }} /> {roomName(m.to_room_id)}
        </span>
      ),
    },
    { key: 'reason', label: 'Alasan', hideOnMobile: true },
    { key: 'mutation_date', label: 'Tanggal', render: (m) => formatDate(m.mutation_date) },
  ]

  return (
    <div>
      <PageHeader
        title="Mutasi Barang"
        description="Perpindahan aset antar ruangan, bidang, atau pengguna"
        icon={ArrowLeftRight}
        crumbs={[{ label: 'Mutasi Barang' }]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Catat Mutasi</Button>}
      />

      <Card>
        <div className="p-5 md:p-6">
          <DataTable<AssetMutation>
            columns={columns}
            data={items}
            loading={loading}
            onRefresh={load}
            exportFileName="mutasi-barang"
            searchPlaceholder="Cari aset atau alasan..."
            searchText={(m) => `${m.asset?.name ?? ''} ${m.reason}`}
            emptyTitle="Belum ada riwayat mutasi"
            emptyDescription="Catat perpindahan aset pertama menggunakan tombol di atas."
          />
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Catat Mutasi Barang</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <FormSelect label="Aset" placeholder="Pilih aset" value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v })} options={assets.map((a) => ({ value: a.id, label: a.name }))} required />
            <FormSelect label="Ruangan Tujuan" placeholder="Pilih ruangan tujuan" value={form.to_room_id ?? undefined} onValueChange={(v) => setForm({ ...form, to_room_id: v })} options={rooms.map((r) => ({ value: r.id, label: r.name }))} required />
            <FormField label="Tanggal Mutasi" type="date" value={form.mutation_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, mutation_date: e.target.value })} />
            <FormField label="Alasan Mutasi" value={form.reason ?? ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} hint="Contoh: Reorganisasi ruang kerja" required />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={submit}>Simpan Mutasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
