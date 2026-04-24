from fastapi import APIRouter
router = APIRouter()

@router.get("/agent/{agent_id}")
def get_agent_yield(agent_id: int):
    return {"agent_id": agent_id, "claimable_nfg": 0.0801, "unsettled_nfg": 0.0, "total_earned_nfg": 0.0801}

@router.post("/agent/{agent_id}/claim")
def claim_yield(agent_id: int):
    return {"agent_id": agent_id, "claimed_nfg": 0.0801, "tx_hash": "0xabc..."}
