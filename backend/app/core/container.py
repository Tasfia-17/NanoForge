from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings
from app.db.base import Base
from app.onchain.contracts_registry import ContractsRegistry
from app.onchain.healthcheck import OnchainHealthcheck


class Container:
    def __init__(self):
        s = get_settings()
        self.settings = s
        self.engine = create_engine(s.database_url, connect_args={"check_same_thread": False})
        self.session_factory = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self._contracts_registry = None
        self._onchain_indexer = None
        self._onchain_health_report = None

    @property
    def contracts_registry(self) -> ContractsRegistry:
        if self._contracts_registry is None:
            self._contracts_registry = ContractsRegistry(settings=self.settings)
        return self._contracts_registry

    @property
    def onchain_indexer(self):
        if self._onchain_indexer is None:
            try:
                from app.integrations.onchain_indexer import build_onchain_indexer
                self._onchain_indexer = build_onchain_indexer(
                    settings=self.settings,
                    session_factory=self.session_factory,
                    contracts_registry=self.contracts_registry,
                )
            except Exception:
                self._onchain_indexer = None
        return self._onchain_indexer

    @property
    def onchain_health_report(self):
        if self._onchain_health_report is None:
            try:
                checker = OnchainHealthcheck(settings=self.settings, contracts_registry=self.contracts_registry)
                self._onchain_health_report = checker.check()
            except Exception as e:
                self._onchain_health_report = type("Report", (), {"healthy": False, "errors": [str(e)]})()
        return self._onchain_health_report


_container: Container | None = None


def get_container() -> Container:
    global _container
    if _container is None:
        _container = Container()
    return _container
