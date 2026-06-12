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
    api_root_path: str = Field(default="", alias="API_ROOT_PATH")
    yookassa_shop_id: str | None = Field(default=None, alias="YOOKASSA_SHOP_ID")
    yookassa_secret_key: str | None = Field(
        default=None,
        alias="YOOKASSA_SECRET_KEY",
    )
    yookassa_return_url: str = Field(
        default="http://localhost:3000",
        alias="YOOKASSA_RETURN_URL",
    )
    web_push_vapid_public_key: str | None = Field(
        default=None,
        alias="WEB_PUSH_VAPID_PUBLIC_KEY",
    )
    web_push_vapid_private_key: str | None = Field(
        default=None,
        alias="WEB_PUSH_VAPID_PRIVATE_KEY",
    )
    web_push_vapid_subject: str = Field(
        default="mailto:support@prokatilo.local",
        alias="WEB_PUSH_VAPID_SUBJECT",
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

    @property
    def yookassa_is_configured(self) -> bool:
        return bool(self.yookassa_shop_id and self.yookassa_secret_key)

    @property
    def web_push_is_configured(self) -> bool:
        return bool(
            self.web_push_vapid_public_key
            and self.web_push_vapid_private_key
            and self.web_push_vapid_subject
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
