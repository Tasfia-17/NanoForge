import { useState } from 'react'
import { Bot, Zap, TrendingUp, ExternalLink, Star } from 'lucide-react'

const mockAgents = [
  {
    id: 1,
    name: 'CodeCraft Agent',
    description: 'Full-stack code generation, debugging, and refactoring. Specializes in Python, TypeScript, and Solidity.',
    skills: ['code-gen', 'debug', 'refactor', 'test-write'],
    pricePerAction: 0.001,
    totalJobs: 89,
    successRate: 97,
    yieldEarned: 0.0801,
    status: 'active',
    owner: '0x1234...abcd',
  },
  {
    id: 2,
    name: 'DataMind Agent',
    description: 'Data analysis, visualization, and insight generation. Handles CSV, JSON, and API data sources.',
    skills: ['data-analysis', 'visualization', 'reporting'],
    pricePerAction: 0.001,
    totalJobs: 54,
    successRate: 94,
    yieldEarned: 0.0486,
    status: 'active',
    owner: '0x5678...efgh',
  },
  {
    id: 3,
    name: 'ContentForge Agent',
    description: 'Long-form content, copywriting, SEO optimization, and social media posts.',
    skills: ['copywriting', 'seo', 'social-media', 'blog'],
    pricePerAction: 0.001,
    totalJobs: 31,
    successRate: 100,
    yieldEarned: 0.0279,
    status: 'active',
    owner: '0x9abc...ijkl',
  },
]

export default function AgentsPage() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">AI Agents</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hosted agents available for hire · $0.001 USDC per action</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockAgents.map((agent) => (
          <div
            key={agent.id}
            className={`glass-card-hover p-5 cursor-pointer ${selected === agent.id ? 'ring-2 ring-violet-300' : ''}`}
            onClick={() => setSelected(selected === agent.id ? null : agent.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-pastel-lavender flex items-center justify-center">
                <Bot size={20} className="text-violet-600" />
              </div>
              <div className="arc-badge">
                <span className="status-dot active" />
                Active
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-1">{agent.name}</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{agent.description}</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {agent.skills.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-gray-600 border border-white/80">{s}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold text-gray-800">{agent.totalJobs}</div>
                <div className="text-xs text-gray-400">Jobs</div>
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-600">{agent.successRate}%</div>
                <div className="text-xs text-gray-400">Success</div>
              </div>
              <div>
                <div className="text-sm font-bold text-violet-600">${agent.yieldEarned.toFixed(4)}</div>
                <div className="text-xs text-gray-400">Yield</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/50 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Zap size={11} className="text-violet-500" />
                $0.001 USDC / action
              </div>
              <span className="text-xs text-gray-400 font-mono">NFT #{agent.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent yield explanation */}
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
        <div className="mt-4 flex items-center gap-2">
          <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet-600 hover:underline">
            View on Arc Explorer <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  )
}
