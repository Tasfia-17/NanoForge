from fastapi import APIRouter
from app.core.config import get_settings

from app.api.routes.health import router as health_router
from app.api.routes.chat import router as chat_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.payments import router as payments_router
from app.api.routes.agents import router as agents_router
from app.api.routes.marketplace import router as marketplace_router
from app.api.routes.yield_routes import router as yield_router
from app.api.routes.settlement import router as settlement_router
from app.api.routes.execution_runs import router as execution_runs_router
from app.api.routes.network import router as network_router


def create_api_router() -> APIRouter:
    api_router = APIRouter()
    api_router.include_router(health_router, tags=["health"])
    api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
    api_router.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
    api_router.include_router(payments_router, prefix="/payments", tags=["payments"])
    api_router.include_router(agents_router, prefix="/agents", tags=["agents"])
    api_router.include_router(marketplace_router, prefix="/marketplace", tags=["marketplace"])
    api_router.include_router(yield_router, prefix="/yield", tags=["yield"])
    api_router.include_router(settlement_router, prefix="/settlement", tags=["settlement"])
    api_router.include_router(execution_runs_router, prefix="/execution-runs", tags=["execution-runs"])
    api_router.include_router(network_router, prefix="/network", tags=["network"])
    return api_router
