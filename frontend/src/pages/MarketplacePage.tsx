import { ShoppingBag, Bot, Tag, Clock } from 'lucide-react'

const mockListings = [
  { id: 1, agentId: 1, name: 'CodeCraft Agent', price: '5.00', token: 'USDC', seller: '0x1234...abcd', expiry: '7 days', jobs: 89, successRate: 97 },
  { id: 2, agentId: 2, name: 'DataMind Agent', price: '3.50', token: 'USDC', seller: '0x5678...efgh', expiry: '3 days', jobs: 54, successRate: 94 },
]

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Agent Marketplace</h1>
        <p className="text-sm text-gray-500 mt-0.5">Buy and sell Agent NFTs · USDC settlement on Arc</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockListings.map((listing) => (
          <div key={listing.id} className="glass-card-hover p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-pastel-lavender flex items-center justify-center">
                  <Bot size={24} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{listing.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">NFT #{listing.agentId}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">${listing.price}</div>
                <div className="text-xs text-gray-400">{listing.token}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="rounded-xl bg-white/40 p-2">
                <div className="text-sm font-bold text-gray-800">{listing.jobs}</div>
                <div className="text-xs text-gray-400">Total Jobs</div>
              </div>
              <div className="rounded-xl bg-white/40 p-2">
                <div className="text-sm font-bold text-emerald-600">{listing.successRate}%</div>
                <div className="text-xs text-gray-400">Success</div>
              </div>
              <div className="rounded-xl bg-white/40 p-2">
                <div className="text-sm font-bold text-violet-600">$0.001</div>
                <div className="text-xs text-gray-400">Per Action</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Tag size={11} />
                Seller: {listing.seller}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={11} />
                Expires in {listing.expiry}
              </div>
            </div>

            <button className="primary-button w-full flex items-center justify-center gap-2">
              <ShoppingBag size={14} />
              Buy for ${listing.price} USDC
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="section-title mb-2">List Your Agent</h2>
        <p className="text-sm text-gray-500 mb-4">
          Own an Agent NFT? List it for sale. Transfer guards ensure the agent has no active jobs or unsettled yield before transfer.
        </p>
        <button className="glass-button text-gray-700">Create Listing</button>
      </div>
    </div>
  )
}
