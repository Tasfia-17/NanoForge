import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Bot, Briefcase, ShoppingBag, ArrowLeftRight, Zap } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agents', icon: Bot, label: 'Agents' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Market' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <header className="sticky top-0 z-50 px-6 py-4" style={{ backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">NanoForge</span>
            <span className="nano-badge">Arc Testnet</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                )}>
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="arc-badge">
              <span className="status-dot active" />
              Arc Live
            </div>
            <div className="usdc-badge">USDC</div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <footer className="px-6 py-4 text-center text-xs" style={{ color: 'rgba(255,255,255,0.15)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        NanoForge · Built on Arc · Circle Nanopayments · USDC Settlement
      </footer>
    </div>
  )
}
