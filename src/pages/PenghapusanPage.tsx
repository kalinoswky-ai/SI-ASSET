import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { FormField, FormSelect } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/Toast'
import { formatDate } from '@/lib/utils'
import type { Asset, AssetDisposal } from '@/types'

const typeLabel: Record<string, string> = {
  rusak_berat: 'Rusak Berat',
  hibah: 'Hibah',
  pemusnahan: 'Pemusnahan',
}

export default function PenghapusanPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<AssetDisposal[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<AssetDisposal>>({})

  async function load() {
    setLoading(true)
    const { data: d } = await supabase
      .from('asset_disposals')
      .select('*, asset:assets(*)')
      .order('disposal_date', { ascending: false })
    const { data: a } = await supabase.from('assets').select('*').neq('status', 'dihapus')
    setItems((d ?? []) as unknown as AssetDisposal[])
    setAssets((a ?? []) as Asset[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function submit() {
    if (!form.asset_id || !form.disposal_type || !form.disposal_date || !form.reason) {
      toast('Lengkapi seluruh kolom wajib terlebih dahulu', 'error')
      return
    }
    const { asset: _asset, ...payload } = form
    await supabase.from('asset_disposals').insert({
      ...payload,
      asset_id: form.asset_id,
      disposal_type: form.disposal_type,
      disposal_date: form.disposal_date,
      reason: form.reason,
      approved_by: profile?.id,
    })
    await supabase.from('assets').update({ status: 'dihapus' }).eq('id', form.asset_id)
    toast('Penghapusan aset berhasil dicatat', 'success')
    setOpen(false)
    setForm({})
    load()
  }

  const columns: DataTableColumn<AssetDisposal>[] = [
    { key: 'asset', label: 'Aset', render: (d) => d.asset?.name ?? '-' },
    { key: 'disposal_type', label: 'Jenis', render: (d) => <Badge variant="destructive">{typeLabel[d.disposal_type]}</Badge> },
    { key: 'reason', label: 'Alasan', hideOnMobile: true },
    { key: 'disposal_date', label: 'Tanggal', render: (d) => formatDate(d.disposal_date) },
  ]

  return (
    <div>
      <PageHeader
        title="Penghapusan Aset"
        description="Aset rusak berat, hibah, atau pemusnahan beserta berita acara"
        icon={Trash2}
        crumbs={[{ label: 'Penghapusan' }]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Catat Penghapusan</Button>}
      />

      <Card>
        <div className="p-5 md:p-6">
          <DataTable<AssetDisposal>
            columns={columns}
            data={items}
            loading={loading}
            onRefresh={load}
            exportFileName="penghapusan-aset"
            searchPlaceholder="Cari aset atau alasan..."
            searchText={(d) => `${d.asset?.name ?? ''} ${d.reason}`}
            emptyTitle="Belum ada riwayat penghapusan"
            emptyDescription="Catat penghapusan aset pertama menggunakan tombol di atas."
          />
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Catat Penghapusan Aset</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <FormSelect label="Aset" placeholder="Pilih aset" value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v })} options={assets.map((a) => ({ value: a.id, label: a.name }))} required />
            <FormSelect
              label="Jenis Penghapusan"
              placeholder="Pilih jenis"
              value={form.disposal_type}
              onValueChange={(v) => setForm({ ...form, disposal_type: v as AssetDisposal['disposal_type'] })}
              options={[
                { value: 'rusak_berat', label: 'Rusak Berat' },
                { value: 'hibah', label: 'Hibah' },
                { value: 'pemusnahan', label: 'Pemusnahan' },
              ]}
              required
            />
            <FormField label="Tanggal Penghapusan" type="date" value={form.disposal_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, disposal_date: e.target.value })} required />
            <FormField label="Alasan / Keterangan" value={form.reason ?? ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={submit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
