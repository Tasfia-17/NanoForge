from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str
    chain: str
    chain_id: int


@router.get("/health", response_model=HealthResponse)
def health():
    from app.core.config import get_settings
    s = get_settings()
    return HealthResponse(status="ok", version=s.app_version, chain="Arc Testnet", chain_id=s.arc_chain_id)
