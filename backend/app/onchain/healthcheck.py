from dataclasses import dataclass, field


@dataclass
class HealthReport:
    healthy: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class OnchainHealthcheck:
    def __init__(self, settings, contracts_registry):
        self.settings = settings
        self.contracts_registry = contracts_registry

    def check(self) -> HealthReport:
        errors = []
        if not self.settings.arc_rpc_url:
            errors.append("arc_rpc_url not configured")
        if not self.settings.contract_job_ledger:
            errors.append("contract_job_ledger not configured")
        return HealthReport(healthy=len(errors) == 0, errors=errors)
