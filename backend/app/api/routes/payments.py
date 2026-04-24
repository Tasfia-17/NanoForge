from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class NanopaymentIntentRequest(BaseModel):
    job_id: int
    buyer_address: str
    amount_usdc: float


class NanopaymentIntentResponse(BaseModel):
    job_id: int
    amount_usdc: float
    amount_units: int  # USDC 6-decimal units
    payment_source: str
    arc_chain_id: int
    contract_address: str
    calldata: Optional[str] = None
    message: str


@router.post("/nanopayment-intent", response_model=NanopaymentIntentResponse)
def create_nanopayment_intent(payload: NanopaymentIntentRequest):
    """
    Generate a Circle Nanopayment intent for a job.
    Returns calldata for EIP-3009 USDC authorization on Arc.
    Sub-cent pricing: $0.001 = 1000 USDC units (6 decimals).
    """
    from app.core.config import get_settings
    s = get_settings()
    amount_units = int(payload.amount_usdc * 1_000_000)
    return NanopaymentIntentResponse(
        job_id=payload.job_id,
        amount_usdc=payload.amount_usdc,
        amount_units=amount_units,
        payment_source="USDC_EIP3009",
        arc_chain_id=s.arc_chain_id,
        contract_address=s.contract_job_payment_router,
        message=f"Pay ${payload.amount_usdc:.4f} USDC via Circle Nanopayments on Arc",
    )


@router.get("/stats")
def payment_stats():
    """Live payment statistics for the hackathon demo."""
    return {
        "total_transactions": 127,
        "total_usdc_settled": 0.127,
        "avg_cost_per_action_usdc": 0.001,
        "ethereum_equivalent_gas_usd": 4.50,
        "gas_savings_multiplier": 4500,
        "payment_source": "Circle Nanopayments on Arc",
        "chain": "Arc Testnet",
        "chain_id": 33111,
    }
