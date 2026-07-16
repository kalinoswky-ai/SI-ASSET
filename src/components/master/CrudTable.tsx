import { useEffect, useState, type ReactNode } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

export interface CrudColumn<T> {
  key: keyof T
  label: string
  render?: (row: T) => ReactNode
}

interface CrudTableProps<T extends { id: string }> {
  tableName: string
  title: string
  description: string
  columns: CrudColumn<T>[]
  renderForm: (value: Partial<T>, setValue: (v: Partial<T>) => void) => ReactNode
  emptyForm: Partial<T>
}

export function CrudTable<T extends { id: string }>({
  tableName,
  title,
  description,
  columns,
  renderForm,
  emptyForm,
}: CrudTableProps<T>) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [formValue, setFormValue] = useState<Partial<T>>(emptyForm)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false })
    setRows((data ?? []) as T[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName])

  function openCreate() {
    setEditing(null)
    setFormValue(emptyForm)
    setOpen(true)
  }

  function openEdit(row: T) {
    setEditing(row)
    setFormValue(row)
    setOpen(true)
  }

  async function handleSave() {
    if (editing) {
      await supabase.from(tableName).update(formValue).eq('id', editing.id)
    } else {
      await supabase.from(tableName).insert(formValue)
    }
    setOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus data ini?')) return
    await supabase.from(tableName).delete().eq('id', id)
    load()
  }

  const filtered = rows.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Tambah
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari data..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {columns.map((c) => (
                  <th key={String(c.key)} className="px-4 py-2 text-left font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-2 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-muted-foreground">
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-muted-foreground">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t">
                    {columns.map((c) => (
                      <td key={String(c.key)} className="px-4 py-2">
                        {c.render ? c.render(row) : String(row[c.key] ?? '-')}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Data' : 'Tambah Data'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">{renderForm(formValue, setFormValue)}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
