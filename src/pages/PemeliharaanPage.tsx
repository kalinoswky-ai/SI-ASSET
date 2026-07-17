import { useEffect, useState } from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { formatDate, formatRupiah } from '@/lib/utils'
import type { Asset, AssetMaintenance, Supplier } from '@/types'

export default function PemeliharaanPage() {
  const [items, setItems] = useState<AssetMaintenance[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [vendors, setVendors] = useState<Supplier[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<AssetMaintenance>>({})

  async function load() {
    const { data: m } = await supabase
      .from('asset_maintenance')
      .select('*, asset:assets(*), vendor:suppliers(*)')
      .order('scheduled_date', { ascending: false })
    const { data: a } = await supabase.from('assets').select('*')
    const { data: v } = await supabase.from('suppliers').select('*')
    setItems((m ?? []) as unknown as AssetMaintenance[])
    setAssets((a ?? []) as Asset[])
    setVendors((v ?? []) as Supplier[])
  }

  useEffect(() => {
    load()
  }, [])

  async function submit() {
    if (!form.asset_id || !form.scheduled_date || !form.description) return
    const { asset: _asset, vendor: _vendor, ...payload } = form
    await supabase.from('asset_maintenance').insert({
      ...payload,
      asset_id: form.asset_id,
      scheduled_date: form.scheduled_date,
      description: form.description,
    })
    await supabase.from('assets').update({ status: 'dalam_pemeliharaan' }).eq('id', form.asset_id)
    setOpen(false)
    setForm({})
    load()
  }

  async function complete(item: AssetMaintenance) {
    await supabase.from('asset_maintenance').update({ completed_date: new Date().toISOString() }).eq('id', item.id)
    await supabase.from('assets').update({ status: 'aktif' }).eq('id', item.asset_id)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pemeliharaan Aset</h1>
          <p className="text-muted-foreground text-sm">Jadwal servis, biaya, dan vendor pemeliharaan barang</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Jadwalkan Pemeliharaan</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Aset</th>
                  <th className="px-4 py-2 text-left font-medium">Jadwal</th>
                  <th className="px-4 py-2 text-left font-medium">Vendor</th>
                  <th className="px-4 py-2 text-left font-medium">Biaya</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Belum ada jadwal pemeliharaan.</td></tr>
                ) : items.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-2">{m.asset?.name ?? '-'}</td>
                    <td className="px-4 py-2">{formatDate(m.scheduled_date)}</td>
                    <td className="px-4 py-2">{m.vendor?.name ?? '-'}</td>
                    <td className="px-4 py-2">{formatRupiah(m.cost)}</td>
                    <td className="px-4 py-2">
                      <Badge variant={m.completed_date ? 'success' : 'warning'}>{m.completed_date ? 'Selesai' : 'Berjalan'}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {!m.completed_date && (
                        <Button size="sm" variant="outline" onClick={() => complete(m)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Tandai Selesai
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Jadwalkan Pemeliharaan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Aset</Label>
              <Select value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih aset" /></SelectTrigger>
                <SelectContent>{assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Select value={form.vendor_id ?? undefined} onValueChange={(v) => setForm({ ...form, vendor_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih vendor" /></SelectTrigger>
                <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tanggal Jadwal</Label>
                <Input type="date" value={form.scheduled_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Estimasi Biaya (Rp)</Label>
                <Input type="number" value={form.cost ?? ''} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi Pekerjaan</Label>
              <Input value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Contoh: Servis AC ruang arsip" />
            </div>
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
