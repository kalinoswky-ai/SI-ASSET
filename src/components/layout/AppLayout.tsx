import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden"
      style={{ background: 'var(--page-bg)' }}
    >
      {/* Ambient background wash, matches the login experience */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_10%_0%,rgba(37,99,235,0.16),transparent),radial-gradient(45%_40%_at_100%_100%,rgba(255,213,79,0.08),transparent)]" />
        <div className="motion-safe:animate-float absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-brand-indigo/10 blur-[110px]" />
        <div className="motion-safe:animate-float-slow absolute right-[-5rem] bottom-0 h-72 w-72 rounded-full bg-brand-gold/[0.06] blur-[120px]" />
      </div>

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="eams-scroll flex-1 overflow-y-auto px-3 pb-4 md:px-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
