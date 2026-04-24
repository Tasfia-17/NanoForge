import { useState, useEffect } from 'react'
import { Activity, Zap, DollarSign, Bot, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react'

// Mock live data — replace with real API calls
const useLiveStats = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalUSDCSettled: 0,
    activeAgents: 0,
    confirmedJobs: 0,
    avgCostPerAction: 0.001,
    ethereumEquivalentGas: 4.50,
  })

  useEffect(() => {
    // Simulate live transaction counter
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 3),
        totalUSDCSettled: prev.totalUSDCSettled + Math.random() * 0.003,
      }))
    }, 1500)
    // Seed initial values
    setStats({
      totalTransactions: 127,
      totalUSDCSettled: 0.127,
      activeAgents: 3,
      confirmedJobs: 42,
      avgCostPerAction: 0.001,
      ethereumEquivalentGas: 4.50,
    })
    return () => clearInterval(interval)
  }, [])

  return stats
}

const mockTransactions = [
  { id: '0x1a2b...', type: 'JobPaid', amount: '$0.001', agent: 'Agent #1', status: 'confirmed', time: '2s ago' },
  { id: '0x3c4d...', type: 'SkillExec', amount: '$0.001', agent: 'Agent #1', status: 'confirmed', time: '4s ago' },
  { id: '0x5e6f...', type: 'SkillExec', amount: '$0.001', agent: 'Agent #2', status: 'confirmed', time: '6s ago' },
  { id: '0x7a8b...', type: 'JobSettled', amount: '$0.001', agent: 'Agent #1', status: 'confirmed', time: '12s ago' },
  { id: '0x9c0d...', type: 'YieldAccrued', amount: '$0.0009', agent: 'Agent #1', status: 'confirmed', time: '15s ago' },
  { id: '0xab1c...', type: 'JobPaid', amount: '$0.001', agent: 'Agent #3', status: 'pending', time: '18s ago' },
]

export default function DashboardPage() {
  const stats = useLiveStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live economic activity on Arc</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot active animate-pulse" />
          <span className="text-sm text-gray-500">Live · Arc Testnet</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="metric-card col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Activity size={15} className="text-violet-600" />
            </div>
          </div>
          <div className="metric-value">{stats.totalTransactions.toLocaleString()}</div>
          <div className="metric-label">Onchain Txns</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign size={15} className="text-blue-600" />
            </div>
          </div>
          <div className="metric-value">${stats.totalUSDCSettled.toFixed(3)}</div>
          <div className="metric-label">USDC Settled</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Bot size={15} className="text-emerald-600" />
            </div>
          </div>
          <div className="metric-value">{stats.activeAgents}</div>
          <div className="metric-label">Active Agents</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <CheckCircle size={15} className="text-pink-600" />
            </div>
          </div>
          <div className="metric-value">{stats.confirmedJobs}</div>
          <div className="metric-label">Confirmed Jobs</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Zap size={15} className="text-orange-600" />
            </div>
          </div>
          <div className="metric-value">${stats.avgCostPerAction.toFixed(3)}</div>
          <div className="metric-label">Cost / Action</div>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <TrendingUp size={15} className="text-rose-600" />
            </div>
          </div>
          <div className="metric-value">4500×</div>
          <div className="metric-label">Gas Savings vs ETH</div>
        </div>
      </div>

      {/* Margin explanation */}
      <div className="glass-card p-6">
        <h2 className="section-title mb-4">Why This Model Fails Without Nanopayments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl p-4 bg-rose-50 border border-rose-100">
            <div className="font-semibold text-rose-700 mb-1">❌ Ethereum</div>
            <div className="text-rose-600 font-mono text-lg font-bold">$4.50</div>
            <div className="text-gray-500 text-xs mt-1">avg gas per transaction</div>
            <div className="text-rose-600 text-xs mt-2">Revenue: $0.001 → Loss: $4.499 per action</div>
          </div>
          <div className="rounded-xl p-4 bg-amber-50 border border-amber-100">
            <div className="font-semibold text-amber-700 mb-1">⚠️ Other L2s</div>
            <div className="text-amber-600 font-mono text-lg font-bold">$0.01–$0.10</div>
            <div className="text-gray-500 text-xs mt-1">gas per transaction</div>
            <div className="text-amber-600 text-xs mt-2">Revenue: $0.001 → Still unprofitable</div>
          </div>
          <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100">
            <div className="font-semibold text-emerald-700 mb-1">✅ Arc + Nanopayments</div>
            <div className="text-emerald-600 font-mono text-lg font-bold">$0.000</div>
            <div className="text-gray-500 text-xs mt-1">gas (batched by Circle)</div>
            <div className="text-emerald-600 text-xs mt-2">Revenue: $0.001 → 100% margin</div>
          </div>
        </div>
      </div>

      {/* Live transaction feed */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Live Transaction Feed</h2>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
          >
            Arc Explorer <ExternalLink size={11} />
          </a>
        </div>
        <div className="space-y-1.5">
          {mockTransactions.map((tx) => (
            <div key={tx.id} className="tx-row">
              <div className="flex items-center gap-3">
                <span className={`status-dot ${tx.status === 'confirmed' ? 'confirmed' : 'pending'}`} />
                <span className="font-mono text-xs text-gray-400">{tx.id}</span>
                <span className="font-medium text-gray-700">{tx.type}</span>
                <span className="text-gray-400 text-xs">{tx.agent}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-emerald-600">{tx.amount} USDC</span>
                <span className="text-xs text-gray-400">{tx.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-400 text-center">
          {stats.totalTransactions}+ transactions verified on Arc Block Explorer
        </div>
      </div>
    </div>
  )
}
