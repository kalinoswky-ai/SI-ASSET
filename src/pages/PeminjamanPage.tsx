import { useEffect, useState } from 'react'
import { Plus, Check, X, Undo2, HandCoins } from 'lucide-react'
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
import type { Asset, AssetLoan } from '@/types'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  diajukan: 'warning',
  disetujui: 'success',
  ditolak: 'destructive',
  dikembalikan: 'secondary',
}

const statusText: Record<string, string> = {
  diajukan: 'Diajukan',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
  dikembalikan: 'Dikembalikan',
}

export default function PeminjamanPage() {
  const { profile, hasRole } = useAuth()
  const { toast } = useToast()
  const [loans, setLoans] = useState<AssetLoan[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<AssetLoan>>({})

  async function load() {
    setLoading(true)
    const { data: l } = await supabase
      .from('asset_loans')
      .select('*, asset:assets(*), borrower:profiles!asset_loans_borrower_id_fkey(*)')
      .order('created_at', { ascending: false })
    const { data: a } = await supabase.from('assets').select('*').eq('status', 'aktif')
    setLoans((l ?? []) as unknown as AssetLoan[])
    setAssets((a ?? []) as Asset[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function submitLoan() {
    if (!profile || !form.asset_id || !form.loan_date || !form.expected_return_date || !form.purpose) {
      toast('Lengkapi seluruh kolom wajib terlebih dahulu', 'error')
      return
    }
    const { asset: _asset, borrower: _borrower, ...payload } = form
    await supabase.from('asset_loans').insert({
      ...payload,
      asset_id: form.asset_id,
      loan_date: form.loan_date,
      expected_return_date: form.expected_return_date,
      purpose: form.purpose,
      borrower_id: profile.id,
      status: 'diajukan',
    })
    toast('Pengajuan peminjaman berhasil dikirim', 'success')
    setOpen(false)
    setForm({})
    load()
  }

  async function approve(loan: AssetLoan, approved: boolean) {
    await supabase.from('asset_loans').update({ status: approved ? 'disetujui' : 'ditolak', approved_by: profile?.id }).eq('id', loan.id)
    if (approved) await supabase.from('assets').update({ status: 'dipinjam' }).eq('id', loan.asset_id)
    toast(approved ? 'Peminjaman disetujui' : 'Peminjaman ditolak', approved ? 'success' : 'info')
    load()
  }

  async function returnAsset(loan: AssetLoan) {
    await supabase.from('asset_loans').update({ status: 'dikembalikan', actual_return_date: new Date().toISOString() }).eq('id', loan.id)
    await supabase.from('assets').update({ status: 'aktif' }).eq('id', loan.asset_id)
    toast('Aset berhasil dikembalikan', 'success')
    load()
  }

  const columns: DataTableColumn<AssetLoan>[] = [
    { key: 'asset', label: 'Aset', render: (l) => l.asset?.name ?? '-' },
    { key: 'borrower', label: 'Peminjam', render: (l) => l.borrower?.full_name ?? '-' },
    { key: 'loan_date', label: 'Tgl Pinjam', hideOnMobile: true, render: (l) => formatDate(l.loan_date) },
    { key: 'expected_return_date', label: 'Rencana Kembali', hideOnMobile: true, render: (l) => formatDate(l.expected_return_date) },
    { key: 'status', label: 'Status', render: (l) => <Badge variant={statusVariant[l.status]}>{statusText[l.status] ?? l.status}</Badge> },
  ]

  return (
    <div>
      <PageHeader
        title="Peminjaman Aset"
        description="Pengajuan, persetujuan, dan pengembalian peminjaman barang"
        icon={HandCoins}
        crumbs={[{ label: 'Peminjaman' }]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Ajukan Peminjaman</Button>}
      />

      <Card>
        <div className="p-5 md:p-6">
          <DataTable<AssetLoan>
            columns={columns}
            data={loans}
            loading={loading}
            onRefresh={load}
            exportFileName="peminjaman-aset"
            searchPlaceholder="Cari aset atau peminjam..."
            searchText={(l) => `${l.asset?.name ?? ''} ${l.borrower?.full_name ?? ''}`}
            emptyTitle="Belum ada data peminjaman"
            emptyDescription="Ajukan peminjaman pertama menggunakan tombol di atas."
            rowActions={(l) => (
              <div className="flex items-center justify-end gap-1">
                {l.status === 'diajukan' && hasRole('admin', 'pengurus_barang') && (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => approve(l, true)} title="Setujui"><Check className="h-4 w-4 text-emerald-400" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => approve(l, false)} title="Tolak"><X className="h-4 w-4 text-red-400" /></Button>
                  </>
                )}
                {l.status === 'disetujui' && (
                  <Button size="sm" variant="outline" onClick={() => returnAsset(l)}>
                    <Undo2 className="h-3.5 w-3.5 mr-1" /> Kembalikan
                  </Button>
                )}
              </div>
            )}
          />
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajukan Peminjaman</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <FormSelect
              label="Aset"
              placeholder="Pilih aset yang tersedia"
              value={form.asset_id}
              onValueChange={(v) => setForm({ ...form, asset_id: v })}
              options={assets.map((a) => ({ value: a.id, label: `${a.name} (${a.asset_code})` }))}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tanggal Pinjam" type="date" value={form.loan_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, loan_date: e.target.value })} required />
              <FormField label="Rencana Kembali" type="date" value={form.expected_return_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, expected_return_date: e.target.value })} required />
            </div>
            <FormField label="Tujuan Peminjaman" value={form.purpose ?? ''} onChange={(e) => setForm({ ...form, purpose: e.target.value })} hint="Contoh: Kegiatan audit lapangan" required />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={submitLoan}>Ajukan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
