from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(alias="DATABASE_URL")
    admin_api_key: str | None = Field(default=None, alias="ADMIN_API_KEY")
    admin_emails: str = Field(
        default="admin@prokatilo.local",
        alias="ADMIN_EMAILS",
    )
    auth_secret: str = Field(
        default="change-me-local-auth-secret",
        alias="AUTH_SECRET",
    )
    cors_origins: str = Field(
        default=(
            "http://localhost:3000,http://127.0.0.1:3000,"
            "http://localhost:3001,http://127.0.0.1:3001"
        ),
        alias="CORS_ORIGINS",
    )
    environment: str = Field(default="development", alias="ENVIRONMENT")
    create_tables_on_startup: bool = Field(
        default=False,
        alias="CREATE_TABLES_ON_STARTUP",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def admin_email_set(self) -> set[str]:
        return {
            email.strip().lower()
            for email in self.admin_emails.split(",")
            if email.strip()
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
