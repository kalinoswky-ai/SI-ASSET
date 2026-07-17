import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { ScanLine, CheckCircle2, XCircle, History } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { FormField, FormSelect } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/Toast'
import { formatDate } from '@/lib/utils'
import type { Asset, InventoryCheck } from '@/types'

export default function InventarisasiPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [scanning, setScanning] = useState(false)
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [locationMatched, setLocationMatched] = useState(true)
  const [condition, setCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat'>('baik')
  const [notes, setNotes] = useState('')
  const [history, setHistory] = useState<InventoryCheck[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  async function loadHistory() {
    setLoadingHistory(true)
    const { data } = await supabase
      .from('inventory_checks')
      .select('*, asset:assets(*)')
      .order('created_at', { ascending: false })
      .limit(20)
    setHistory((data ?? []) as InventoryCheck[])
    setLoadingHistory(false)
  }

  useEffect(() => {
    loadHistory()
    return () => {
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  async function handleScanResult(qrValue: string) {
    await scannerRef.current?.stop()
    setScanning(false)
    const { data } = await supabase.from('assets').select('*').eq('qr_code_value', qrValue).maybeSingle()
    if (data) {
      setFoundAsset(data as Asset)
      setCondition((data as Asset).condition)
      setNotFound(false)
    } else {
      setNotFound(true)
      setFoundAsset(null)
    }
  }

  async function startScan() {
    setFoundAsset(null)
    setNotFound(false)
    setScanning(true)
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 220 },
        (decodedText) => handleScanResult(decodedText),
        undefined
      )
    } catch {
      setScanning(false)
    }
  }

  async function stopScan() {
    await scannerRef.current?.stop().catch(() => {})
    setScanning(false)
  }

  async function submitCheck() {
    if (!foundAsset || !profile) return
    await supabase.from('inventory_checks').insert({
      asset_id: foundAsset.id,
      checked_by: profile.id,
      check_date: new Date().toISOString(),
      location_matched: locationMatched,
      condition_found: condition,
      notes,
    })
    await supabase.from('assets').update({ condition }).eq('id', foundAsset.id)
    toast('Hasil pemeriksaan berhasil disimpan', 'success')
    setFoundAsset(null)
    setNotes('')
    loadHistory()
  }

  const columns: DataTableColumn<InventoryCheck>[] = [
    { key: 'check_date', label: 'Tanggal', render: (h) => formatDate(h.check_date) },
    { key: 'asset', label: 'Aset', render: (h) => h.asset?.name ?? '-' },
    { key: 'condition_found', label: 'Kondisi', hideOnMobile: true },
    {
      key: 'location_matched',
      label: 'Lokasi Sesuai',
      render: (h) => (h.location_matched ? <span className="text-emerald-400">Ya</span> : <span className="text-red-400">Tidak</span>),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Inventarisasi Aset"
        description="Pindai QR Code aset untuk memperbarui kondisi dan validasi lokasi"
        icon={ScanLine}
        crumbs={[{ label: 'Inventarisasi' }]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ScanLine className="h-4 w-4 text-brand-indigo" /> Pindai QR Code</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div
              id="qr-reader"
              className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border"
              style={{ background: 'var(--surface-strong)', borderColor: 'var(--surface-border)' }}
            >
              {!scanning && <p className="p-6 text-center text-sm" style={{ color: 'var(--text-faint)' }}>Kamera belum aktif</p>}
            </div>
            {!scanning ? (
              <Button className="w-full" onClick={startScan}>Mulai Pindai</Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={stopScan}>Hentikan Pindai</Button>
            )}
            {notFound && (
              <p className="eams-fade-in flex items-center gap-1.5 text-sm text-red-400">
                <XCircle className="h-4 w-4" /> Aset dengan kode QR tersebut tidak ditemukan.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hasil Pemeriksaan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {!foundAsset ? (
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Pindai aset terlebih dahulu untuk memulai pemeriksaan.</p>
            ) : (
              <>
                <div className="eams-fade-in rounded-2xl border p-3.5" style={{ background: 'var(--surface-strong)', borderColor: 'var(--surface-border)' }}>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{foundAsset.name}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--text-faint)' }}>{foundAsset.asset_code}</p>
                </div>
                <FormSelect
                  label="Kondisi Ditemukan"
                  value={condition}
                  onValueChange={(v) => setCondition(v as typeof condition)}
                  options={[
                    { value: 'baik', label: 'Baik' },
                    { value: 'rusak_ringan', label: 'Rusak Ringan' },
                    { value: 'rusak_berat', label: 'Rusak Berat' },
                  ]}
                />
                <FormSelect
                  label="Lokasi Sesuai Catatan?"
                  value={locationMatched ? 'ya' : 'tidak'}
                  onValueChange={(v) => setLocationMatched(v === 'ya')}
                  options={[
                    { value: 'ya', label: 'Ya, sesuai' },
                    { value: 'tidak', label: 'Tidak sesuai' },
                  ]}
                />
                <FormField label="Catatan Pemeriksaan" value={notes} onChange={(e) => setNotes(e.target.value)} hint="Opsional" />
                <Button className="w-full" onClick={submitCheck}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Simpan Hasil Pemeriksaan
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4 w-4 text-brand-indigo" /> Riwayat Inventarisasi Terbaru</CardTitle></CardHeader>
        <CardContent>
          <DataTable<InventoryCheck>
            columns={columns}
            data={history}
            loading={loadingHistory}
            onRefresh={loadHistory}
            exportFileName="riwayat-inventarisasi"
            searchPlaceholder="Cari aset..."
            searchText={(h) => h.asset?.name ?? ''}
            emptyTitle="Belum ada riwayat"
            emptyDescription="Riwayat pemeriksaan akan muncul di sini."
          />
        </CardContent>
      </Card>
    </div>
  )
}
