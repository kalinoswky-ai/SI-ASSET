import { useEffect, useState } from 'react'
import { Plus, Check, X, Undo2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import type { Asset, AssetLoan } from '@/types'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  diajukan: 'warning',
  disetujui: 'success',
  ditolak: 'destructive',
  dikembalikan: 'secondary',
}

export default function PeminjamanPage() {
  const { profile, hasRole } = useAuth()
  const [loans, setLoans] = useState<AssetLoan[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<AssetLoan>>({})

  async function load() {
    const { data: l } = await supabase
      .from('asset_loans')
      .select('*, asset:assets(*), borrower:profiles!asset_loans_borrower_id_fkey(*)')
      .order('created_at', { ascending: false })
    const { data: a } = await supabase.from('assets').select('*').eq('status', 'aktif')
    setLoans((l ?? []) as unknown as AssetLoan[])
    setAssets((a ?? []) as Asset[])
  }

  useEffect(() => {
    load()
  }, [])

  async function submitLoan() {
    if (!profile || !form.asset_id || !form.loan_date || !form.expected_return_date || !form.purpose) return
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
    setOpen(false)
    setForm({})
    load()
  }

  async function approve(loan: AssetLoan, approved: boolean) {
    await supabase.from('asset_loans').update({ status: approved ? 'disetujui' : 'ditolak', approved_by: profile?.id }).eq('id', loan.id)
    if (approved) await supabase.from('assets').update({ status: 'dipinjam' }).eq('id', loan.asset_id)
    load()
  }

  async function returnAsset(loan: AssetLoan) {
    await supabase.from('asset_loans').update({ status: 'dikembalikan', actual_return_date: new Date().toISOString() }).eq('id', loan.id)
    await supabase.from('assets').update({ status: 'aktif' }).eq('id', loan.asset_id)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Peminjaman Aset</h1>
          <p className="text-muted-foreground text-sm">Pengajuan, persetujuan, dan pengembalian peminjaman barang</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Ajukan Peminjaman</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Aset</th>
                  <th className="px-4 py-2 text-left font-medium">Peminjam</th>
                  <th className="px-4 py-2 text-left font-medium">Tgl Pinjam</th>
                  <th className="px-4 py-2 text-left font-medium">Rencana Kembali</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Belum ada data peminjaman.</td></tr>
                ) : loans.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-2">{l.asset?.name ?? '-'}</td>
                    <td className="px-4 py-2">{l.borrower?.full_name ?? '-'}</td>
                    <td className="px-4 py-2">{formatDate(l.loan_date)}</td>
                    <td className="px-4 py-2">{formatDate(l.expected_return_date)}</td>
                    <td className="px-4 py-2"><Badge variant={statusVariant[l.status]}>{l.status}</Badge></td>
                    <td className="px-4 py-2 text-right space-x-1">
                      {l.status === 'diajukan' && hasRole('admin', 'pengurus_barang') && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => approve(l, true)}><Check className="h-4 w-4 text-emerald-600" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => approve(l, false)}><X className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
                      {l.status === 'disetujui' && (
                        <Button size="sm" variant="outline" onClick={() => returnAsset(l)}>
                          <Undo2 className="h-4 w-4 mr-1" /> Kembalikan
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
          <DialogHeader><DialogTitle>Ajukan Peminjaman</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Aset</Label>
              <Select value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih aset yang tersedia" /></SelectTrigger>
                <SelectContent>
                  {assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.asset_code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tanggal Pinjam</Label>
                <Input type="date" value={form.loan_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, loan_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Rencana Kembali</Label>
                <Input type="date" value={form.expected_return_date?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, expected_return_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tujuan Peminjaman</Label>
              <Input value={form.purpose ?? ''} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Contoh: Kegiatan audit lapangan" />
            </div>
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
