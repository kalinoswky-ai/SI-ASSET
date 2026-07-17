import { useEffect, useState } from 'react'
import { Plus, Search, QrCode, ImageOff } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { formatRupiah, generateAssetCode } from '@/lib/utils'
import type { Asset, AssetCategory, Room } from '@/types'

const conditionLabel: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  baik: { label: 'Baik', variant: 'success' },
  rusak_ringan: { label: 'Rusak Ringan', variant: 'warning' },
  rusak_berat: { label: 'Rusak Berat', variant: 'destructive' },
}

const statusLabel: Record<string, string> = {
  aktif: 'Aktif',
  dipinjam: 'Dipinjam',
  dalam_pemeliharaan: 'Pemeliharaan',
  dihapus: 'Dihapus',
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [form, setForm] = useState<Partial<Asset>>({})

  async function load() {
    setLoading(true)
    const { data: a } = await supabase.from('assets').select('*').order('created_at', { ascending: false })
    const { data: c } = await supabase.from('asset_categories').select('*')
    const { data: r } = await supabase.from('rooms').select('*')
    setAssets((a ?? []) as Asset[])
    setCategories((c ?? []) as AssetCategory[])
    setRooms((r ?? []) as Room[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setForm({ condition: 'baik', status: 'aktif', acquisition_year: new Date().getFullYear() })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.register_number || !form.name || !form.category_id || !form.acquisition_year || !form.acquisition_value) return

    const category = categories.find((c) => c.id === form.category_id)
    const sequence = assets.length + 1
    const assetCode = form.asset_code || generateAssetCode(category?.code ?? 'AST', sequence)
    const qrValue = form.qr_code_value || `${assetCode}-${Date.now()}`

    const { category: _category, room: _room, responsible_person: _responsiblePerson, ...payload } = form

    await supabase.from('assets').insert({
      ...payload,
      register_number: form.register_number,
      name: form.name,
      category_id: form.category_id,
      acquisition_year: form.acquisition_year,
      acquisition_value: form.acquisition_value,
      asset_code: assetCode,
      qr_code_value: qrValue,
    })

    setOpen(false)
    load()
  }

  const filtered = assets.filter((a) =>
    `${a.name} ${a.asset_code} ${a.register_number}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Aset</h1>
          <p className="text-muted-foreground text-sm">Seluruh Barang Milik Daerah yang dikelola Inspektorat</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Aset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari nama, kode, atau no. register..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Kode Barang</th>
                  <th className="px-4 py-2 text-left font-medium">Nama Barang</th>
                  <th className="px-4 py-2 text-left font-medium">Tahun</th>
                  <th className="px-4 py-2 text-left font-medium">Nilai</th>
                  <th className="px-4 py-2 text-left font-medium">Kondisi</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">QR</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Memuat data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Belum ada aset tercatat.</td></tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-2 font-mono text-xs">{a.asset_code}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {a.photo_url ? (
                            <img src={a.photo_url} className="h-8 w-8 rounded object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                              <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{a.name}</p>
                            <p className="text-xs text-muted-foreground">{a.brand_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{a.acquisition_year}</td>
                      <td className="px-4 py-2">{formatRupiah(a.acquisition_value)}</td>
                      <td className="px-4 py-2">
                        <Badge variant={conditionLabel[a.condition]?.variant ?? 'outline'}>
                          {conditionLabel[a.condition]?.label ?? a.condition}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">{statusLabel[a.status] ?? a.status}</td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setQrAsset(a)}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form Tambah Aset */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Tambah Aset</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Nama Barang</Label>
              <Input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Register</Label>
              <Input value={form.register_number ?? ''} onChange={(e) => setForm({ ...form, register_number: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Merk / Tipe</Label>
              <Input value={form.brand_type ?? ''} onChange={(e) => setForm({ ...form, brand_type: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nomor Seri</Label>
              <Input value={form.serial_number ?? ''} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ruangan</Label>
              <Select value={form.room_id ?? undefined} onValueChange={(v) => setForm({ ...form, room_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih ruangan" /></SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tahun Perolehan</Label>
              <Input type="number" value={form.acquisition_year ?? ''} onChange={(e) => setForm({ ...form, acquisition_year: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Nilai Perolehan (Rp)</Label>
              <Input type="number" value={form.acquisition_value ?? ''} onChange={(e) => setForm({ ...form, acquisition_value: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Sumber Dana</Label>
              <Input value={form.funding_source ?? ''} onChange={(e) => setForm({ ...form, funding_source: e.target.value })} placeholder="Contoh: APBD 2026" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Aset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Preview */}
      <Dialog open={!!qrAsset} onOpenChange={(v) => !v && setQrAsset(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader><DialogTitle>QR Code Aset</DialogTitle></DialogHeader>
          {qrAsset && (
            <div className="flex flex-col items-center gap-3 py-2">
              <QRCodeSVG value={qrAsset.qr_code_value} size={180} />
              <p className="font-medium text-sm">{qrAsset.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{qrAsset.asset_code}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
