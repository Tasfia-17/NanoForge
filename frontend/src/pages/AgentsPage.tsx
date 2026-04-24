import { useState } from 'react'
import { Bot, Zap, TrendingUp, ExternalLink, Copy, Check } from 'lucide-react'

const AGENTS = [
  {
    id: 1, name: 'CodeCraft Agent', emoji: '💻',
    description: 'Full-stack code generation, debugging, and refactoring. Specializes in Python, TypeScript, and Solidity.',
    skills: ['code-gen', 'debug', 'refactor', 'test-write'],
    pricePerAction: 0.001, totalJobs: 89, successRate: 97, yieldEarned: 0.0801,
    walletId: 'b87f241d-c88c-5090-9aa3-e5ed1bfea3b6',
    walletAddress: '0x901ac6e61c8d01882c8073e062be6d22b9d255f5',
    color: 'bg-pastel-lavender', iconColor: 'text-violet-600',
  },
  {
    id: 2, name: 'DataMind Agent', emoji: '📊',
    description: 'Data analysis, visualization, and insight generation. Handles CSV, JSON, and API data sources.',
    skills: ['data-analysis', 'visualization', 'reporting'],
    pricePerAction: 0.001, totalJobs: 54, successRate: 94, yieldEarned: 0.0486,
    walletId: 'ad224812-70e3-51dc-a1b6-99ad5cc83fa6',
    walletAddress: '0x38cd3de92ade99e9dce2384ea8cc6d0fd7ba0825',
    color: 'bg-pastel-sky', iconColor: 'text-blue-600',
  },
  {
    id: 3, name: 'ResearchBot Agent', emoji: '🔍',
    description: 'Web research, summarization, and fact verification across multiple sources.',
    skills: ['research', 'summarize', 'verify', 'web-search'],
    pricePerAction: 0.001, totalJobs: 41, successRate: 96, yieldEarned: 0.0369,
    walletId: '1e739142-ce32-52e6-9f3f-9900ac2d6abf',
    walletAddress: '0xe052a4ca82251179a95b54e1f1896348bb914bbb',
    color: 'bg-pastel-mint', iconColor: 'text-emerald-600',
  },
]

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="text-gray-300 hover:text-violet-400 transition-colors">
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  )
}

export default function AgentsPage() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">AI Agents</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hosted agents with Circle Developer-Controlled Wallets on Arc · $0.001 USDC per action</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AGENTS.map(agent => (
          <div key={agent.id}
            className={`glass-card-hover p-5 cursor-pointer ${selected === agent.id ? 'ring-2 ring-violet-300' : ''}`}
            onClick={() => setSelected(selected === agent.id ? null : agent.id)}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${agent.color} flex items-center justify-center text-xl`}>
                {agent.emoji}
              </div>
              <div className="arc-badge"><span className="status-dot active" />Active</div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{agent.name}</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{agent.description}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {agent.skills.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-gray-600 border border-white/80">{s}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div><div className="text-sm font-bold text-gray-800">{agent.totalJobs}</div><div className="text-xs text-gray-400">Jobs</div></div>
              <div><div className="text-sm font-bold text-emerald-600">{agent.successRate}%</div><div className="text-xs text-gray-400">Success</div></div>
              <div><div className="text-sm font-bold text-violet-600">${agent.yieldEarned.toFixed(4)}</div><div className="text-xs text-gray-400">Yield</div></div>
            </div>

            {/* Circle wallet */}
            <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
              <div className="text-xs font-bold text-violet-500 mb-2">Circle Developer Wallet · Arc</div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs text-gray-600 truncate">{agent.walletAddress.slice(0, 20)}...</span>
                <div className="flex items-center gap-1">
                  <CopyBtn text={agent.walletAddress} />
                  <a href={`https://testnet.arcscan.app/address/${agent.walletAddress}`} target="_blank" rel="noopener noreferrer"
                    className="text-gray-300 hover:text-violet-400"><ExternalLink size={12} /></a>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/50 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap size={11} className="text-violet-500" />$0.001 USDC / action
              </div>
              <span className="text-xs text-gray-400 font-mono">NFT #{agent.id}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-violet-600" />
          <h2 className="section-title">Agent NFT Yield Model</h2>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Each agent is represented as an NFT on Arc. When a buyer confirms a job delivery, 90% of the USDC payment
          flows to the agent owner as claimable NFG yield. Transfer guards prevent selling an agent with unsettled revenue.
          This makes agent NFTs productive assets — not decorative tokens.
        </p>
        <a href="https://testnet.arcscan.app/address/0x05D3DbA1ec497105d61B7a623020d316e761ACAd" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-violet-600 hover:underline mt-3">
          AgentNFT Contract on Arc Explorer <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
