import { useEffect, useState, type ReactNode } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type CrudTableName = keyof Database['public']['Tables']
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useToast } from '@/components/shared/Toast'

export interface CrudColumn<T> {
  key: keyof T
  label: string
  render?: (row: T) => ReactNode
}

interface CrudTableProps<T extends { id: string }> {
  tableName: CrudTableName
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
  const { toast } = useToast()
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [formValue, setFormValue] = useState<Partial<T>>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false })
    setRows((data ?? []) as unknown as T[])
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
      await supabase.from(tableName).update(formValue as never).eq('id', editing.id)
      toast('Data berhasil diperbarui', 'success')
    } else {
      await supabase.from(tableName).insert(formValue as never)
      toast('Data berhasil ditambahkan', 'success')
    }
    setOpen(false)
    load()
  }

  async function handleDelete(row: T) {
    await supabase.from(tableName).delete().eq('id', row.id)
    toast('Data berhasil dihapus', 'success')
    load()
  }

  const dataColumns: DataTableColumn<T>[] = columns.map((c) => ({
    key: String(c.key),
    label: c.label,
    render: c.render,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Tambah
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable<T>
          columns={dataColumns}
          data={rows}
          loading={loading}
          onRefresh={load}
          exportFileName={String(tableName)}
          emptyTitle="Belum ada data"
          emptyDescription="Klik tombol Tambah untuk menambahkan data baru."
          rowActions={(row) => (
            <div className="flex items-center justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)} title="Hapus">
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          )}
        />
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus data ini?"
        description="Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </Card>
  )
}
