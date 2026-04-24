from fastapi import APIRouter
from pydantic import BaseModel
import uuid

router = APIRouter()


class AgentResponse(BaseModel):
    agent_id: int
    name: str
    description: str
    skills: list[str]
    price_per_action_usdc: float
    total_jobs: int
    success_rate: float
    yield_earned_nfg: float
    owner_address: str
    nft_token_id: int
    status: str
    circle_wallet_id: str | None = None
    circle_wallet_address: str | None = None


@router.get("", response_model=list[AgentResponse])
def list_agents():
    return [
        AgentResponse(
            agent_id=1, name="CodeCraft Agent",
            description="Full-stack code generation, debugging, and refactoring.",
            skills=["code-gen", "debug", "refactor", "test-write"],
            price_per_action_usdc=0.001, total_jobs=89, success_rate=0.97,
            yield_earned_nfg=0.0801, owner_address="0x1234...abcd", nft_token_id=1, status="active",
        ),
        AgentResponse(
            agent_id=2, name="DataMind Agent",
            description="Data analysis, visualization, and insight generation.",
            skills=["data-analysis", "visualization", "reporting"],
            price_per_action_usdc=0.001, total_jobs=54, success_rate=0.94,
            yield_earned_nfg=0.0486, owner_address="0x5678...efgh", nft_token_id=2, status="active",
        ),
    ]


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: int):
    return AgentResponse(
        agent_id=agent_id, name="CodeCraft Agent",
        description="Full-stack code generation, debugging, and refactoring.",
        skills=["code-gen", "debug", "refactor"],
        price_per_action_usdc=0.001, total_jobs=89, success_rate=0.97,
        yield_earned_nfg=0.0801, owner_address="0x1234...abcd", nft_token_id=agent_id, status="active",
    )


@router.post("/{agent_id}/wallet")
def create_agent_wallet(agent_id: int):
    """
    Create a Circle Developer-Controlled Wallet for an AI agent on Arc.
    This is the primary wallet solution recommended by the hackathon.
    Each agent gets its own USDC wallet for autonomous nanopayments.
    """
    from app.integrations.circle_wallets import get_circle_wallets_client
    client = get_circle_wallets_client()

    if not client.is_configured():
        # Return demo response when Circle API key not configured
        return {
            "agent_id": agent_id,
            "wallet_provider": "Circle Developer-Controlled Wallets",
            "blockchain": "ARC",
            "status": "demo_mode",
            "message": "Configure NANOFORGE_CIRCLE_API_KEY and NANOFORGE_CIRCLE_WALLET_SET_ID to create real Circle Wallets",
            "circle_docs": "https://developers.circle.com/w3s/docs/developer-controlled-wallets",
            "why_circle_wallets": (
                "Circle Wallets are the primary wallet infrastructure for NanoForge. "
                "Each AI agent gets its own developer-controlled wallet on Arc, "
                "enabling autonomous USDC nanopayments without managing raw private keys."
            ),
        }

    idempotency_key = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"nanoforge-agent-{agent_id}"))
    result = client.create_agent_wallet(agent_id=agent_id, idempotency_key=idempotency_key)
    wallets = result.get("data", {}).get("wallets", [])
    wallet = wallets[0] if wallets else {}

    return {
        "agent_id": agent_id,
        "wallet_provider": "Circle Developer-Controlled Wallets",
        "blockchain": "ARC",
        "wallet_id": wallet.get("id"),
        "wallet_address": wallet.get("address"),
        "status": wallet.get("state", "LIVE"),
        "usdc_balance": "0.000000",
    }


@router.get("/{agent_id}/wallet/balance")
def get_agent_wallet_balance(agent_id: int, wallet_id: str):
    """Get USDC balance for an agent's Circle Wallet."""
    from app.integrations.circle_wallets import get_circle_wallets_client
    client = get_circle_wallets_client()

    if not client.is_configured():
        return {"agent_id": agent_id, "wallet_id": wallet_id, "usdc_balance": "0.001000", "status": "demo_mode"}

    result = client.get_wallet_balance(wallet_id)
    balances = result.get("data", {}).get("tokenBalances", [])
    usdc = next((b for b in balances if "USDC" in b.get("token", {}).get("symbol", "")), {})
    return {
        "agent_id": agent_id,
        "wallet_id": wallet_id,
        "usdc_balance": usdc.get("amount", "0"),
        "blockchain": "ARC",
    }

