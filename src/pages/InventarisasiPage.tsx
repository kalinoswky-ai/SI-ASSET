import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { ScanLine, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import type { Asset, InventoryCheck } from '@/types'

export default function InventarisasiPage() {
  const { profile } = useAuth()
  const [scanning, setScanning] = useState(false)
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [locationMatched, setLocationMatched] = useState(true)
  const [condition, setCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat'>('baik')
  const [notes, setNotes] = useState('')
  const [history, setHistory] = useState<InventoryCheck[]>([])
  const scannerRef = useRef<Html5Qrcode | null>(null)

  async function loadHistory() {
    const { data } = await supabase
      .from('inventory_checks')
      .select('*, asset:assets(*)')
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory((data ?? []) as InventoryCheck[])
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
    setFoundAsset(null)
    setNotes('')
    loadHistory()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Inventarisasi Aset</h1>
        <p className="text-muted-foreground text-sm">Pindai QR Code aset untuk memperbarui kondisi dan validasi lokasi</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ScanLine className="h-4 w-4" /> Pindai QR Code</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div id="qr-reader" className="rounded-md overflow-hidden bg-secondary/40 min-h-[220px] flex items-center justify-center">
              {!scanning && <p className="text-sm text-muted-foreground p-6 text-center">Kamera belum aktif</p>}
            </div>
            {!scanning ? (
              <Button className="w-full" onClick={startScan}>Mulai Pindai</Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={stopScan}>Hentikan Pindai</Button>
            )}
            {notFound && <p className="text-sm text-destructive">Aset dengan kode QR tersebut tidak ditemukan.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Hasil Pemeriksaan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {!foundAsset ? (
              <p className="text-sm text-muted-foreground">Pindai aset terlebih dahulu untuk memulai pemeriksaan.</p>
            ) : (
              <>
                <div className="rounded-md bg-secondary/40 p-3">
                  <p className="font-medium">{foundAsset.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{foundAsset.asset_code}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Kondisi Ditemukan</Label>
                  <Select value={condition} onValueChange={(v) => setCondition(v as typeof condition)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baik">Baik</SelectItem>
                      <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                      <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Lokasi Sesuai Catatan?</Label>
                  <Select value={locationMatched ? 'ya' : 'tidak'} onValueChange={(v) => setLocationMatched(v === 'ya')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ya">Ya, sesuai</SelectItem>
                      <SelectItem value="tidak">Tidak sesuai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Catatan Pemeriksaan</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opsional" />
                </div>
                <Button className="w-full" onClick={submitCheck}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Simpan Hasil Pemeriksaan
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Riwayat Inventarisasi Terbaru</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Tanggal</th>
                  <th className="px-4 py-2 text-left font-medium">Aset</th>
                  <th className="px-4 py-2 text-left font-medium">Kondisi</th>
                  <th className="px-4 py-2 text-left font-medium">Lokasi Sesuai</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Belum ada riwayat.</td></tr>
                ) : history.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="px-4 py-2">{formatDate(h.check_date)}</td>
                    <td className="px-4 py-2">{h.asset?.name ?? '-'}</td>
                    <td className="px-4 py-2">{h.condition_found}</td>
                    <td className="px-4 py-2">{h.location_matched ? 'Ya' : 'Tidak'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
