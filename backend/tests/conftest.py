"""Shared pytest fixtures for API tests."""

from __future__ import annotations

from collections.abc import Generator
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

TEST_JWT_SECRET = "test-supabase-jwt-secret-for-ragfloe"
TEST_USER_ID = "11111111-2222-3333-4444-555555555555"
TEST_USER_B_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
TEST_EMAIL = "tester@example.com"


@pytest.fixture()
def db_engine(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000")
    monkeypatch.setenv("DATABASE_URL", "sqlite+pysqlite:///:memory:")

    from app.core.config import get_settings
    from app.core import database as database_module
    from app.models import Base

    get_settings.cache_clear()
    database_module.get_engine.cache_clear()
    database_module.get_session_factory.cache_clear()

    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)

    monkeypatch.setattr(database_module, "get_engine", lambda: engine)
    monkeypatch.setattr(
        database_module,
        "get_session_factory",
        lambda: sessionmaker(bind=engine, autocommit=False, autoflush=False),
    )

    yield engine

    get_settings.cache_clear()


@pytest.fixture()
def db_session(db_engine) -> Generator[Session, None, None]:
    SessionLocal = sessionmaker(bind=db_engine, autocommit=False, autoflush=False)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_engine, db_session: Session) -> Generator[TestClient, None, None]:
    from app.core.config import get_settings
    from app.core.database import get_db
    import app.main as main_module

    get_settings.cache_clear()
    main_module.app = main_module.create_app()

    def _override_db():
        try:
            yield db_session
        finally:
            pass

    main_module.app.dependency_overrides[get_db] = _override_db

    with TestClient(main_module.app) as test_client:
        yield test_client

    main_module.app.dependency_overrides.clear()
    get_settings.cache_clear()


def make_token(
    *,
    sub: str = TEST_USER_ID,
    email: str | None = TEST_EMAIL,
    expired: bool = False,
    secret: str = TEST_JWT_SECRET,
    audience: str = "authenticated",
) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, object] = {
        "sub": sub,
        "aud": audience,
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now - timedelta(hours=1)).timestamp())
        if expired
        else int((now + timedelta(hours=1)).timestamp()),
    }
    if email is not None:
        payload["email"] = email
    return jwt.encode(payload, secret, algorithm="HS256")


def auth_header(token: str | None = None) -> dict[str, str]:
    return {"Authorization": f"Bearer {token or make_token()}"}
