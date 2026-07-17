import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AnimatedBackdrop } from '@/components/login/AnimatedBackdrop'
import { HeroPanel } from '@/components/login/HeroPanel'
import { FloatingInput } from '@/components/login/FloatingInput'
import logoSumbaBarat from '@/assets/login/logo-sumba-barat.png'

const EMAIL_STORAGE_KEY = 'si-asset:remembered-email'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(EMAIL_STORAGE_KEY)
    if (saved) {
      setEmail(saved)
      setRememberMe(true)
    }
  }, [])

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (rememberMe) localStorage.setItem(EMAIL_STORAGE_KEY, email)
    else localStorage.removeItem(EMAIL_STORAGE_KEY)

    const { error } = await signIn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  const emailValid = emailPattern.test(email)

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative flex min-h-screen w-full overflow-hidden bg-brand-navy font-sans">
      <HeroPanel />

      {/* Right side: floating glass login card */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-brand-navy-deep p-4 sm:p-8">
        <AnimatedBackdrop />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-[420px] rounded-[22px] border border-white/15 bg-white/[0.08] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-[24px] sm:p-9"
        >
          {/* Logo, glowing */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <div className="motion-safe:animate-pulse-glow absolute inset-0 rounded-full" />
              <img src={logoSumbaBarat} alt="Logo Kabupaten Sumba Barat" className="h-12 w-auto" />
            </div>

            <h1 className="mt-5 font-display text-2xl font-bold text-white">SI-ASSET</h1>
            <p className="mt-1 text-[13px] leading-relaxed text-white/60">
              Sistem Informasi Manajemen Aset
              <br />
              Inspektorat Kabupaten Sumba Barat
            </p>

            <div className="relative mt-5 h-px w-24 overflow-hidden rounded-full bg-white/15">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-brand-gold to-transparent motion-safe:animate-shimmer" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <FloatingInput
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-[18px] w-[18px]" />}
                placeholder="nama@sumbabaratkab.go.id"
                trailingAction={
                  <AnimatePresence>
                    {emailValid && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <CheckCircle2 className="h-[18px] w-[18px] text-emerald-400" aria-hidden="true" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
            >
              <FloatingInput
                label="Kata Sandi"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-[18px] w-[18px]" />}
                trailingAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    aria-pressed={showPassword}
                    className="rounded text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy-deep"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showPassword ? (
                        <motion.span
                          key="eye-off"
                          initial={{ opacity: 0, rotate: -20 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 20 }}
                          transition={{ duration: 0.15 }}
                          className="block"
                        >
                          <EyeOff className="h-[18px] w-[18px]" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="eye"
                          initial={{ opacity: 0, rotate: 20 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -20 }}
                          transition={{ duration: 0.15 }}
                          className="block"
                        >
                          <Eye className="h-[18px] w-[18px]" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.29 }}
              className="flex items-center justify-between pt-1 text-[13px]"
            >
              <label className="flex select-none items-center gap-2 text-white/65">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-white/10 text-brand-indigo accent-brand-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
                />
                Ingat saya
              </label>

              <button
                type="button"
                onClick={() => setForgotOpen((v) => !v)}
                aria-expanded={forgotOpen}
                className="rounded font-medium text-white/70 underline-offset-2 transition-colors hover:text-brand-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
              >
                Lupa kata sandi?
              </button>
            </motion.div>

            <AnimatePresence>
              {forgotOpen && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60"
                >
                  Hubungi administrator sistem di Inspektorat untuk mengatur ulang kata sandi Anda.
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-[13px] text-red-200"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.36 }}
              className="relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-brand-blue via-brand-indigo to-brand-blue bg-[length:200%_auto] py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-brand-indigo/30 transition-[background-position,box-shadow] duration-500 hover:bg-right hover:shadow-brand-indigo/50 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy-deep"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-[20deg] bg-white/25 motion-safe:animate-shimmer"
              />
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Memproses...
                </span>
              ) : (
                'Masuk'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
    </MotionConfig>
  )
}
