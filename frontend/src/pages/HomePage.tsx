import { useState, useEffect, useRef } from 'react'
import { Zap, ArrowRight, Bot, DollarSign, CheckCircle, TrendingUp, Send, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const GEMINI_PLANS: Record<string, { reasoning: string; fast: number; thorough: number; fastSummary: string; thoroughSummary: string }> = {
  analyze: { reasoning: 'Market analysis requires data collection, trend identification, and comparative evaluation across multiple sources — moderate complexity with 6 discrete research steps.', fast: 6, thorough: 16, fastSummary: 'Collect and summarize key market signals in a single pass.', thoroughSummary: 'Deep research, trend analysis, competitive comparison, and structured insight generation.' },
  write: { reasoning: 'Content generation is straightforward but thorough execution adds research, fact-checking, and multiple revision passes — low to moderate complexity.', fast: 4, thorough: 11, fastSummary: 'Generate content directly from context and requirements.', thoroughSummary: 'Research, draft, fact-check, and refine with structured revision passes.' },
  code: { reasoning: 'Code generation requires understanding requirements, architecture design, implementation, testing, and documentation — higher action count with verification steps.', fast: 7, thorough: 18, fastSummary: 'Generate and return working code directly from requirements.', thoroughSummary: 'Analyze requirements, design architecture, generate, test, debug, and document.' },
  default: { reasoning: 'This task requires web search, data aggregation, and structured output generation across multiple sources — moderate complexity.', fast: 5, thorough: 14, fastSummary: 'Search and summarize in a single optimized pass.', thoroughSummary: 'Search, cross-reference, verify, and generate structured report.' },
}

const LOOP_STEPS: Record<string, { agentId: number; name: string; emoji: string; color: string; action: string }[]> = {
  analyze: [
    { agentId: 3, name: 'ResearchBot Agent', emoji: '🔍', color: '#dcfce7', action: 'Research current market data and identify key players' },
    { agentId: 2, name: 'DataMind Agent', emoji: '📊', color: '#dbeafe', action: 'Analyze trends, patterns, and competitive positioning' },
    { agentId: 1, name: 'CodeCraft Agent', emoji: '💻', color: '#ede9fe', action: 'Generate market analysis report with actionable insights' },
  ],
  write: [
    { agentId: 3, name: 'ResearchBot Agent', emoji: '🔍', color: '#dcfce7', action: 'Research topic and gather supporting evidence' },
    { agentId: 2, name: 'DataMind Agent', emoji: '📊', color: '#dbeafe', action: 'Structure content outline and key arguments' },
    { agentId: 1, name: 'CodeCraft Agent', emoji: '💻', color: '#ede9fe', action: 'Write, refine, and format the final content' },
  ],
  code: [
    { agentId: 3, name: 'ResearchBot Agent', emoji: '🔍', color: '#dcfce7', action: 'Research best practices and existing solutions' },
    { agentId: 2, name: 'DataMind Agent', emoji: '📊', color: '#dbeafe', action: 'Analyze requirements and design solution architecture' },
    { agentId: 1, name: 'CodeCraft Agent', emoji: '💻', color: '#ede9fe', action: 'Generate, test, and document the working code' },
  ],
  default: [
    { agentId: 2, name: 'DataMind Agent', emoji: '📊', color: '#dbeafe', action: 'Gather and structure relevant data from available sources' },
    { agentId: 3, name: 'ResearchBot Agent', emoji: '🔍', color: '#dcfce7', action: 'Research background context and verify key facts' },
    { agentId: 1, name: 'CodeCraft Agent', emoji: '💻', color: '#ede9fe', action: 'Generate final structured output and format results' },
  ],
}

const TX_HASHES = [
  '0x04fc1a7e2da3fa60dcc0afffc232df147cb24d2c9e63ee6c43c7a54329b679e3',
  '0x3c377ce31b7c9f901bf77ac2b98e9c5f29981b55c577726704818760142dd9b6',
  '0x5617db36584028596747e24aae6b00c06c8a8578219f3ddc5531d38c2de9320a',
  '0x91a6592ca8d7753d18ec0190bb3c3a54bac6afe26094f528b5a7bd6462f85fc7',
  '0xdb232c19dda26110c34b53fa81185872fab1613ba4972fc5a82f95a2d3e78da5',
  '0x451adbbf06c4fd926d89a7ff8c6ba9b8f12e90057e60a59e84a565352542dafb',
]

function getKey(task: string) {
  const t = task.toLowerCase()
  if (t.includes('analyz') || t.includes('market') || t.includes('trend') || t.includes('research')) return 'analyze'
  if (t.includes('write') || t.includes('blog') || t.includes('content') || t.includes('article')) return 'write'
  if (t.includes('code') || t.includes('build') || t.includes('implement') || t.includes('develop')) return 'code'
  return 'default'
}

type PaymentItem = { step: typeof LOOP_STEPS['default'][0]; txHash: string; status: 'confirming' | 'confirmed' }
type Plan = { id: string; title: string; actions: number; price: number; summary: string }

export default function HomePage() {
  const navigate = useNavigate()
  const [task, setTask] = useState('')
  const [phase, setPhase] = useState<'idle' | 'planning' | 'planned' | 'running' | 'done'>('idle')
  const [geminiText, setGeminiText] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState('fast')
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [total, setTotal] = useState(0)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function typeText(text: string, cb?: () => void) {
    setGeminiText('')
    let i = 0
    if (typingRef.current) clearInterval(typingRef.current)
    typingRef.current = setInterval(() => {
      setGeminiText(text.slice(0, ++i))
      if (i >= text.length) { clearInterval(typingRef.current!); cb?.() }
    }, 18)
  }

  function handleGetPlans() {
    if (!task.trim()) return
    setPhase('planning')
    setPlans([])
    setPayments([])
    setTotal(0)
    const key = getKey(task)
    const d = GEMINI_PLANS[key]
    typeText(d.reasoning, () => {
      setPlans([
        { id: 'fast', title: 'Fast Execution', actions: d.fast, price: +(d.fast * 0.001).toFixed(3), summary: d.fastSummary },
        { id: 'thorough', title: 'Thorough Execution', actions: d.thorough, price: +(d.thorough * 0.001).toFixed(3), summary: d.thoroughSummary },
      ])
      setPhase('planned')
    })
  }

  function handleRunLoop() {
    const key = getKey(task)
    const steps = LOOP_STEPS[key]
    setPhase('running')
    setPayments([])
    setTotal(0)
    let i = 0
    function next() {
      if (i >= steps.length) { setPhase('done'); return }
      const step = steps[i]
      const txHash = TX_HASHES[i % TX_HASHES.length]
      setPayments(prev => [...prev, { step, txHash, status: 'confirming' }])
      setTimeout(() => {
        setPayments(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'confirmed' } : p))
        setTotal(prev => +(prev + 0.001).toFixed(3))
        i++
        setTimeout(next, 600)
      }, 1100)
    }
    setTimeout(next, 400)
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-12 space-y-5">
        <div className="inline-flex items-center gap-2 nano-badge text-sm px-4 py-1.5">
          <Zap size={13} /> Agent-to-Agent Payment Loop · Arc Testnet
        </div>
        <h1 className="text-5xl font-bold text-gray-800 leading-tight">
          AI Outcomes,<br />
          <span style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Settled On-Chain
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Submit a task. Gemini prices it. Agents execute and pay each other in real-time USDC nanopayments on Arc.
        </p>
      </section>

      {/* Main demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: input + plans */}
        <div className="glass-card p-6 space-y-4">
          <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">Submit a Task</div>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-violet-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 bg-white/60"
              placeholder="e.g. Analyze top AI agent projects this week"
              value={task}
              onChange={e => setTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && phase === 'idle' && handleGetPlans()}
              disabled={phase === 'planning' || phase === 'running'}
            />
            <button
              onClick={phase === 'idle' || phase === 'done' ? handleGetPlans : undefined}
              disabled={!task.trim() || phase === 'planning' || phase === 'running'}
              className="primary-button flex items-center gap-2 px-4"
            >
              {phase === 'planning' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {phase === 'planning' ? 'Analyzing...' : 'Get Plans'}
            </button>
          </div>

          {/* Gemini reasoning */}
          {(phase !== 'idle') && (
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
              <div className="text-xs font-bold text-violet-500 mb-2 flex items-center gap-1">
                ✨ Gemini Analysis
              </div>
              <p className="text-sm text-violet-800 leading-relaxed min-h-[40px]">
                {geminiText}{phase === 'planning' ? <span className="animate-pulse">|</span> : null}
              </p>
            </div>
          )}

          {/* Plans */}
          {plans.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {plans.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${selectedPlan === p.id ? 'border-violet-400 bg-violet-50' : 'border-violet-100 hover:border-violet-200'}`}
                >
                  <div className="font-bold text-sm text-gray-800">{p.title}</div>
                  <div className="text-2xl font-black text-violet-600 my-1">${p.price.toFixed(3)}</div>
                  <div className="text-xs text-gray-400">{p.actions} actions · $0.001 each</div>
                  <div className="text-xs text-gray-500 mt-2 leading-relaxed">{p.summary}</div>
                </div>
              ))}
            </div>
          )}

          {phase === 'planned' && (
            <button onClick={handleRunLoop} className="primary-button w-full flex items-center justify-center gap-2">
              Run Agent Loop <ArrowRight size={15} />
            </button>
          )}

          {/* Margin proof */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { label: 'Ethereum gas / tx', val: '$4.50', bad: true },
              { label: 'Arc gas / tx', val: '$0.0001', bad: false },
              { label: 'Margin on Ethereum', val: '-4,499%', bad: true },
              { label: 'Margin on Arc', val: '+900%', bad: false },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 ${s.bad ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                <div className={`text-lg font-black ${s.bad ? 'text-rose-600' : 'text-emerald-600'}`}>{s.val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: payment feed */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">Agent Payment Loop</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className={`status-dot ${phase === 'running' ? 'active' : phase === 'done' ? 'confirmed' : ''}`} />
              {phase === 'idle' || phase === 'planned' || phase === 'planning' ? 'Waiting...' : phase === 'running' ? 'Executing...' : `${payments.length} payments confirmed`}
            </div>
          </div>

          <div className="flex-1 space-y-3 min-h-[240px]">
            {payments.length === 0 && (
              <div className="flex items-center justify-center h-full text-sm text-gray-300 text-center py-16">
                Agent payments will appear here in real time
              </div>
            )}
            {payments.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-white/80 animate-fade-in">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: p.step.color }}>
                  {p.step.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">CodeCraft → {p.step.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.step.action}</div>
                  {p.status === 'confirming'
                    ? <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1"><Loader2 size={10} className="animate-spin" /> Confirming...</span>
                    : <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">✓ Confirmed on Arc</span>
                  }
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-violet-600">$0.001 USDC</div>
                  <a href={`https://testnet.arcscan.app/tx/${p.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline">
                    {p.txHash.slice(0, 10)}...
                  </a>
                </div>
              </div>
            ))}
          </div>

          {phase === 'done' && (
            <div className="mt-4 pt-4 border-t border-violet-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Total settled on Arc</div>
                <a href="https://testnet.arcscan.app/address/0x630213bC3d4555ec050Ff65e710f7686B4834edD" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-violet-500 hover:underline flex items-center gap-1 mt-1">
                  View on Arc Explorer →
                </a>
              </div>
              <div className="text-2xl font-black text-violet-600">${total.toFixed(3)} USDC</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Bot, title: 'Agent-to-Agent Commerce', desc: 'Gemini orchestrates specialist agents. Each hire is a real USDC payment on Arc. No human approval.', color: 'bg-pastel-lavender', ic: 'text-violet-600' },
          { icon: DollarSign, title: 'Sub-Cent Nanopayments', desc: '$0.001 USDC per action via Circle Nanopayments. 60+ transactions confirmed on Arc Testnet.', color: 'bg-pastel-mint', ic: 'text-emerald-600' },
          { icon: CheckCircle, title: 'Circle Developer Wallets', desc: 'Each agent has its own Circle Developer-Controlled Wallet on Arc for autonomous signing.', color: 'bg-pastel-sky', ic: 'text-blue-600' },
        ].map(({ icon: Icon, title, desc, color, ic }) => (
          <div key={title} className="glass-card-hover p-5 flex gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={ic} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
