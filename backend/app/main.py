import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import create_api_router
from app.core.config import get_settings
from app.db.base import Base
from app.core.container import get_container


@asynccontextmanager
async def lifespan(_: FastAPI):
    container = get_container()
    tasks: list[asyncio.Task] = []

    if container.settings.auto_create_tables:
        Base.metadata.create_all(bind=container.engine)

    if container.settings.execution_sync_enabled:
        tasks.append(asyncio.create_task(_execution_sync_worker(container=container), name="nanoforge-execution-sync"))

    if container.settings.onchain_indexer_enabled:
        tasks.append(asyncio.create_task(_onchain_indexer_worker(container=container), name="nanoforge-onchain-indexer"))

    try:
        yield
    finally:
        for task in tasks:
            task.cancel()
        with suppress(asyncio.CancelledError):
            await asyncio.gather(*tasks)


async def _execution_sync_worker(*, container) -> None:
    from app.indexer.execution_sync import sync_execution_runs_once
    interval = container.settings.execution_sync_poll_seconds or 2.0
    while True:
        try:
            await asyncio.to_thread(sync_execution_runs_once, session_factory=container.session_factory)
        except asyncio.CancelledError:
            raise
        except Exception:
            pass
        await asyncio.sleep(interval)


async def _onchain_indexer_worker(*, container) -> None:
    interval = container.settings.onchain_indexer_poll_seconds or 2.0
    while True:
        try:
            onchain_indexer = container.onchain_indexer
            if onchain_indexer:
                await asyncio.to_thread(onchain_indexer.poll_once)
        except asyncio.CancelledError:
            raise
        except Exception:
            pass
        await asyncio.sleep(interval)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="NanoForge — AI Outcome Delivery Network on Arc with USDC Nanopayments",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(create_api_router(), prefix=settings.api_prefix)
    return app


app = create_app()
