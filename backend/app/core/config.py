from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DB_PATH = BACKEND_ROOT / "data" / "nanoforge.db"
DEFAULT_ENV_FILE = BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    app_name: str = "NanoForge Backend"
    app_version: str = "1.0.0"
    env: str = "dev"
    api_prefix: str = "/api/v1"

    database_url: str = f"sqlite+pysqlite:///{DEFAULT_DB_PATH.as_posix()}"
    auto_create_tables: bool = True

    # Arc / Circle
    arc_chain_id: int = 5042002  # Arc testnet
    arc_rpc_url: str = "https://rpc.arc.network"
    arc_usdc_address: str = "0x79AEc4EeA31D50792F61D1Ca0733C18c89524C9e"
    arc_usdc_name: str = "USD Coin"
    arc_usdc_version: str = "2"

    # Circle Wallets (Developer-Controlled) — primary wallet solution for agents
    circle_api_key: str = ""
    circle_wallet_set_id: str = ""
    circle_entity_secret: str = ""
    circle_agent_wallet_ids: str = ""  # comma-separated wallet IDs
    circle_nanopayments_base_url: str = "https://api.circle.com/v1/w3s"

    # Contracts (populated after deploy)
    contract_nfg_token: str = ""
    contract_agent_nft: str = ""
    contract_yield_vault: str = ""
    contract_job_settler: str = ""
    contract_job_ledger: str = ""
    contract_job_payment_router: str = ""
    contract_agent_market: str = ""

    # Onchain runtime
    onchain_receipt_timeout_seconds: float = 15.0
    onchain_tx_timeout_seconds: float = 15.0
    onchain_indexer_enabled: bool = True
    onchain_indexer_poll_seconds: float = 2.0
    onchain_indexer_confirmation_depth: int = 0
    onchain_indexer_bootstrap_block: int = 0
    onchain_indexer_max_block_span: int = 2000

    # Signing keys
    broadcaster_private_key: str = ""
    adapter_private_key: str = ""
    agent_owner_private_key: str = ""
    buyer_private_key: str = ""
    platform_treasury_private_key: str = ""
    buyer_wallet_map_json: str = "{}"

    # AI execution (AgentSkillOS)
    agentskillos_root: str = ""
    agentskillos_python_executable: str = ""
    agentskillos_skill_group: str = "skill_seeds"
    agentskillos_llm_model: str = ""
    agentskillos_execution_mode: str = "dag"
    agentskillos_execution_timeout_seconds: float = 1800.0
    agentskillos_execution_output_root: str = "data/executions"
    agentskillos_discovery_timeout_seconds: float = 8.0

    # Gemini (Google prize track)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_pro_model: str = "gemini-2.5-pro"

    # Execution sync
    execution_sync_enabled: bool = True
    execution_sync_poll_seconds: float = 2.0

    model_config = SettingsConfigDict(
        env_prefix="NANOFORGE_",
        env_file=str(DEFAULT_ENV_FILE),
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


def reset_settings_cache() -> None:
    get_settings.cache_clear()
