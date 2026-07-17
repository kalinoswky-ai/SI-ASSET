import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'eams-ripple relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-brand-blue to-brand-indigo text-white shadow-lg shadow-brand-indigo/25 hover:shadow-brand-indigo/40 hover:brightness-110',
        destructive:
          'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 hover:brightness-110',
        outline:
          'border bg-transparent hover:bg-white/[0.06] eams-outline-btn',
        secondary:
          'border eams-secondary-btn hover:bg-white/[0.08]',
        ghost: 'hover:bg-white/[0.06] eams-ghost-btn',
        link: 'text-brand-indigo underline-offset-4 hover:underline',
        gold: 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-navy shadow-lg shadow-brand-gold/25 hover:brightness-105',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-[13px]',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10 shrink-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      if (!asChild) {
        const btn = e.currentTarget
        const rect = btn.getBoundingClientRect()
        const ripple = document.createElement('span')
        const size = Math.max(rect.width, rect.height)
        ripple.style.width = ripple.style.height = `${size}px`
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`
        ripple.className = 'eams-ripple-dot'
        btn.appendChild(ripple)
        window.setTimeout(() => ripple.remove(), 600)
      }
      onClick?.(e)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
