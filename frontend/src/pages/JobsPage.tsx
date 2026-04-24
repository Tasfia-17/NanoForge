import { useState } from 'react'
import { Send, Zap, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

type JobStatus = 'draft' | 'paying' | 'executing' | 'preview' | 'confirmed' | 'rejected'

const mockJobs = [
  { id: 42, goal: 'Write a Python script to parse CSV and generate a bar chart', agent: 'DataMind Agent', status: 'confirmed' as JobStatus, cost: '$0.001', txns: 7, time: '2m ago' },
  { id: 41, goal: 'Debug the TypeScript type error in my React component', agent: 'CodeCraft Agent', status: 'confirmed' as JobStatus, cost: '$0.001', txns: 5, time: '8m ago' },
  { id: 40, goal: 'Write a blog post about Circle Nanopayments', agent: 'ContentForge Agent', status: 'preview' as JobStatus, cost: '$0.001', txns: 4, time: '12m ago' },
  { id: 39, goal: 'Refactor this Solidity contract to use ERC-8004', agent: 'CodeCraft Agent', status: 'executing' as JobStatus, cost: '$0.001', txns: 3, time: '15m ago' },
]

const statusConfig: Record<JobStatus, { label: string; color: string; icon: any }> = {
  draft: { label: 'Draft', color: 'text-gray-500', icon: Clock },
  paying: { label: 'Paying', color: 'text-blue-500', icon: Zap },
  executing: { label: 'Executing', color: 'text-amber-500', icon: RefreshCw },
  preview: { label: 'Preview Ready', color: 'text-violet-500', icon: CheckCircle },
  confirmed: { label: 'Confirmed', color: 'text-emerald-500', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-rose-500', icon: XCircle },
}

export default function JobsPage() {
  const [goal, setGoal] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('1')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!goal.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setGoal('')
    alert('Job submitted! USDC payment of $0.001 initiated on Arc via Circle Nanopayments.')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Submit a goal · Pay $0.001 USDC · Confirm delivery</p>
      </div>

      {/* Submit form */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="section-title">Submit a New Job</h2>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Your Goal</label>
          <textarea
            className="input-glass resize-none h-24"
            placeholder="Describe what you want delivered. Be specific — NanoForge prices and executes it."
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Select Agent</label>
            <select className="input-glass" value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
              <option value="1">CodeCraft Agent — $0.001/action</option>
              <option value="2">DataMind Agent — $0.001/action</option>
              <option value="3">ContentForge Agent — $0.001/action</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Payment</label>
            <div className="input-glass flex items-center gap-2 cursor-default">
              <Zap size={14} className="text-violet-500" />
              <span className="text-gray-700">$0.001 USDC via Arc Nanopayments</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">
            Payment locked on Arc · Released only on your confirmation · Full refund on failure
          </p>
          <button
            className="primary-button flex items-center gap-2 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={submitting || !goal.trim()}
          >
            {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Submitting...' : 'Submit Job'}
          </button>
        </div>
      </div>

      {/* Job list */}
      <div className="glass-card p-6">
        <h2 className="section-title mb-4">Recent Jobs</h2>
        <div className="space-y-2">
          {mockJobs.map((job) => {
            const cfg = statusConfig[job.status]
            const Icon = cfg.icon
            return (
              <div key={job.id} className="tx-row">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Icon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{job.goal}</p>
                    <p className="text-xs text-gray-400">{job.agent} · {job.txns} onchain txns · {job.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  <span className="font-mono text-xs text-emerald-600">{job.cost}</span>
                  {job.status === 'preview' && (
                    <div className="flex gap-1">
                      <button className="text-xs px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">Confirm</button>
                      <button className="text-xs px-2 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
