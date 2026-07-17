import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-3"
        style={{ background: 'var(--page-bg)', color: 'var(--text-muted)' }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-brand-indigo" />
        <p className="text-sm font-medium">Memuat aplikasi...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
