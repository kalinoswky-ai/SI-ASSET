import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import type { Asset, AssetDisposal } from '@/types'

const typeLabel: Record<string, string> = {
  rusak_berat: 'Rusak Berat',
  hibah: 'Hibah',
  pemusnahan: 'Pemusnahan',
}

export default function PenghapusanPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<AssetDisposal[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<AssetDisposal>>({})

  async function load() {
    const { data: d } = await supabase
      .from('asset_disposals')
      .select('*, asset:assets(*)')
      .order('disposal_date', { ascending: false })
    const { data: a } = await supabase.from('assets').select('*').neq('status', 'dihapus')
    setItems((d ?? []) as unknown as AssetDisposal[])
    setAssets((a ?? []) as Asset[])
  }

  useEffect(() => {
    load()
  }, [])

  async function submit() {
    if (!form.asset_id || !form.disposal_type || !form.disposal_date || !form.reason) return
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
    setOpen(false)
    setForm({})
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Penghapusan Aset</h1>
          <p className="text-muted-foreground text-sm">Aset rusak berat, hibah, atau pemusnahan beserta berita acara</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Catat Penghapusan</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Aset</th>
                  <th className="px-4 py-2 text-left font-medium">Jenis</th>
                  <th className="px-4 py-2 text-left font-medium">Alasan</th>
                  <th className="px-4 py-2 text-left font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Belum ada riwayat penghapusan.</td></tr>
                ) : items.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-4 py-2">{d.asset?.name ?? '-'}</td>
                    <td className="px-4 py-2"><Badge variant="destructive">{typeLabel[d.disposal_type]}</Badge></td>
                    <td className="px-4 py-2">{d.reason}</td>
                    <td className="px-4 py-2">{formatDate(d.disposal_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Catat Penghapusan Aset</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Aset</Label>
              <Select value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih aset" /></SelectTrigger>
                <SelectContent>{assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Jenis Penghapusan</Label>
              <Select value={form.disposal_type} onValueChange={(v) => setForm({ ...form, disposal_type: v as AssetDisposal['disposal_type'] })}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                  <SelectItem value="hibah">Hibah</SelectItem>
                  <SelectItem value="pemusnahan">Pemusnahan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Penghapusan</Label>
              <Input type="date" value={form.disposal_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, disposal_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Alasan / Keterangan</Label>
              <Input value={form.reason ?? ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </div>
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
