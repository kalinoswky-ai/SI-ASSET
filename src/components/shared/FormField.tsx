import { useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface BaseFieldProps {
  label: string
  error?: string
  hint?: string
  icon?: LucideIcon
  required?: boolean
  className?: string
}

type FloatingInputProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    as?: 'input'
  }

export function FormField({ label, error, hint, icon: Icon, required, className, id, value, type = 'text', ...rest }: FloatingInputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type
  const hasValue = value !== undefined && value !== null && String(value).length > 0

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
        )}
        <input
          id={inputId}
          value={value ?? ''}
          type={resolvedType}
          placeholder=" "
          className={cn(
            'eams-field peer h-12 w-full rounded-xl border bg-transparent pb-1.5 pt-4 text-sm outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
            Icon ? 'pl-9 pr-3' : 'px-3',
            isPassword && 'pr-10',
            error && 'border-red-500/70'
          )}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-3 top-3.5 origin-left text-sm transition-all duration-200',
            'peer-focus:top-1.5 peer-focus:text-[10.5px] peer-focus:text-brand-indigo',
            Icon && 'left-9',
            (hasValue || rest.placeholder) && 'top-1.5 text-[10.5px]'
          )}
          style={{ color: hasValue ? 'var(--text-muted)' : 'var(--text-faint)' }}
        >
          {label}{required && <span className="text-red-400"> *</span>}
        </label>
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-faint)' }}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="eams-fade-in flex items-center gap-1 text-[11px] font-medium text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{hint}</p>
      ) : null}
    </div>
  )
}

type FloatingTextareaProps = BaseFieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>

export function FormTextarea({ label, error, hint, required, className, id, value, ...rest }: FloatingTextareaProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hasValue = value !== undefined && value !== null && String(value).length > 0

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="relative">
        <textarea
          id={inputId}
          value={value ?? ''}
          placeholder=" "
          className={cn(
            'eams-field peer min-h-[90px] w-full rounded-xl border bg-transparent px-3 pb-2 pt-5 text-sm outline-none transition-all duration-200',
            error && 'border-red-500/70'
          )}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-3 top-3.5 origin-left text-sm transition-all duration-200',
            'peer-focus:top-1.5 peer-focus:text-[10.5px] peer-focus:text-brand-indigo',
            hasValue && 'top-1.5 text-[10.5px]'
          )}
          style={{ color: hasValue ? 'var(--text-muted)' : 'var(--text-faint)' }}
        >
          {label}{required && <span className="text-red-400"> *</span>}
        </label>
      </div>
      {error ? (
        <p className="eams-fade-in text-[11px] font-medium text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{hint}</p>
      ) : null}
    </div>
  )
}

interface FormSelectProps {
  label: string
  placeholder?: string
  value?: string
  onValueChange: (v: string) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  className?: string
}

export function FormSelect({ label, placeholder, value, onValueChange, options, error, required, className }: FormSelectProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
        {label}{required && <span className="text-red-400"> *</span>}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(error && 'border-red-500/70')}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="eams-fade-in text-[11px] font-medium text-red-400">{error}</p>}
    </div>
  )
}

export function FormSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      {title && <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{title}</p>}
      {children}
    </div>
  )
}
