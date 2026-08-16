"""add Telegram admin subscriptions

Revision ID: 202608160001
Revises: 202608150001
Create Date: 2026-08-16 13:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202608160001"
down_revision: str | None = "202608150001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def table_exists(table_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    if table_exists("telegram_admin_subscriptions"):
        return

    op.create_table(
        "telegram_admin_subscriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("telegram_user_id", sa.BigInteger(), nullable=False),
        sa.Column("chat_id", sa.BigInteger(), nullable=False),
        sa.Column("username", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("chat_id"),
        sa.UniqueConstraint("telegram_user_id"),
    )
    op.create_index(
        "ix_telegram_admin_subscriptions_id",
        "telegram_admin_subscriptions",
        ["id"],
    )
    op.create_index(
        "ix_telegram_admin_subscriptions_chat_id",
        "telegram_admin_subscriptions",
        ["chat_id"],
    )
    op.create_index(
        "ix_telegram_admin_subscriptions_telegram_user_id",
        "telegram_admin_subscriptions",
        ["telegram_user_id"],
    )
    op.create_index(
        "ix_telegram_admin_subscriptions_username",
        "telegram_admin_subscriptions",
        ["username"],
    )


def downgrade() -> None:
    if not table_exists("telegram_admin_subscriptions"):
        return

    op.drop_index(
        "ix_telegram_admin_subscriptions_username",
        table_name="telegram_admin_subscriptions",
    )
    op.drop_index(
        "ix_telegram_admin_subscriptions_telegram_user_id",
        table_name="telegram_admin_subscriptions",
    )
    op.drop_index(
        "ix_telegram_admin_subscriptions_chat_id",
        table_name="telegram_admin_subscriptions",
    )
    op.drop_index(
        "ix_telegram_admin_subscriptions_id",
        table_name="telegram_admin_subscriptions",
    )
    op.drop_table("telegram_admin_subscriptions")
