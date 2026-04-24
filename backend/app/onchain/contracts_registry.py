class ContractsRegistry:
    def __init__(self, settings):
        self.settings = settings

    @property
    def job_ledger_address(self) -> str:
        return self.settings.contract_job_ledger

    @property
    def job_payment_router_address(self) -> str:
        return self.settings.contract_job_payment_router

    @property
    def job_settler_address(self) -> str:
        return self.settings.contract_job_settler

    @property
    def yield_vault_address(self) -> str:
        return self.settings.contract_yield_vault

    @property
    def agent_nft_address(self) -> str:
        return self.settings.contract_agent_nft

    @property
    def agent_market_address(self) -> str:
        return self.settings.contract_agent_market

    @property
    def nfg_token_address(self) -> str:
        return self.settings.contract_nfg_token

    @property
    def usdc_address(self) -> str:
        return self.settings.arc_usdc_address
