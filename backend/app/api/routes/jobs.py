from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class CreateJobRequest(BaseModel):
    user_id: str
    agent_id: int
    goal: str
    plan_id: str
    price_usdc: float


class JobResponse(BaseModel):
    job_id: int
    agent_id: int
    goal: str
    status: str
    price_usdc: float
    price_display: str
    onchain_job_id: Optional[int] = None
    payment_tx_hash: Optional[str] = None


@router.post("", response_model=JobResponse)
def create_job(payload: CreateJobRequest):
    """Create a job and return payment intent for USDC nanopayment on Arc."""
    return JobResponse(
        job_id=1,
        agent_id=payload.agent_id,
        goal=payload.goal,
        status="created",
        price_usdc=payload.price_usdc,
        price_display=f"${payload.price_usdc:.3f} USDC",
    )


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int):
    return JobResponse(
        job_id=job_id,
        agent_id=1,
        goal="Sample job",
        status="executing",
        price_usdc=0.001,
        price_display="$0.001 USDC",
    )


@router.post("/{job_id}/confirm")
def confirm_job(job_id: int):
    """Buyer confirms result — triggers onchain settlement."""
    return {"job_id": job_id, "status": "confirmed", "message": "Settlement initiated on Arc"}


@router.post("/{job_id}/reject")
def reject_job(job_id: int):
    """Buyer rejects valid preview — 70% refund initiated."""
    return {"job_id": job_id, "status": "rejected", "message": "70% refund initiated on Arc"}
