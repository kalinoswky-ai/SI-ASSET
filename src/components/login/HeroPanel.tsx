import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useCallback } from 'react'
import { Boxes, Radar, ShieldCheck } from 'lucide-react'
import rumahAdatSumba from '@/assets/login/rumah-adat-sumba.jpg'
import logoSumbaBarat from '@/assets/login/logo-sumba-barat.png'

const features = [
  {
    icon: Boxes,
    title: 'Manajemen Aset Terintegrasi',
    desc: 'Seluruh siklus aset tercatat dalam satu sistem, dari pengadaan hingga penghapusan.',
  },
  {
    icon: Radar,
    title: 'Monitoring Real-Time',
    desc: 'Pantau kondisi, lokasi, dan status aset kapan saja secara langsung.',
  },
  {
    icon: ShieldCheck,
    title: 'Keamanan Data Berlapis',
    desc: 'Akses berbasis peran dan enkripsi menjaga data tetap aman dan akuntabel.',
  },
]

export function HeroPanel() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springX = useSpring(mx, { stiffness: 60, damping: 20 })
  const springY = useSpring(my, { stiffness: 60, damping: 20 })
  const imageX = useTransform(springX, [-1, 1], [-10, 10])
  const imageY = useTransform(springY, [-1, 1], [-8, 8])
  const orbX = useTransform(springX, [-1, 1], [12, -12])
  const orbY = useTransform(springY, [-1, 1], [10, -10])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1)
      my.set(((e.clientY - rect.top) / rect.height) * 2 - 1)
    },
    [mx, my],
  )

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative hidden h-full w-full overflow-hidden bg-brand-navy lg:block"
    >
      {/* Photograph with subtle parallax */}
      <motion.div
        style={{ x: imageX, y: imageY }}
        className="absolute inset-[-3%] bg-cover bg-center"
        role="img"
        aria-label="Rumah Adat Sumba saat golden hour"
      >
        <img
          src={rumahAdatSumba}
          alt="Rumah Adat Sumba saat golden hour"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Dark blue readability gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,31,58,0.92)_0%,rgba(11,31,58,0.55)_38%,rgba(11,31,58,0.2)_62%,rgba(11,31,58,0.85)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,31,58,0.35)_0%,transparent_45%)]" />

      {/* Ambient glow reacting to cursor */}
      <motion.div
        style={{ x: orbX, y: orbY }}
        aria-hidden="true"
        className="absolute right-10 top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-[100px] motion-safe:animate-pulse-glow"
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <img
            src={logoSumbaBarat}
            alt="Logo Kabupaten Sumba Barat"
            className="h-14 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
          />
          <div className="h-9 w-px bg-white/25" />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Inspektorat
            <br />
            Kabupaten Sumba Barat
          </span>
        </motion.div>

        {/* Title block */}
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="font-display text-6xl font-extrabold leading-[1.05] tracking-tight xl:text-7xl"
          >
            <span className="bg-gradient-to-r from-brand-gold to-brand-gold-deep bg-clip-text text-transparent">
              SI-ASSET
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="mt-4 font-display text-lg font-semibold text-white/90"
          >
            Sistem Informasi Manajemen Aset
            <br />
            Inspektorat Kabupaten Sumba Barat
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            className="mt-3 max-w-md text-sm leading-relaxed text-white/65"
          >
            Mendukung tata kelola aset daerah yang transparan, akuntabel, dan berbasis digital
            untuk pelayanan publik yang lebih baik.
          </motion.p>

          {/* Feature cards */}
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.12, ease: 'easeOut' }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 shadow-lg shadow-black/10 backdrop-blur-md transition-colors hover:border-brand-gold/40"
              >
                <f.icon className="h-5 w-5 text-brand-gold" aria-hidden="true" />
                <p className="mt-2.5 font-display text-[13px] font-semibold text-white">{f.title}</p>
                <p className="mt-1 text-[12px] leading-snug text-white/60">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} Inspektorat Kabupaten Sumba Barat. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </div>
  )
}
