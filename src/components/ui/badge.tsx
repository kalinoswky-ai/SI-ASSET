import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors motion-safe:animate-in motion-safe:fade-in',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gradient-to-r from-brand-blue to-brand-indigo text-white',
        secondary: 'border-[color:var(--surface-border)] bg-[color:var(--surface-strong)] text-[color:var(--text-primary)]',
        destructive: 'border-transparent bg-red-500/15 text-red-400',
        success: 'border-transparent bg-emerald-500/15 text-emerald-400',
        warning: 'border-transparent bg-brand-gold/15 text-brand-gold-deep',
        outline: 'border-[color:var(--surface-border)] text-[color:var(--text-primary)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
