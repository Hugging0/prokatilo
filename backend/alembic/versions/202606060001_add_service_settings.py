"""add service settings

Revision ID: 202606060001
Revises: 202606050001
Create Date: 2026-06-06 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606060001"
down_revision: str | None = "202606050001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def table_exists(table_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    if table_exists("service_settings"):
        return

    op.create_table(
        "service_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "timezone",
            sa.String(length=100),
            nullable=False,
            server_default="Europe/Moscow",
        ),
        sa.Column(
            "workday_start",
            sa.String(length=5),
            nullable=False,
            server_default="08:00",
        ),
        sa.Column(
            "workday_end",
            sa.String(length=5),
            nullable=False,
            server_default="20:00",
        ),
        sa.Column(
            "delivery_slot_minutes",
            sa.Integer(),
            nullable=False,
            server_default="120",
        ),
        sa.Column(
            "min_order_lead_minutes",
            sa.Integer(),
            nullable=False,
            server_default="15",
        ),
        sa.Column("support_phone", sa.String(length=50), nullable=True),
        sa.Column(
            "service_is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column("service_pause_message", sa.String(length=500), nullable=True),
        sa.Column(
            "cash_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "card_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "sbp_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "default_payment_method",
            sa.String(length=50),
            nullable=False,
            server_default="cash",
        ),
        sa.Column(
            "cashback_percent",
            sa.Integer(),
            nullable=False,
            server_default="5",
        ),
        sa.Column(
            "max_bonus_spend_percent",
            sa.Integer(),
            nullable=False,
            server_default="30",
        ),
        sa.Column(
            "bonus_to_ruble_rate",
            sa.Integer(),
            nullable=False,
            server_default="1",
        ),
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
    )
    op.create_index("ix_service_settings_id", "service_settings", ["id"])

    settings_table = sa.table(
        "service_settings",
        sa.column("id", sa.Integer()),
    )
    op.bulk_insert(settings_table, [{"id": 1}])


def downgrade() -> None:
    if table_exists("service_settings"):
        op.drop_index("ix_service_settings_id", table_name="service_settings")
        op.drop_table("service_settings")
