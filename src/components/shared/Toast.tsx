import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantMeta: Record<ToastVariant, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  error: { icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  info: { icon: Info, color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, variant }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }, 3800)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-[100] flex w-full max-w-sm flex-col gap-2 sm:right-4 sm:top-4">
        {items.map((item) => {
          const meta = variantMeta[item.variant]
          const Icon = meta.icon
          return (
            <div
              key={item.id}
              className="eams-card eams-fade-in pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 pr-8 shadow-2xl backdrop-blur-2xl"
              style={{ background: 'var(--page-bg-2)', borderColor: 'var(--surface-border)' }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: meta.bg, color: meta.color }}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-1 text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                {item.message}
              </p>
              <button
                type="button"
                className="absolute right-2.5 top-2.5 rounded-md p-0.5 opacity-60 hover:opacity-100"
                style={{ color: 'var(--text-faint)' }}
                onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
