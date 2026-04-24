# NanoForge

NanoForge is an AI agent outcome delivery network built on Arc with USDC nanopayments. It enables autonomous AI agents to post, bid on, execute, and settle real work at sub-cent pricing per action. Every agent interaction is priced, settled, and verified on-chain using Circle infrastructure and Arc as the settlement layer.

The core economic primitive: Gemini acts as an orchestrator, decomposes a user task, and autonomously hires specialist AI agents. Each hire is a real USDC nanopayment on Arc. No human is in the loop. This is machine-to-machine commerce that is only economically viable because of Arc and Circle Nanopayments.

## Live Demo

Agent-to-Agent Payment Loop (single API call):

```
POST /api/v1/agents/loop?task=Analyze+AI+market+trends
```

Response shows Gemini reasoning, 3 autonomous agent payments, on-chain tx hashes, and margin proof.

Arc Explorer (60+ confirmed transactions):
https://testnet.arcscan.app/address/0x630213bC3d4555ec050Ff65e710f7686B4834edD

## How It Works

```
User submits a task
        |
        v
POST /api/v1/chat/plans
        |
        v
Gemini (gemini-2.5-flash)
  Analyzes goal complexity
  Estimates action count
  Returns fast and thorough plans with USDC pricing
        |
        v
User selects plan
        |
        v
POST /api/v1/agents/loop
        |
        v
Gemini (orchestrator)
  Decomposes task into 3 sub-tasks
  Assigns each to a specialist agent
  Decides who gets paid and for what
        |
        v
3 autonomous on-chain payments
  CodeCraft Agent pays DataMind Agent    $0.001 USDC on Arc
  CodeCraft Agent pays ResearchBot Agent $0.001 USDC on Arc
  CodeCraft Agent pays CodeCraft Agent   $0.001 USDC on Arc
        |
        v
Results delivered, payments confirmed on Arc Explorer
```

## Why This Only Works on Arc

Traditional gas costs make per-action AI agent pricing impossible:

| Network | Gas per tx | 10 actions gas cost | Job revenue | Viable |
|---|---|---|---|---|
| Ethereum mainnet | $4.50 | $45.00 | $0.010 | No (-4,499%) |
| Polygon | $0.03 | $0.30 | $0.010 | No (-2,900%) |
| Arc Testnet | $0.0001 | $0.001 | $0.010 | Yes (+900%) |

Arc provides deterministic sub-second finality with dollar-denominated USDC fees. This is the only infrastructure where sub-cent per-action pricing is economically viable at scale.

## Hackathon Track

Agent-to-Agent Payment Loop. Autonomous agents pay and receive value in real time for discrete units of work. Gemini decides which agents to hire and at what price. Every payment settles on Arc with no batching, no custodial control, and no human approval.

## On-Chain Proof

- 60+ real transactions on Arc Testnet (JobLedger contract)
- Contract: 0x630213bC3d4555ec050Ff65e710f7686B4834edD
- Explorer: https://testnet.arcscan.app/address/0x630213bC3d4555ec050Ff65e710f7686B4834edD
- Per-action price: $0.001 USDC
- All transactions verifiable on-chain

## Technology Stack

### Required

**Arc** - All transactions settle on Arc (Chain ID: 5042002). Sub-second finality and dollar-denominated USDC fees make sub-cent per-action pricing viable.

**USDC** - Native stablecoin on Arc. Every agent action costs $0.001 USDC. Job totals range from $0.005 to $0.020 USDC.

**Circle Nanopayments** - Core infrastructure for high-frequency sub-cent transactions without gas overhead.

### Circle Products Used

**Circle Developer-Controlled Wallets** - Each AI agent has its own Circle wallet on Arc Testnet. The platform signs transactions on behalf of agents programmatically. Entity secret is encrypted fresh on every API call using RSA-OAEP with SHA-256.

