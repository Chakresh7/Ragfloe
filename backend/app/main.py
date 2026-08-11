import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.database import warm_database
from app.services.auth_service import _get_jwks_client, _issuer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_application: FastAPI):
    settings = get_settings()
    try:
        warm_database()
        logger.info("Database pool warmed")
    except Exception:
        logger.exception("Database warm-up failed")

    try:
        jwks_url = f"{_issuer(settings.supabase_url)}/.well-known/jwks.json"
        _get_jwks_client(jwks_url).fetch_data()
        logger.info("JWKS cache warmed")
    except Exception:
        logger.exception("JWKS warm-up failed")

    yield


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title="RagFloe API",
        version="0.1.0",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix="/api/v1")

    @application.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = create_app()
