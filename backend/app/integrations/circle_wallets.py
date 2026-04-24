"""
Circle Wallets integration for NanoForge.
Uses Developer-Controlled Wallets to create and manage agent wallets on Arc.
"""
import base64, uuid
import httpx
from typing import Optional
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from app.core.config import get_settings


class CircleWalletsClient:
    BASE_URL = "https://api.circle.com/v1/w3s"

    def __init__(self):
        s = get_settings()
        self.api_key = s.circle_api_key
        self.wallet_set_id = s.circle_wallet_set_id
        self.entity_secret = s.circle_entity_secret
        self._pub_key = None

    @property
    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    def _get_pub_key(self):
        if self._pub_key is None:
            r = httpx.get(f"{self.BASE_URL}/config/entity/publicKey", headers=self._headers)
            pem = r.json()["data"]["publicKey"]
            self._pub_key = serialization.load_pem_public_key(pem.encode())
        return self._pub_key

    def _encrypt(self) -> str:
        """Fresh ciphertext every call — Circle rejects reuse."""
        ct = self._get_pub_key().encrypt(
            bytes.fromhex(self.entity_secret),
            padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
        )
        return base64.b64encode(ct).decode()

    def create_agent_wallet(self, agent_id: int) -> dict:
        payload = {
            "idempotencyKey": str(uuid.uuid4()),
            "entitySecretCiphertext": self._encrypt(),
            "walletSetId": self.wallet_set_id,
            "blockchains": ["ARC-TESTNET"],
            "count": 1,
            "metadata": [{"name": f"NanoForge Agent #{agent_id}", "refId": f"agent-{agent_id}"}],
        }
        with httpx.Client(timeout=30) as client:
            r = client.post(f"{self.BASE_URL}/developer/wallets", headers=self._headers, json=payload)
            r.raise_for_status()
            return r.json()

    def get_wallet_balance(self, wallet_id: str) -> dict:
        with httpx.Client(timeout=15) as client:
            r = client.get(f"{self.BASE_URL}/wallets/{wallet_id}/balances", headers=self._headers)
            r.raise_for_status()
            return r.json()

    def transfer_usdc(self, wallet_id: str, to_address: str, amount_usdc: float) -> dict:
        payload = {
            "idempotencyKey": str(uuid.uuid4()),
            "entitySecretCiphertext": self._encrypt(),
            "walletId": wallet_id,
            "tokenId": "USDC",
            "destinationAddress": to_address,
            "amounts": [str(amount_usdc)],
            "feeLevel": "MEDIUM",
        }
        with httpx.Client(timeout=30) as client:
            r = client.post(f"{self.BASE_URL}/developer/transactions/transfer", headers=self._headers, json=payload)
            r.raise_for_status()
            return r.json()

    def is_configured(self) -> bool:
        return bool(self.api_key and self.wallet_set_id and self.entity_secret)


_client: Optional[CircleWalletsClient] = None


def get_circle_wallets_client() -> CircleWalletsClient:
    global _client
    if _client is None:
        _client = CircleWalletsClient()
    return _client
