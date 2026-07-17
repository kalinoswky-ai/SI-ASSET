import { useEffect, useState } from 'react'
import { Search, Bell, Sun, Moon, LogOut, Cloud } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const roleLabel: Record<string, string> = {
  admin: 'Administrator',
  pengurus_barang: 'Pengurus Barang',
  auditor: 'Auditor',
  pimpinan: 'Pimpinan',
}

const THEME_KEY = 'si-asset:theme'

export function Topbar() {
  const { profile, signOut } = useAuth()
  const [light, setLight] = useState(() => localStorage.getItem(THEME_KEY) === 'light')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', light)
    localStorage.setItem(THEME_KEY, light ? 'light' : 'dark')
  }, [light])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('global-search')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const timeLabel = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(now)
  const dateLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long' }).format(now)

  return (
    <header
      className="relative z-10 m-3 flex h-16 shrink-0 items-center gap-3 rounded-3xl border px-4 backdrop-blur-2xl md:px-5"
      style={{ background: 'var(--surface)', borderColor: 'var(--surface-border)' }}
    >
      <div className="hidden min-w-0 flex-col leading-tight sm:flex">
        <p className="truncate text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Selamat datang,
        </p>
        <p className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {profile?.full_name ?? 'Pengguna'}
        </p>
      </div>

      <div className="relative mx-auto flex w-full max-w-md items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4" style={{ color: 'var(--text-faint)' }} />
        <input
          id="global-search"
          type="search"
          placeholder="Cari aset, lokasi, kategori, atau QR Code..."
          className="w-full rounded-xl border bg-transparent py-2 pl-9 pr-14 text-sm outline-none transition-colors focus:border-brand-indigo/60"
          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-primary)' }}
        />
        <kbd
          className="absolute right-2 hidden rounded-md border px-1.5 py-0.5 text-[10px] font-medium sm:block"
          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-faint)' }}
        >
          Ctrl+K
        </kbd>
      </div>

      <div className="hidden items-center gap-1.5 whitespace-nowrap text-xs lg:flex" style={{ color: 'var(--text-muted)' }}>
        <Cloud className="h-4 w-4" />
        <span>{dateLabel}</span>
      </div>
      <div className="hidden font-display text-sm font-semibold tabular-nums xl:block" style={{ color: 'var(--text-primary)' }}>
        {timeLabel}
      </div>

      <span
        className="hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline"
        style={{ background: 'var(--surface-strong)', color: 'var(--text-primary)' }}
      >
        {profile ? roleLabel[profile.role] : '-'}
      </span>

      <button
        type="button"
        aria-label="Notifikasi"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]"
        style={{ color: 'var(--text-muted)' }}
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(255,213,79,0.8)]" />
      </button>

      <button
        type="button"
        onClick={() => setLight((v) => !v)}
        aria-label="Ganti tema"
        className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]"
        style={{ color: 'var(--text-muted)' }}
      >
        {light ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
      </button>

      <button
        type="button"
        onClick={signOut}
        className="flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors hover:bg-white/[0.06]"
        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-primary)' }}
      >
        <LogOut className="h-[15px] w-[15px]" />
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </header>
  )
}
