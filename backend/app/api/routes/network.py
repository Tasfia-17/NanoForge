from fastapi import APIRouter
router = APIRouter()

@router.get("")
def get_network():
    from app.core.config import get_settings
    s = get_settings()
    return {
        "chain": "Arc Testnet",
        "chain_id": s.arc_chain_id,
        "rpc_url": s.arc_rpc_url,
        "usdc_address": s.arc_usdc_address,
        "explorer": "https://testnet.arcscan.app",
        "nanopayments": "Circle Nanopayments",
        "payment_standard": "x402 / EIP-3009",
    }
