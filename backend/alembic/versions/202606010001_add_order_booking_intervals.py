"""add order booking intervals

Revision ID: 202606010001
Revises: 202605290001
Create Date: 2026-06-01 00:01:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606010001"
down_revision: str | None = "202605290001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        column["name"] == column_name
        for column in inspector.get_columns(table_name)
    )


def index_exists(table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        index["name"] == index_name
        for index in inspector.get_indexes(table_name)
    )


def upgrade() -> None:
    if not column_exists("orders", "rental_start_at"):
        op.add_column(
            "orders",
            sa.Column("rental_start_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not column_exists("orders", "rental_end_at"):
        op.add_column(
            "orders",
            sa.Column("rental_end_at", sa.DateTime(timezone=True), nullable=True),
        )

    op.execute(
        """
        UPDATE orders
        SET rental_start_at = CASE
            WHEN rental_date IS NOT NULL
             AND rental_date <> ''
             AND rental_time IS NOT NULL
             AND rental_time <> ''
            THEN ((rental_date || ' ' || rental_time)::timestamp AT TIME ZONE 'Europe/Moscow')
            ELSE created_at
        END
        WHERE rental_start_at IS NULL
        """,
    )
    op.execute(
        """
        UPDATE orders
        SET rental_end_at = rental_start_at + CASE tariff_type
            WHEN '3h' THEN INTERVAL '3 hours'
            WHEN '6h' THEN INTERVAL '6 hours'
            ELSE INTERVAL '24 hours'
        END
        WHERE rental_end_at IS NULL
        """,
    )
    op.execute("UPDATE items SET is_available = TRUE WHERE is_active = TRUE")

    op.alter_column("orders", "rental_start_at", nullable=False)
    op.alter_column("orders", "rental_end_at", nullable=False)

    if not index_exists("orders", "ix_orders_item_booking_interval"):
        op.create_index(
            "ix_orders_item_booking_interval",
            "orders",
            ["item_id", "rental_start_at", "rental_end_at"],
            unique=False,
        )


def downgrade() -> None:
    if index_exists("orders", "ix_orders_item_booking_interval"):
        op.drop_index("ix_orders_item_booking_interval", table_name="orders")

    if column_exists("orders", "rental_end_at"):
        op.drop_column("orders", "rental_end_at")

    if column_exists("orders", "rental_start_at"):
        op.drop_column("orders", "rental_start_at")
