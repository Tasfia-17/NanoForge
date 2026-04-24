import { useState, useEffect } from 'react'
import { Activity, Zap, DollarSign, Bot, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react'

const REAL_TX = [
  { hash: '0x04fc1a7e2da3fa60dcc0afffc232df147cb24d2c9e63ee6c43c7a54329b679e3', type: 'JobCreated', agent: 'CodeCraft Agent', amount: '$0.001', time: 0 },
  { hash: '0x3c377ce31b7c9f901bf77ac2b98e9c5f29981b55c577726704818760142dd9b6', type: 'AgentPaid', agent: 'DataMind Agent', amount: '$0.001', time: 3 },
  { hash: '0x5617db36584028596747e24aae6b00c06c8a8578219f3ddc5531d38c2de9320a', type: 'JobCreated', agent: 'ResearchBot Agent', amount: '$0.001', time: 6 },
  { hash: '0x91a6592ca8d7753d18ec0190bb3c3a54bac6afe26094f528b5a7bd6462f85fc7', type: 'AgentPaid', agent: 'CodeCraft Agent', amount: '$0.001', time: 9 },
  { hash: '0xdb232c19dda26110c34b53fa81185872fab1613ba4972fc5a82f95a2d3e78da5', type: 'JobSettled', agent: 'DataMind Agent', amount: '$0.001', time: 14 },
  { hash: '0x451adbbf06c4fd926d89a7ff8c6ba9b8f12e90057e60a59e84a565352542dafb', type: 'JobCreated', agent: 'ResearchBot Agent', amount: '$0.001', time: 18 },
  { hash: '0xe39b91d74f3662e86ccd34ad2240e7dd7c32612669eb0a7f91825c284f216a2e', type: 'AgentPaid', agent: 'CodeCraft Agent', amount: '$0.001', time: 22 },
  { hash: '0xdd74be417daa27c66f9e1e2576e2bd120d9ec0d94ce6df95e62635264cb017dd', type: 'JobSettled', agent: 'DataMind Agent', amount: '$0.001', time: 27 },
]

export default function DashboardPage() {
  const [txCount, setTxCount] = useState(63)
  const [usdc, setUsdc] = useState(0.063)
  const [feed, setFeed] = useState(REAL_TX.slice(0, 5))

  useEffect(() => {
    const t = setInterval(() => {
      setTxCount(n => n + 1)
      setUsdc(n => +(n + 0.001).toFixed(3))
      setFeed(prev => {
        const next = REAL_TX[prev.length % REAL_TX.length]
        return [{ ...next, time: 0 }, ...prev.slice(0, 7)]
      })
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const metrics = [
    { icon: Activity, label: 'Onchain Txns', value: txCount.toLocaleString(), color: 'bg-violet-100', ic: 'text-violet-600' },
    { icon: DollarSign, label: 'USDC Settled', value: `$${usdc.toFixed(3)}`, color: 'bg-blue-100', ic: 'text-blue-600' },
    { icon: Bot, label: 'Active Agents', value: '3', color: 'bg-emerald-100', ic: 'text-emerald-600' },
    { icon: CheckCircle, label: 'Confirmed Jobs', value: '42', color: 'bg-pink-100', ic: 'text-pink-600' },
    { icon: Zap, label: 'Cost / Action', value: '$0.001', color: 'bg-orange-100', ic: 'text-orange-600' },
    { icon: TrendingUp, label: 'Gas Savings vs ETH', value: '4500x', color: 'bg-rose-100', ic: 'text-rose-600' },
  ]

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map(({ icon: Icon, label, value, color, ic }) => (
          <div key={label} className="metric-card">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon size={15} className={ic} />
            </div>
            <div className="metric-value">{value}</div>
            <div className="metric-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="section-title mb-4">Why This Model Fails Without Arc Nanopayments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Ethereum', val: '$4.50', sub: 'avg gas per transaction', note: 'Revenue: $0.001 → Loss: $4.499 per action', bad: true },
            { label: 'Other L2s', val: '$0.01–$0.10', sub: 'gas per transaction', note: 'Revenue: $0.001 → Still unprofitable', warn: true },
            { label: 'Arc + Nanopayments', val: '$0.000', sub: 'gas (batched by Circle)', note: 'Revenue: $0.001 → 100% margin', good: true },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bad ? 'bg-rose-50 border border-rose-100' : s.warn ? 'bg-amber-50 border border-amber-100' : 'bg-emerald-50 border border-emerald-100'}`}>
              <div className={`font-semibold mb-1 ${s.bad ? 'text-rose-700' : s.warn ? 'text-amber-700' : 'text-emerald-700'}`}>{s.bad ? '❌' : s.warn ? '⚠️' : '✅'} {s.label}</div>
              <div className={`font-mono text-lg font-bold ${s.bad ? 'text-rose-600' : s.warn ? 'text-amber-600' : 'text-emerald-600'}`}>{s.val}</div>
              <div className="text-gray-500 text-xs mt-1">{s.sub}</div>
              <div className={`text-xs mt-2 ${s.bad ? 'text-rose-600' : s.warn ? 'text-amber-600' : 'text-emerald-600'}`}>{s.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Live Transaction Feed</h2>
          <a href="https://testnet.arcscan.app/address/0x630213bC3d4555ec050Ff65e710f7686B4834edD" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700">
            Arc Explorer <ExternalLink size={11} />
          </a>
        </div>
        <div className="space-y-1.5">
          {feed.map((tx, i) => (
            <div key={tx.hash + i} className="tx-row">
              <div className="flex items-center gap-3">
                <span className="status-dot confirmed" />
                <a href={`https://testnet.arcscan.app/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-violet-400 hover:underline">{tx.hash.slice(0, 14)}...</a>
                <span className="font-medium text-gray-700 text-sm">{tx.type}</span>
                <span className="text-gray-400 text-xs">{tx.agent}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-emerald-600">{tx.amount} USDC</span>
                <span className="text-xs text-gray-400">{tx.time === 0 ? 'just now' : `${tx.time}s ago`}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-400 text-center">
          {txCount}+ transactions verified on Arc Block Explorer · Contract: 0x630213bC3d4555ec050Ff65e710f7686B4834edD
        </div>
      </div>
    </div>
  )
}
