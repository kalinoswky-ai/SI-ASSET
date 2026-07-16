import { useEffect, useState } from 'react'
import { Moon, Sun, LogOut, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const roleLabel: Record<string, string> = {
  admin: 'Administrator',
  pengurus_barang: 'Pengurus Barang',
  auditor: 'Auditor',
  pimpinan: 'Pimpinan',
}

export function Topbar() {
  const { profile, signOut } = useAuth()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div>
        <p className="text-sm text-muted-foreground">Selamat datang,</p>
        <p className="font-semibold leading-tight">{profile?.full_name ?? 'Pengguna'}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-xs rounded-full bg-secondary px-3 py-1 font-medium">
          {profile ? roleLabel[profile.role] : '-'}
        </span>
        <Button variant="ghost" size="icon" aria-label="Notifikasi">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Ganti tema">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-1" /> Keluar
        </Button>
      </div>
    </header>
  )
}
