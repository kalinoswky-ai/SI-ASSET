import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  icon: ReactNode
  trailingAction?: ReactNode
  error?: string
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, icon, trailingAction, error, id, value, onFocus, onBlur, ...props }, ref) => {
    const autoId = useId()
    const inputId = id ?? autoId
    const [focused, setFocused] = useState(false)
    const hasValue = typeof value === 'string' ? value.length > 0 : Boolean(value)
    const floated = focused || hasValue

    return (
      <div className="w-full">
        <div
          className={`group relative flex items-center rounded-2xl border bg-white/10 backdrop-blur-md transition-all duration-300 ${
            error
              ? 'border-red-400/70 shadow-[0_0_0_3px_rgba(248,113,113,0.15)]'
              : focused
                ? 'border-brand-indigo/70 shadow-[0_0_0_4px_rgba(37,99,235,0.22)]'
                : 'border-white/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]'
          }`}
        >
          <span
            className={`pointer-events-none absolute left-4 transition-colors duration-300 ${
              focused ? 'text-brand-indigo' : 'text-white/50'
            }`}
            aria-hidden="true"
          >
            {icon}
          </span>

          <input
            ref={ref}
            id={inputId}
            value={value}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="peer w-full bg-transparent py-4 pl-11 pr-11 text-[15px] text-white placeholder-transparent outline-none"
            placeholder={label}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={`pointer-events-none absolute left-11 transition-all duration-200 ${
              floated
                ? '-top-2.5 left-3 rounded bg-brand-navy-deep/80 px-1.5 text-[11px] font-medium text-brand-gold'
                : 'top-1/2 -translate-y-1/2 text-[15px] text-white/55'
            }`}
          >
            {label}
          </label>

          {trailingAction && <span className="absolute right-3">{trailingAction}</span>}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 pl-1 text-xs font-medium text-red-300">
            {error}
          </p>
        )}
      </div>
    )
  },
)

FloatingInput.displayName = 'FloatingInput'
