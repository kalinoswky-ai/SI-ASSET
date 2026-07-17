import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="eams-fade-in flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div
        className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: 'var(--surface-strong)', color: 'var(--text-faint)' }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && (
        <p className="max-w-xs text-xs" style={{ color: 'var(--text-faint)' }}>{description}</p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function ErrorState({ title = 'Terjadi kesalahan', description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="eams-fade-in flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && <p className="max-w-xs text-xs" style={{ color: 'var(--text-faint)' }}>{description}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  )
}
