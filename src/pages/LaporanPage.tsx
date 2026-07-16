import { useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatDate, formatRupiah } from '@/lib/utils'
import type { Asset } from '@/types'

const reportTypes = [
  { key: 'kib', title: 'Kartu Inventaris Barang (KIB)', description: 'Detail lengkap seluruh aset tercatat' },
  { key: 'rekap_kondisi', title: 'Rekap Kondisi Aset', description: 'Ringkasan jumlah aset per kondisi' },
  { key: 'rekap_peminjaman', title: 'Rekap Peminjaman', description: 'Riwayat seluruh transaksi peminjaman' },
  { key: 'rekap_pemeliharaan', title: 'Rekap Pemeliharaan', description: 'Riwayat servis dan biaya pemeliharaan' },
  { key: 'rekap_mutasi', title: 'Rekap Mutasi', description: 'Riwayat perpindahan aset' },
  { key: 'rekap_penghapusan', title: 'Rekap Penghapusan', description: 'Riwayat aset yang dihapuskan' },
]

export default function LaporanPage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  async function fetchData(key: string) {
    switch (key) {
      case 'kib':
        return (await supabase.from('assets').select('*, category:asset_categories(*), room:rooms(*)')).data as Asset[]
      case 'rekap_peminjaman':
        return (await supabase.from('asset_loans').select('*, asset:assets(*), borrower:profiles!asset_loans_borrower_id_fkey(*)')).data
      case 'rekap_pemeliharaan':
        return (await supabase.from('asset_maintenance').select('*, asset:assets(*), vendor:suppliers(*)')).data
      case 'rekap_mutasi':
        return (await supabase.from('asset_mutations').select('*, asset:assets(*)')).data
      case 'rekap_penghapusan':
        return (await supabase.from('asset_disposals').select('*, asset:assets(*)')).data
      case 'rekap_kondisi':
        return (await supabase.from('assets').select('condition')).data
      default:
        return []
    }
  }

  function toRows(key: string, data: any[]): Record<string, any>[] {
    switch (key) {
      case 'kib':
        return data.map((a) => ({
          'Kode Barang': a.asset_code,
          'No. Register': a.register_number,
          'Nama Barang': a.name,
          'Kategori': a.category?.name ?? '-',
          'Ruangan': a.room?.name ?? '-',
          'Tahun': a.acquisition_year,
          'Nilai Perolehan': a.acquisition_value,
          'Kondisi': a.condition,
          'Status': a.status,
        }))
      case 'rekap_kondisi': {
        const counts: Record<string, number> = { baik: 0, rusak_ringan: 0, rusak_berat: 0 }
        data.forEach((d) => counts[d.condition]++)
        return Object.entries(counts).map(([k, v]) => ({ Kondisi: k, 'Jumlah Aset': v }))
      }
      case 'rekap_peminjaman':
        return data.map((l) => ({
          'Aset': l.asset?.name ?? '-',
          'Peminjam': l.borrower?.full_name ?? '-',
          'Tgl Pinjam': formatDate(l.loan_date),
          'Rencana Kembali': formatDate(l.expected_return_date),
          'Tgl Kembali': l.actual_return_date ? formatDate(l.actual_return_date) : '-',
          'Status': l.status,
        }))
      case 'rekap_pemeliharaan':
        return data.map((m) => ({
          'Aset': m.asset?.name ?? '-',
          'Vendor': m.vendor?.name ?? '-',
          'Jadwal': formatDate(m.scheduled_date),
          'Selesai': m.completed_date ? formatDate(m.completed_date) : '-',
          'Biaya': m.cost,
          'Deskripsi': m.description,
        }))
      case 'rekap_mutasi':
        return data.map((m) => ({
          'Aset': m.asset?.name ?? '-',
          'Tanggal': formatDate(m.mutation_date),
          'Alasan': m.reason,
        }))
      case 'rekap_penghapusan':
        return data.map((d) => ({
          'Aset': d.asset?.name ?? '-',
          'Jenis': d.disposal_type,
          'Tanggal': formatDate(d.disposal_date),
          'Alasan': d.reason,
        }))
      default:
        return []
    }
  }

  async function exportExcel(key: string, title: string) {
    setLoadingKey(key + '-xlsx')
    const data = (await fetchData(key)) ?? []
    const rows = toRows(key, data)
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31))
    XLSX.writeFile(wb, `${key}.xlsx`)
    setLoadingKey(null)
  }

  async function exportPdf(key: string, title: string) {
    setLoadingKey(key + '-pdf')
    const data = (await fetchData(key)) ?? []
    const rows = toRows(key, data)
    const doc = new jsPDF()
    doc.setFontSize(12)
    doc.text('INSPEKTORAT KABUPATEN SUMBA BARAT', 14, 15)
    doc.setFontSize(10)
    doc.text(title, 14, 21)
    if (rows.length > 0) {
      autoTable(doc, {
        startY: 26,
        head: [Object.keys(rows[0])],
        body: rows.map((r) => Object.values(r).map((v) => String(v))),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 92, 138] },
      })
    } else {
      doc.text('Tidak ada data.', 14, 30)
    }
    doc.save(`${key}.pdf`)
    setLoadingKey(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-muted-foreground text-sm">Unduh laporan inventaris dalam format Excel atau PDF</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reportTypes.map((r) => (
          <Card key={r.key}>
            <CardHeader>
              <CardTitle className="text-base">{r.title}</CardTitle>
              <CardDescription>{r.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loadingKey === r.key + '-xlsx'}
                onClick={() => exportExcel(r.key, r.title)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={loadingKey === r.key + '-pdf'}
                onClick={() => exportPdf(r.key, r.title)}
              >
                <FileText className="h-4 w-4 mr-1" /> PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
