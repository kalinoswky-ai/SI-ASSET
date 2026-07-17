import { useEffect, useState } from 'react'
import { Plus, CheckCircle2, Wrench } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { FormField, FormSelect } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/Toast'
import { formatDate, formatRupiah } from '@/lib/utils'
import type { Asset, AssetMaintenance, Supplier } from '@/types'

export default function PemeliharaanPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<AssetMaintenance[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [vendors, setVendors] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<AssetMaintenance>>({})

  async function load() {
    setLoading(true)
    const { data: m } = await supabase
      .from('asset_maintenance')
      .select('*, asset:assets(*), vendor:suppliers(*)')
      .order('scheduled_date', { ascending: false })
    const { data: a } = await supabase.from('assets').select('*')
    const { data: v } = await supabase.from('suppliers').select('*')
    setItems((m ?? []) as unknown as AssetMaintenance[])
    setAssets((a ?? []) as Asset[])
    setVendors((v ?? []) as Supplier[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function submit() {
    if (!form.asset_id || !form.scheduled_date || !form.description) {
      toast('Lengkapi seluruh kolom wajib terlebih dahulu', 'error')
      return
    }
    const { asset: _asset, vendor: _vendor, ...payload } = form
    await supabase.from('asset_maintenance').insert({
      ...payload,
      asset_id: form.asset_id,
      scheduled_date: form.scheduled_date,
      description: form.description,
    })
    await supabase.from('assets').update({ status: 'dalam_pemeliharaan' }).eq('id', form.asset_id)
    toast('Jadwal pemeliharaan berhasil disimpan', 'success')
    setOpen(false)
    setForm({})
    load()
  }

  async function complete(item: AssetMaintenance) {
    await supabase.from('asset_maintenance').update({ completed_date: new Date().toISOString() }).eq('id', item.id)
    await supabase.from('assets').update({ status: 'aktif' }).eq('id', item.asset_id)
    toast('Pemeliharaan ditandai selesai', 'success')
    load()
  }

  const columns: DataTableColumn<AssetMaintenance>[] = [
    { key: 'asset', label: 'Aset', render: (m) => m.asset?.name ?? '-' },
    { key: 'scheduled_date', label: 'Jadwal', render: (m) => formatDate(m.scheduled_date) },
    { key: 'vendor', label: 'Vendor', hideOnMobile: true, render: (m) => m.vendor?.name ?? '-' },
    { key: 'cost', label: 'Biaya', hideOnMobile: true, render: (m) => formatRupiah(m.cost), sortValue: (m) => m.cost ?? 0 },
    {
      key: 'status',
      label: 'Status',
      render: (m) => <Badge variant={m.completed_date ? 'success' : 'warning'}>{m.completed_date ? 'Selesai' : 'Berjalan'}</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Pemeliharaan Aset"
        description="Jadwal servis, biaya, dan vendor pemeliharaan barang"
        icon={Wrench}
        crumbs={[{ label: 'Pemeliharaan' }]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Jadwalkan Pemeliharaan</Button>}
      />

      <Card>
        <div className="p-5 md:p-6">
          <DataTable<AssetMaintenance>
            columns={columns}
            data={items}
            loading={loading}
            onRefresh={load}
            exportFileName="pemeliharaan-aset"
            searchPlaceholder="Cari aset atau vendor..."
            searchText={(m) => `${m.asset?.name ?? ''} ${m.vendor?.name ?? ''}`}
            emptyTitle="Belum ada jadwal pemeliharaan"
            emptyDescription="Jadwalkan pemeliharaan pertama menggunakan tombol di atas."
            rowActions={(m) =>
              !m.completed_date ? (
                <Button size="sm" variant="outline" onClick={() => complete(m)}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Selesai
                </Button>
              ) : null
            }
          />
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Jadwalkan Pemeliharaan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <FormSelect label="Aset" placeholder="Pilih aset" value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v })} options={assets.map((a) => ({ value: a.id, label: a.name }))} required />
            <FormSelect label="Vendor" placeholder="Pilih vendor" value={form.vendor_id ?? undefined} onValueChange={(v) => setForm({ ...form, vendor_id: v })} options={vendors.map((v) => ({ value: v.id, label: v.name }))} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tanggal Jadwal" type="date" value={form.scheduled_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} required />
              <FormField label="Estimasi Biaya (Rp)" type="number" value={form.cost ?? ''} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
            </div>
            <FormField label="Deskripsi Pekerjaan" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} hint="Contoh: Servis AC ruang arsip" required />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={submit}>Simpan Jadwal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
