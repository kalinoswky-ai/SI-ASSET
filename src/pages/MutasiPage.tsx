import { useEffect, useState } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import type { Asset, AssetMutation, Room } from '@/types'

export default function MutasiPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<AssetMutation[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<AssetMutation>>({})

  async function load() {
    const { data: m } = await supabase
      .from('asset_mutations')
      .select('*, asset:assets(*)')
      .order('mutation_date', { ascending: false })
    const { data: a } = await supabase.from('assets').select('*')
    const { data: r } = await supabase.from('rooms').select('*')
    setItems((m ?? []) as unknown as AssetMutation[])
    setAssets((a ?? []) as Asset[])
    setRooms((r ?? []) as Room[])
  }

  useEffect(() => {
    load()
  }, [])

  async function submit() {
    if (!form.asset_id || !form.to_room_id || !form.reason) return
    const asset = assets.find((a) => a.id === form.asset_id)
    await supabase.from('asset_mutations').insert({
      ...form,
      from_room_id: asset?.room_id ?? null,
      mutation_date: form.mutation_date || new Date().toISOString(),
      approved_by: profile?.id,
    } as AssetMutation)
    await supabase.from('assets').update({ room_id: form.to_room_id }).eq('id', form.asset_id)
    setOpen(false)
    setForm({})
    load()
  }

  function roomName(id: string | null) {
    return rooms.find((r) => r.id === id)?.name ?? '-'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mutasi Barang</h1>
          <p className="text-muted-foreground text-sm">Perpindahan aset antar ruangan, bidang, atau pengguna</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Catat Mutasi</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Aset</th>
                  <th className="px-4 py-2 text-left font-medium">Perpindahan</th>
                  <th className="px-4 py-2 text-left font-medium">Alasan</th>
                  <th className="px-4 py-2 text-left font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Belum ada riwayat mutasi.</td></tr>
                ) : items.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-2">{m.asset?.name ?? '-'}</td>
                    <td className="px-4 py-2 flex items-center gap-1">
                      {roomName(m.from_room_id)} <ArrowRight className="h-3 w-3 text-muted-foreground" /> {roomName(m.to_room_id)}
                    </td>
                    <td className="px-4 py-2">{m.reason}</td>
                    <td className="px-4 py-2">{formatDate(m.mutation_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Catat Mutasi Barang</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Aset</Label>
              <Select value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih aset" /></SelectTrigger>
                <SelectContent>{assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ruangan Tujuan</Label>
              <Select value={form.to_room_id ?? undefined} onValueChange={(v) => setForm({ ...form, to_room_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih ruangan tujuan" /></SelectTrigger>
                <SelectContent>{rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Mutasi</Label>
              <Input type="date" value={form.mutation_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, mutation_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Alasan Mutasi</Label>
              <Input value={form.reason ?? ''} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Contoh: Reorganisasi ruang kerja" />
            </div>
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
