"""add payment fields to orders

Revision ID: 202605290001
Revises: 202605280002
Create Date: 2026-05-29 00:01:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202605290001"
down_revision: str | None = "202605280002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        column["name"] == column_name
        for column in inspector.get_columns(table_name)
    )


def upgrade() -> None:
    if not column_exists("orders", "payment_status"):
        op.add_column(
            "orders",
            sa.Column(
                "payment_status",
                sa.String(length=50),
                nullable=False,
                server_default="pending",
            ),
        )

    if not column_exists("orders", "yookassa_payment_id"):
        op.add_column(
            "orders",
            sa.Column("yookassa_payment_id", sa.String(length=255), nullable=True),
        )

    if not column_exists("orders", "yookassa_confirmation_url"):
        op.add_column(
            "orders",
            sa.Column(
                "yookassa_confirmation_url",
                sa.String(length=2048),
                nullable=True,
            ),
        )


def downgrade() -> None:
    if column_exists("orders", "yookassa_confirmation_url"):
        op.drop_column("orders", "yookassa_confirmation_url")

    if column_exists("orders", "yookassa_payment_id"):
        op.drop_column("orders", "yookassa_payment_id")

    if column_exists("orders", "payment_status"):
        op.drop_column("orders", "payment_status")
