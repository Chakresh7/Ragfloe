from functools import lru_cache
from urllib.parse import quote_plus

from pydantic import Field, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(url: str) -> str:
    """Ensure SQLAlchemy uses psycopg v3 and reject common malformed pastes."""
    cleaned = url.strip().strip('"').strip("'")
    if "://postgres+psycopg://" in cleaned or "://postgresql+psycopg://" in cleaned:
        raise ValueError(
            "DATABASE_URL is malformed. Use DATABASE_HOST + DATABASE_PASSWORD, or: "
            "postgresql+psycopg://postgres:YOUR_PASSWORD@HOST:5432/postgres"
        )
    if cleaned.startswith("postgresql://"):
        cleaned = "postgresql+psycopg://" + cleaned.removeprefix("postgresql://")
    elif cleaned.startswith("postgres://"):
        cleaned = "postgresql+psycopg://" + cleaned.removeprefix("postgres://")
    return cleaned


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = Field(default="development", alias="APP_ENV")
    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_jwt_secret: str = Field(default="", alias="SUPABASE_JWT_SECRET")
    database_url_value: str = Field(default="", alias="DATABASE_URL")
    database_host: str = Field(default="", alias="DATABASE_HOST")
    database_password: str = Field(default="", alias="DATABASE_PASSWORD")
    database_user: str = Field(default="postgres", alias="DATABASE_USER")
    database_name: str = Field(default="postgres", alias="DATABASE_NAME")
    database_port: int = Field(default=5432, alias="DATABASE_PORT")
    cors_origins_raw: str = Field(
        default="http://localhost:3000",
        alias="CORS_ORIGINS",
    )

    @field_validator("database_url_value")
    @classmethod
    def _check_database_url(cls, value: str) -> str:
        if not value.strip():
            return ""
        return normalize_database_url(value)

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        if self.database_url_value:
            return self.database_url_value
        if self.database_host and self.database_password:
            user = quote_plus(self.database_user)
            password = quote_plus(self.database_password)
            return (
                f"postgresql+psycopg://{user}:{password}"
                f"@{self.database_host}:{self.database_port}/{self.database_name}"
            )
        raise ValueError(
            "Database is not configured. Set DATABASE_HOST + DATABASE_PASSWORD "
            "(recommended) or a full DATABASE_URL."
        )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins(self) -> list[str]:
        configured = [
            part.strip()
            for part in self.cors_origins_raw.split(",")
            if part.strip()
        ]
        # Local Next.js is often opened as localhost OR 127.0.0.1; both must work.
        defaults = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        merged: list[str] = []
        for origin in [*configured, *defaults]:
            if origin not in merged:
                merged.append(origin)
        return merged


@lru_cache
def get_settings() -> Settings:
    return Settings()
