import type { LucideIcon } from 'lucide-react'
import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Crumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  crumbs?: Crumb[]
  actions?: ReactNode
}

export function PageHeader({ title, description, icon: Icon, crumbs, actions }: PageHeaderProps) {
  return (
    <div className="eams-fade-in mb-4 flex flex-col gap-3">
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
        <Link to="/" className="flex items-center gap-1 transition-colors hover:text-brand-indigo">
          <Home className="h-3.5 w-3.5" /> Dashboard
        </Link>
        {(crumbs ?? []).map((c) => (
          <span key={c.label} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {c.to ? (
              <Link to={c.to} className="transition-colors hover:text-brand-indigo">{c.label}</Link>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-indigo text-white shadow-lg shadow-brand-indigo/25">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight md:text-2xl" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
