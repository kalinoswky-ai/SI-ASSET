import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  Boxes,
  ScanLine,
  HandCoins,
  Wrench,
  ArrowLeftRight,
  Trash2,
  FileBarChart,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/master-data', label: 'Master Data', icon: Database },
  { to: '/aset', label: 'Data Aset', icon: Boxes },
  { to: '/inventarisasi', label: 'Inventarisasi', icon: ScanLine },
  { to: '/peminjaman', label: 'Peminjaman', icon: HandCoins },
  { to: '/pemeliharaan', label: 'Pemeliharaan', icon: Wrench },
  { to: '/mutasi', label: 'Mutasi Barang', icon: ArrowLeftRight },
  { to: '/penghapusan', label: 'Penghapusan', icon: Trash2 },
  { to: '/laporan', label: 'Laporan', icon: FileBarChart },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-6 h-16 border-b">
        <Building2 className="h-6 w-6 text-primary" />
        <div>
          <p className="font-bold leading-tight text-sm">SI-ASSET</p>
          <p className="text-[11px] text-muted-foreground leading-tight">Inspektorat Sumba Barat</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
