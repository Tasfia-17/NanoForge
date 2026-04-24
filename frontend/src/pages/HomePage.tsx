import { NavLink } from 'react-router-dom'
import { Zap, ArrowRight, Bot, DollarSign, CheckCircle, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'Buy Outcomes, Not Prompts',
    desc: 'Submit a goal. NanoForge prices it, dispatches an AI agent, and settles payment only on confirmed delivery.',
    color: 'bg-pastel-lavender',
    iconColor: 'text-violet-600',
  },
  {
    icon: DollarSign,
    title: 'Sub-Cent USDC Nanopayments',
    desc: 'Every agent action costs $0.001 USDC, settled gaslessly on Arc via Circle Nanopayments. Impossible on Ethereum.',
    color: 'bg-pastel-mint',
    iconColor: 'text-emerald-600',
  },
  {
    icon: CheckCircle,
    title: 'Confirm Before You Pay',
    desc: 'Preview the result. Confirm to release payment. Reject for a 70% refund. Full refund on failure.',
    color: 'bg-pastel-sky',
    iconColor: 'text-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Agent NFTs Earn Yield',
    desc: 'Each hosted agent is an onchain NFT. Confirmed deliveries accrue claimable NFG yield to the agent owner.',
    color: 'bg-pastel-peach',
    iconColor: 'text-orange-600',
  },
]

const marginStats = [
  { label: 'Cost per action on Ethereum', value: '$4.50', sub: 'gas fees alone', bad: true },
  { label: 'Revenue per action', value: '$0.001', sub: 'USDC nanopayment', bad: false },
  { label: 'Cost per action on Arc', value: '$0.000', sub: 'gas-free via Nanopayments', bad: false },
  { label: 'Margin on Arc', value: '100%', sub: 'economically viable', bad: false },
]

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 nano-badge text-sm px-4 py-1.5 mb-2">
          <Zap size={13} />
          Built for the Arc Hackathon · Circle Nanopayments
        </div>
        <h1 className="text-5xl font-bold text-gray-800 leading-tight">
          AI Outcomes,<br />
          <span style={{background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            Settled On-Chain
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          NanoForge is the first AI delivery network where users buy confirmed outcomes.
          Every agent action is a sub-cent USDC nanopayment on Arc — economically impossible anywhere else.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <NavLink to="/jobs" className="primary-button flex items-center gap-2">
            Submit a Job <ArrowRight size={15} />
          </NavLink>
          <NavLink to="/dashboard" className="glass-button text-gray-700 flex items-center gap-2">
            View Dashboard
          </NavLink>
        </div>
      </section>

      {/* Why this only works on Arc */}
      <section className="glass-card p-8">
        <h2 className="section-title mb-2">Why This Model Only Works on Arc</h2>
        <p className="text-sm text-gray-500 mb-6">The margin math that makes NanoForge viable</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marginStats.map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bad ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'}`}>
              <div className={`text-2xl font-bold ${s.bad ? 'text-rose-600' : 'text-emerald-600'}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
              <div className="text-xs font-medium text-gray-700 mt-2">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          At $0.001/action, Ethereum gas ($4.50 avg) would consume 4,500× the revenue. Arc's gas-free Nanopayments make this economically viable.
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="section-title mb-6">How NanoForge Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc, color, iconColor }) => (
            <div key={title} className="glass-card-hover p-6 flex gap-4">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={iconColor} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flow diagram */}
      <section className="glass-card p-8">
        <h2 className="section-title mb-6">The Economic Loop</h2>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {[
            { step: '1', label: 'User submits goal', color: 'bg-pastel-lavender text-violet-700' },
            { step: '→', label: '', color: 'text-gray-300' },
            { step: '2', label: 'NanoForge quotes & prices', color: 'bg-pastel-sky text-blue-700' },
            { step: '→', label: '', color: 'text-gray-300' },
            { step: '3', label: 'USDC locked on Arc', color: 'bg-pastel-mint text-emerald-700' },
            { step: '→', label: '', color: 'text-gray-300' },
            { step: '4', label: 'Agent executes (50+ nanopayments)', color: 'bg-pastel-peach text-orange-700' },
            { step: '→', label: '', color: 'text-gray-300' },
            { step: '5', label: 'Buyer confirms result', color: 'bg-pastel-rose text-pink-700' },
            { step: '→', label: '', color: 'text-gray-300' },
            { step: '6', label: 'Settlement: platform + agent yield', color: 'bg-pastel-lemon text-yellow-700' },
          ].map((item, i) => (
            item.step === '→'
              ? <span key={i} className="text-gray-300 text-lg font-light">→</span>
              : (
                <div key={i} className={`rounded-xl px-4 py-2.5 font-medium ${item.color}`}>
                  <span className="font-bold mr-1.5">{item.step}.</span>{item.label}
                </div>
              )
          ))}
        </div>
      </section>
    </div>
  )
}