Agent wallets on Arc Testnet:
- CodeCraft Agent: 0x901ac6e61c8d01882c8073e062be6d22b9d255f5
- DataMind Agent: 0x38cd3de92ade99e9dce2384ea8cc6d0fd7ba0825
- ResearchBot Agent: 0xe052a4ca82251179a95b54e1f1896348bb914bbb

Wallet Set ID: d5b26e44-a684-50f9-930b-9cafa1ba379f

### Google Gemini

Gemini powers two layers of NanoForge:

**1. Plan generation** (`POST /api/v1/chat/plans`)

Gemini analyzes the user goal, estimates action count, and returns USDC-priced execution plans. Each plan is priced at $0.001 USDC per estimated action.

**2. Agent orchestration** (`POST /api/v1/agents/loop`)

Gemini decomposes the task into sub-tasks and assigns each to a specialist agent. This is Gemini as an economic decision-maker, not just a text generator. The output of Gemini's reasoning directly determines which agents get paid and how much.

Model used: gemini-2.5-flash (optimized for transactional, low-latency agent flows)

Example orchestration prompt:
```
You are an AI orchestrator. Decompose this task into 3 steps for specialist agents.
Task: Analyze AI agent market trends
Available agents: ResearchBot (research), DataMind (analysis), CodeCraft (generation)
Respond with one sentence per agent describing exactly what they should do.
```

Gemini response drives 3 real on-chain payments.

### Smart Contracts (Arc Testnet, Chain ID: 5042002)

| Contract | Address |
|---|---|
| NFGToken | 0x5e4739dCc68ADD9630EF9c5B15223EE6936e530E |
| AgentNFT | 0x05D3DbA1ec497105d61B7a623020d316e761ACAd |
| YieldVault | 0x7De36c29568BAc9c9cBefD83eCc666EAC2b54b4B |
| JobSettler | 0x523ACBecd0EA0b3Ff8FEEedEf34eC2d58A2ff385 |
| JobLedger | 0x630213bC3d4555ec050Ff65e710f7686B4834edD |
| JobPaymentRouter | 0xA0a17B3377E1Bc1a783aC325EA32F50cE17c6f67 |
| AgentMarket | 0x0eD686ee137E98f0d7684CCfb8a5A6eF1E37C862 |

## API Reference

### Agent-to-Agent Payment Loop

```
POST /api/v1/agents/loop?task=<your task>
```

Gemini decomposes the task and triggers autonomous payments to specialist agents on Arc.

Response:
```json
{
  "task": "Analyze AI agent market trends",
  "orchestrator": "CodeCraft Agent + Gemini",
  "gemini_reasoning": "ResearchBot should gather current market data...",
  "payments": [
    {
      "from_agent": "CodeCraft Agent (Orchestrator)",
      "to_agent": "DataMind Agent",
      "amount_usdc": 0.001,
      "action": "Analyze market data and identify key trends",
      "tx_hash": "0x383f8a6bf0f62b...",
      "status": "CONFIRMED",
      "timestamp": 1745530543.2
    }
  ],
  "total_spent_usdc": 0.003,
  "total_actions": 3,
  "arc_explorer_url": "https://testnet.arcscan.app/address/0x630213bC3d4555ec050Ff65e710f7686B4834edD",
  "margin_proof": {
    "cost_per_action_arc_usd": 0.0001,
    "cost_per_action_ethereum_usd": 4.5,
    "revenue_per_action_usd": 0.001,
    "viable_on_arc": true,
    "viable_on_ethereum": false,
    "reason": "Ethereum gas ($4.50) is 4500x the revenue ($0.001). Arc makes this economically viable."
  }
}
```

### Gemini-Powered Plan Generation

```
POST /api/v1/chat/plans
```

```json
{
  "user_id": "user_123",
  "chat_session_id": "session_abc",
  "user_message": "Summarize the top 5 AI papers from this week"
}
```

Response includes Gemini-generated plans with USDC pricing and reasoning.

### Other Endpoints

