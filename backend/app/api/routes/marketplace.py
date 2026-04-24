from fastapi import APIRouter
router = APIRouter()

@router.get("")
def list_listings():
    return [
        {"listing_id": 1, "agent_id": 1, "name": "CodeCraft Agent", "price_usdc": 5.0, "seller": "0x1234...abcd", "active": True},
        {"listing_id": 2, "agent_id": 2, "name": "DataMind Agent", "price_usdc": 3.5, "seller": "0x5678...efgh", "active": True},
    ]
