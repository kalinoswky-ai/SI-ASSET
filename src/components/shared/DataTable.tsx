import { useMemo, useState, type ReactNode } from 'react'
import {
  Search, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  Columns3, Rows3, Download, Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  exportValue?: (row: T) => string | number
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  hideOnMobile?: boolean
  width?: string
}

interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  searchPlaceholder?: string
  searchText?: (row: T) => string
  rowActions?: (row: T) => ReactNode
  toolbarActions?: ReactNode
  onRefresh?: () => void
  emptyTitle?: string
  emptyDescription?: string
  pageSize?: number
  selectable?: boolean
  onBulkDelete?: (ids: string[]) => void
  exportFileName?: string
}

type Density = 'comfortable' | 'compact'

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  searchPlaceholder = 'Cari data...',
  searchText,
  rowActions,
  toolbarActions,
  onRefresh,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data akan muncul di sini setelah ditambahkan.',
  pageSize = 8,
  selectable,
  onBulkDelete,
  exportFileName,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [density, setDensity] = useState<Density>('comfortable')
  const [colMenuOpen, setColMenuOpen] = useState(false)
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key))

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) => (searchText ? searchText(row) : JSON.stringify(row)).toLowerCase().includes(q))
  }, [data, search, searchText])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col) return filtered
    const getVal = col.sortValue ?? ((row: T) => String((row as unknown as Record<string, unknown>)[col.key] ?? ''))
    const copy = [...filtered]
    copy.sort((a, b) => {
      const va = getVal(a)
      const vb = getVal(b)
      if (va === vb) return 0
      const cmp = va > vb ? 1 : -1
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sortKey, sortDir, columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortKey(null)
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === paginated.length ? new Set() : new Set(paginated.map((r) => r.id))))
  }

  async function handleRefresh() {
    if (!onRefresh) return
    setRefreshing(true)
    await onRefresh()
    window.setTimeout(() => setRefreshing(false), 400)
  }

  function exportCsv() {
    const cols = visibleColumns
    const header = cols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',')
    const rows = sorted.map((row) =>
      cols
        .map((c) => {
          const raw = c.exportValue ? c.exportValue(row) : (row as unknown as Record<string, unknown>)[c.key]
          return `"${String(raw ?? '').replace(/"/g, '""')}"`
        })
        .join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFileName ?? 'data'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const padY = density === 'compact' ? 'py-1.5' : 'py-3'

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {toolbarActions}

          <Button variant="outline" size="icon" title="Kepadatan tabel" onClick={() => setDensity((d) => (d === 'comfortable' ? 'compact' : 'comfortable'))}>
            <Rows3 className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button variant="outline" size="icon" title="Tampilkan kolom" onClick={() => setColMenuOpen((v) => !v)}>
              <Columns3 className="h-4 w-4" />
            </Button>
            {colMenuOpen && (
              <div
                className="eams-card eams-fade-in absolute right-0 z-20 mt-2 w-52 rounded-xl border p-2 shadow-2xl backdrop-blur-2xl"
                style={{ background: 'var(--page-bg-2)', borderColor: 'var(--surface-border)' }}
                onMouseLeave={() => setColMenuOpen(false)}
              >
                {columns.map((c) => (
                  <label key={c.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-white/[0.06]" style={{ color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={!hiddenCols.has(c.key)}
                      onChange={() =>
                        setHiddenCols((prev) => {
                          const next = new Set(prev)
                          next.has(c.key) ? next.delete(c.key) : next.add(c.key)
                          return next
                        })
                      }
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {exportFileName && (
            <Button variant="outline" size="icon" title="Ekspor CSV" onClick={exportCsv}>
              <Download className="h-4 w-4" />
            </Button>
          )}

          {onRefresh && (
            <Button variant="outline" size="icon" title="Muat ulang" onClick={handleRefresh}>
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </Button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectable && selected.size > 0 && (
        <div
          className="eams-fade-in mb-2.5 flex items-center justify-between rounded-xl border px-3.5 py-2.5"
          style={{ background: 'var(--surface-strong)', borderColor: 'var(--surface-border)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.size} data dipilih</span>
          <div className="flex items-center gap-2">
            {onBulkDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  onBulkDelete(Array.from(selected))
                  setSelected(new Set())
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Batal</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="eams-scroll overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--surface-border)' }}>
        <table className="w-full min-w-[560px] text-sm">
          <thead
            className="sticky top-0 z-10 backdrop-blur-xl"
            style={{ background: 'var(--surface-strong)' }}
          >
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={paginated.length > 0 && selected.size === paginated.length} onChange={toggleAll} />
                </th>
              )}
              {visibleColumns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'select-none whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide',
                    c.sortable !== false && 'cursor-pointer hover:text-brand-indigo',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.hideOnMobile && 'hidden md:table-cell'
                  )}
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => c.sortable !== false && toggleSort(c.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {c.sortable !== false &&
                      (sortKey === c.key ? (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-30" />
                      ))}
                  </span>
                </th>
              ))}
              {rowActions && <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (rowActions ? 1 : 0) + (selectable ? 1 : 0)} className="p-3">
                  <TableSkeleton cols={visibleColumns.length + (rowActions ? 1 : 0)} />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (rowActions ? 1 : 0) + (selectable ? 1 : 0)}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row.id}
                  className="eams-fade-in border-t transition-colors hover:bg-white/[0.035]"
                  style={{ borderColor: 'var(--surface-border)', animationDelay: `${idx * 25}ms` }}
                >
                  {selectable && (
                    <td className={cn('px-4', padY)}>
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} />
                    </td>
                  )}
                  {visibleColumns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-4',
                        padY,
                        c.align === 'right' && 'text-right',
                        c.align === 'center' && 'text-center',
                        c.hideOnMobile && 'hidden md:table-cell'
                      )}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {c.render ? c.render(row) : String((row as unknown as Record<string, unknown>)[c.key] ?? '-')}
                    </td>
                  ))}
                  {rowActions && <td className={cn('px-4 text-right', padY)}>{rowActions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && sorted.length > 0 && (
        <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs sm:flex-row" style={{ color: 'var(--text-faint)' }}>
          <span>
            Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} dari {sorted.length} data
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{currentPage} / {totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
