import { useEffect, useMemo, useState } from 'react'
import { Plus, QrCode, ImageOff, Boxes, Filter, Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { FormField, FormSelect } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/Toast'
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
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [form, setForm] = useState<Partial<Asset>>({})
  const [filterCondition, setFilterCondition] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

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
    if (!form.register_number || !form.name || !form.category_id || !form.acquisition_year || !form.acquisition_value) {
      toast('Lengkapi seluruh kolom wajib terlebih dahulu', 'error')
      return
    }

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

    toast('Aset baru berhasil ditambahkan', 'success')
    setOpen(false)
    load()
  }

  const filtered = useMemo(
    () =>
      assets
        .filter((a) => filterCondition === 'all' || a.condition === filterCondition)
        .filter((a) => filterCategory === 'all' || a.category_id === filterCategory),
    [assets, filterCondition, filterCategory]
  )

  const columns: DataTableColumn<Asset>[] = [
    {
      key: 'asset_code',
      label: 'Kode Barang',
      render: (a) => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{a.asset_code}</span>,
    },
    {
      key: 'name',
      label: 'Nama Barang',
      render: (a) => (
        <div className="flex items-center gap-2.5">
          {a.photo_url ? (
            <img src={a.photo_url} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--surface-strong)' }}>
              <ImageOff className="h-3.5 w-3.5" style={{ color: 'var(--text-faint)' }} />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{a.name}</p>
            <p className="truncate text-xs" style={{ color: 'var(--text-faint)' }}>{a.brand_type}</p>
          </div>
        </div>
      ),
    },
    { key: 'acquisition_year', label: 'Tahun', hideOnMobile: true },
    {
      key: 'acquisition_value',
      label: 'Nilai',
      hideOnMobile: true,
      render: (a) => formatRupiah(a.acquisition_value),
      sortValue: (a) => a.acquisition_value,
    },
    {
      key: 'condition',
      label: 'Kondisi',
      render: (a) => <Badge variant={conditionLabel[a.condition]?.variant ?? 'outline'}>{conditionLabel[a.condition]?.label ?? a.condition}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      hideOnMobile: true,
      render: (a) => statusLabel[a.status] ?? a.status,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Data Aset"
        description="Seluruh Barang Milik Daerah yang dikelola Inspektorat"
        icon={Boxes}
        crumbs={[{ label: 'Data Aset' }]}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Aset
          </Button>
        }
      />

      <Card>
        <div className="p-5 md:p-6">
          <DataTable<Asset>
            columns={columns}
            data={filtered}
            loading={loading}
            onRefresh={load}
            exportFileName="data-aset"
            searchPlaceholder="Cari nama, kode, atau no. register..."
            searchText={(a) => `${a.name} ${a.asset_code} ${a.register_number}`}
            emptyTitle="Belum ada aset tercatat"
            emptyDescription="Tambahkan aset pertama untuk mulai mengelola BMD."
            toolbarActions={
              <>
                <div className="hidden items-center gap-1.5 sm:flex" style={{ color: 'var(--text-faint)' }}>
                  <Filter className="h-3.5 w-3.5" />
                </div>
                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className="eams-field h-10 rounded-xl border bg-transparent px-2.5 text-xs outline-none"
                >
                  <option value="all">Semua Kondisi</option>
                  <option value="baik">Baik</option>
                  <option value="rusak_ringan">Rusak Ringan</option>
                  <option value="rusak_berat">Rusak Berat</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="eams-field h-10 rounded-xl border bg-transparent px-2.5 text-xs outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </>
            }
            rowActions={(a) => (
              <Button variant="ghost" size="icon" onClick={() => setQrAsset(a)} title="Lihat QR">
                <QrCode className="h-4 w-4" />
              </Button>
            )}
          />
        </div>
      </Card>

      {/* Form Tambah Aset */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Tambah Aset</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField className="sm:col-span-2" label="Nama Barang" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <FormField label="Nomor Register" value={form.register_number ?? ''} onChange={(e) => setForm({ ...form, register_number: e.target.value })} required />
            <FormField label="Merk / Tipe" value={form.brand_type ?? ''} onChange={(e) => setForm({ ...form, brand_type: e.target.value })} />
            <FormField label="Nomor Seri" value={form.serial_number ?? ''} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
            <FormSelect
              label="Kategori"
              placeholder="Pilih kategori"
              value={form.category_id}
              onValueChange={(v) => setForm({ ...form, category_id: v })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              required
            />
            <FormSelect
              label="Ruangan"
              placeholder="Pilih ruangan"
              value={form.room_id ?? undefined}
              onValueChange={(v) => setForm({ ...form, room_id: v })}
              options={rooms.map((r) => ({ value: r.id, label: r.name }))}
            />
            <FormField label="Tahun Perolehan" type="number" value={form.acquisition_year ?? ''} onChange={(e) => setForm({ ...form, acquisition_year: Number(e.target.value) })} required />
            <FormField label="Nilai Perolehan (Rp)" type="number" value={form.acquisition_value ?? ''} onChange={(e) => setForm({ ...form, acquisition_value: Number(e.target.value) })} required />
            <FormField className="sm:col-span-2" label="Sumber Dana" value={form.funding_source ?? ''} onChange={(e) => setForm({ ...form, funding_source: e.target.value })} hint="Contoh: APBD 2026" />
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
              <div className="rounded-2xl bg-white p-4">
                <QRCodeSVG value={qrAsset.qr_code_value} size={180} />
              </div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{qrAsset.name}</p>
              <p className="font-mono text-xs" style={{ color: 'var(--text-faint)' }}>{qrAsset.asset_code}</p>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5 mr-1" /> Cetak
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
