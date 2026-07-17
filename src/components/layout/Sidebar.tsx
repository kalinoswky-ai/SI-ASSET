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
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import logoSumbaBarat from '@/assets/login/logo-sumba-barat.png'

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

const roleLabel: Record<string, string> = {
  admin: 'Administrator',
  pengurus_barang: 'Pengurus Barang',
  auditor: 'Auditor',
  pimpinan: 'Pimpinan',
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { profile } = useAuth()

  return (
    <aside
      className={cn(
        'relative z-10 m-3 mr-0 hidden flex-col rounded-3xl border shadow-[0_8px_40px_-14px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-[width] duration-300 ease-out md:flex',
        collapsed ? 'w-[76px]' : 'w-[264px]'
      )}
      style={{ background: 'var(--surface)', borderColor: 'var(--surface-border)' }}
    >
      {/* Brand header */}
      <div className={cn('flex h-16 items-center gap-3 border-b px-4', collapsed && 'justify-center px-0')} style={{ borderColor: 'var(--surface-border)' }}>
        <img src={logoSumbaBarat} alt="Logo Kabupaten Sumba Barat" className="h-8 w-auto shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              SI-ASSET
            </p>
            <p className="truncate text-[10.5px] leading-tight" style={{ color: 'var(--text-faint)' }}>
              Inspektorat Sumba Barat
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="eams-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-lg shadow-brand-indigo/25'
                  : 'hover:bg-white/[0.06]'
              )
            }
            style={({ isActive }) => (isActive ? undefined : { color: 'var(--text-muted)' })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-gold shadow-[0_0_10px_rgba(255,213,79,0.7)]" aria-hidden="true" />
                )}
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        className={cn(
          'mx-3 mb-2 flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-medium transition-colors hover:bg-white/[0.06]',
          collapsed && 'mx-auto w-10'
        )}
        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-faint)' }}
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && 'Ciutkan'}
      </button>

      {/* User footer card */}
      <div className={cn('m-3 mt-0 flex items-center gap-3 rounded-2xl border p-3', collapsed && 'justify-center px-0')} style={{ background: 'var(--surface-strong)', borderColor: 'var(--surface-border)' }}>
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-indigo text-xs font-bold text-white">
          {(profile?.full_name ?? 'U').slice(0, 1).toUpperCase()}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-navy bg-emerald-400" aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {profile?.full_name ?? 'Pengguna'}
            </p>
            <p className="truncate text-[10.5px]" style={{ color: 'var(--text-faint)' }}>
              {profile ? roleLabel[profile.role] : '-'}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
