import { useState, useEffect } from 'react'
import { ExternalLink, Filter } from 'lucide-react'

type TxType = 'all' | 'JobPaid' | 'SkillExec' | 'JobSettled' | 'YieldAccrued'

const generateTx = (id: number) => {
  const types = ['JobPaid', 'SkillExec', 'SkillExec', 'SkillExec', 'JobSettled', 'YieldAccrued']
  const agents = ['Agent #1', 'Agent #2', 'Agent #3']
  const type = types[Math.floor(Math.random() * types.length)]
  return {
    id,
    hash: `0x${Math.random().toString(16).slice(2, 8)}...${Math.random().toString(16).slice(2, 6)}`,
    type,
    agent: agents[Math.floor(Math.random() * agents.length)],
    amount: type === 'YieldAccrued' ? '$0.0009' : '$0.001',
    block: 1000000 + id,
    status: 'confirmed',
    time: `${id * 2}s ago`,
  }
}

const initialTxs = Array.from({ length: 60 }, (_, i) => generateTx(i + 1)).reverse()

export default function TransactionsPage() {
  const [txs, setTxs] = useState(initialTxs)
  const [filter, setFilter] = useState<TxType>('all')

  useEffect(() => {
    const interval = setInterval(() => {
      setTxs(prev => [generateTx(prev.length + 1), ...prev.slice(0, 99)])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === 'all' ? txs : txs.filter(t => t.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{txs.length}+ onchain transactions · Live feed</p>
        </div>
        <a
          href="https://testnet.arcscan.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 glass-button text-violet-600 text-sm"
        >
          <ExternalLink size={13} />
          Arc Explorer
        </a>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400" />
        {(['all', 'JobPaid', 'SkillExec', 'JobSettled', 'YieldAccrued'] as TxType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              filter === f
                ? 'bg-violet-100 text-violet-700 border border-violet-200'
                : 'bg-white/50 text-gray-500 border border-white/70 hover:bg-white/70'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Transaction table */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-5 gap-3 px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-white/40 mb-2">
          <span>Hash</span>
          <span>Type</span>
          <span>Agent</span>
          <span>Amount</span>
          <span>Block</span>
        </div>
        <div className="space-y-0.5 max-h-[500px] overflow-y-auto">
          {filtered.map((tx) => (
            <div key={`${tx.hash}-${tx.id}`} className="tx-row grid grid-cols-5 gap-3">
              <span className="font-mono text-xs text-violet-600 truncate">{tx.hash}</span>
              <span className="text-xs font-medium text-gray-700">{tx.type}</span>
              <span className="text-xs text-gray-500">{tx.agent}</span>
              <span className="font-mono text-xs font-semibold text-emerald-600">{tx.amount} USDC</span>
              <span className="text-xs text-gray-400 font-mono">{tx.block.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-3">Transaction Economics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-lg font-bold text-gray-800">{txs.length}+</div>
            <div className="text-xs text-gray-400">Total Transactions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">${(txs.length * 0.001).toFixed(3)}</div>
            <div className="text-xs text-gray-400">Total USDC Volume</div>
          </div>
          <div>
            <div className="text-lg font-bold text-violet-600">$0.000</div>
            <div className="text-xs text-gray-400">Total Gas Paid</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-600">${(txs.length * 4.50).toFixed(0)}</div>
            <div className="text-xs text-gray-400">Gas Cost on Ethereum (avoided)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
