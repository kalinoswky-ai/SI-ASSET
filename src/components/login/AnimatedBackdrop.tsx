import { useMemo } from 'react'

/**
 * Purely decorative, ambient background layer used behind the login experience.
 * Built with CSS transforms/opacity only (no canvas/particle engine) so it stays
 * cheap to render and respects prefers-reduced-motion via the `motion-safe` variant.
 */
export function AnimatedBackdrop() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        top: Math.round(Math.random() * 100),
        size: 2 + Math.round(Math.random() * 3),
        delay: Math.round(Math.random() * 6000) / 1000,
        duration: 6 + Math.round(Math.random() * 6),
      })),
    [],
  )

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradient mesh wash */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_10%,rgba(37,99,235,0.25),transparent),radial-gradient(50%_45%_at_85%_85%,rgba(255,213,79,0.12),transparent)]" />

      {/* Soft glowing orbs */}
      <div className="motion-safe:animate-float absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-brand-indigo/20 blur-[90px]" />
      <div className="motion-safe:animate-float-slow absolute right-[-4rem] top-10 h-64 w-64 rounded-full bg-brand-gold/10 blur-[100px]" />
      <div className="motion-safe:animate-float absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-brand-blue/25 blur-[90px] [animation-delay:2s]" />

      {/* Light beams */}
      <div className="absolute inset-0 opacity-30 [background:linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.06)_45%,transparent_55%)] motion-safe:animate-gradient-x [background-size:200%_200%]" />

      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="motion-safe:animate-float absolute rounded-full bg-white/40"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Bottom animated wave */}
      <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden opacity-40">
        <svg
          className="motion-safe:animate-wave absolute bottom-0 h-40 w-[200%]"
          viewBox="0 0 2400 200"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 C300,180 600,20 900,100 C1200,180 1500,20 1800,100 C2000,150 2200,120 2400,100 L2400,200 L0,200 Z"
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFD54F" stopOpacity="0.12" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