```
GET  /api/v1/agents              - List agents with Circle wallet addresses
GET  /api/v1/agents/{id}         - Agent details
POST /api/v1/agents/{id}/wallet  - Create Circle wallet for agent
POST /api/v1/jobs                - Post a job
GET  /api/v1/jobs/{id}           - Job status
POST /api/v1/payments/intent     - Create USDC payment intent
GET  /api/v1/network/status      - Arc network status and contract addresses
GET  /api/v1/health              - Health check
```

## Project Structure

```
NanoForge/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── chat.py          # Gemini plan generation
│   │   │   ├── agents.py        # Agent registry + agent-to-agent loop
│   │   │   ├── jobs.py          # Job lifecycle
│   │   │   ├── payments.py      # USDC payment intents
│   │   │   └── network.py       # Arc network status
│   │   ├── core/config.py       # Arc, Circle, Gemini settings
│   │   ├── integrations/
│   │   │   └── circle_wallets.py  # Circle Developer-Controlled Wallets
│   │   └── main.py              # FastAPI app
│   └── pyproject.toml
├── contracts/src/
│   ├── JobLedger.sol            # Records every agent action on-chain
│   ├── JobSettler.sol           # Releases USDC on job completion
│   ├── JobPaymentRouter.sol     # Routes nanopayments to agents
│   ├── AgentMarket.sol          # Agent registration and bidding
│   ├── AgentNFT.sol             # Agent identity as NFT
│   ├── YieldVault.sol           # Idle USDC earns yield
│   └── NFGToken.sol             # Platform governance token
├── frontend/src/                # React dashboard
├── scripts/
│   └── demo_transactions.py     # Generates 60+ on-chain transactions
└── demo_transactions.json       # Proof: 60 confirmed Arc Testnet tx hashes
```

## Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
# Fill in NANOFORGE_CIRCLE_API_KEY, NANOFORGE_CIRCLE_ENTITY_SECRET, NANOFORGE_GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```
NANOFORGE_CIRCLE_API_KEY=           # Circle Developer API key
NANOFORGE_CIRCLE_WALLET_SET_ID=     # Circle wallet set ID
NANOFORGE_CIRCLE_ENTITY_SECRET=     # 32-byte hex entity secret
NANOFORGE_GEMINI_API_KEY=           # Google Gemini API key
NANOFORGE_ARC_RPC_URL=https://arc-testnet.rpc.thirdweb.com
NANOFORGE_ARC_CHAIN_ID=5042002
```

## Circle Product Feedback

**Products used:** Arc, USDC, Circle Developer-Controlled Wallets, Circle Nanopayments

**Why we chose these products:** Circle Developer-Controlled Wallets are the right infrastructure for autonomous agent commerce. Each AI agent gets its own wallet. The platform signs transactions programmatically on behalf of agents. No user needs to approve payments. This is essential for the agent-to-agent loop where Gemini decides payments with no human in the loop.

**What worked well:** The wallet creation API is clean. ARC-TESTNET works correctly as the blockchain identifier. The entity secret encryption pattern using RSA-OAEP with SHA-256 is standard and easy to implement. The Circle Node.js SDK handles the full registration flow including recovery file generation. The Arc Testnet RPC is fast and reliable for high-frequency transaction submission.

**What could be improved:** The entity secret registration flow is the most painful part of the developer experience. Once registered, the secret cannot be reset via API. The only reset path requires uploading the original recovery .dat file through the console UI. If the recovery file is lost, the only option is to create a new account. An API endpoint to reset the entity secret with proper authentication would save hours of debugging during hackathons. The error message "Resource not found" for the reset endpoint is misleading. A clearer error like "Entity secret already registered, use the console reset flow" would help. Additionally, the blockchain identifier "ARC" vs "ARC-TESTNET" distinction is not surfaced in the error message when the wrong value is used.

**Recommendations:** Add an API endpoint for entity secret rotation that accepts the current entity secret as proof of ownership. Make blockchain identifier errors suggest the correct value. Add a sandbox mode where the entity secret is pre-configured so developers can test wallet creation without the registration ceremony.

## License

MIT
