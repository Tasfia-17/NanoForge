import { Outlet, NavLink, useLocation } from 'react-router-dom'
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
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 px-6 py-3">
        <div className="glass-card px-5 py-3 flex items-center justify-between max-w-7xl mx-auto">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #8b5cf6, #6366f1)'}}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg tracking-tight">NanoForge</span>
            <span className="nano-badge">Arc Testnet</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'
                )}
              >
                <Icon size={15} />
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

      {/* Main content */}
      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-400">
        NanoForge · Built on Arc · Powered by Circle Nanopayments · USDC Settlement
      </footer>
    </div>
  )
}
