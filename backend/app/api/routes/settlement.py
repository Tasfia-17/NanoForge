from fastapi import APIRouter
router = APIRouter()

@router.get("/job/{job_id}")
def get_settlement(job_id: int):
    return {"job_id": job_id, "status": "confirmed", "platform_share_usdc": 0.0001, "agent_share_nfg": 0.0009, "refund_usdc": 0.0}
