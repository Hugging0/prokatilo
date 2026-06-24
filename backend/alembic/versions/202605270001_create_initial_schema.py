"""create initial schema

Revision ID: 202605270001
Revises:
Create Date: 2026-05-27 00:01:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202605270001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def table_exists(table_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return table_name in inspector.get_table_names()


def index_exists(table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        index["name"] == index_name
        for index in inspector.get_indexes(table_name)
    )


def upgrade() -> None:
    if not table_exists("items"):
        op.create_table(
            "items",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("description", sa.String(length=1000), nullable=True),
            sa.Column("price_per_3h", sa.Numeric(10, 2), nullable=False),
            sa.Column("price_per_24h", sa.Numeric(10, 2), nullable=False),
            sa.Column("price_per_7d", sa.Numeric(10, 2), nullable=False),
            sa.Column("is_available", sa.Boolean(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )

    if not index_exists("items", "ix_items_id"):
        op.create_index(op.f("ix_items_id"), "items", ["id"], unique=False)

    if not index_exists("items", "ix_items_title"):
        op.create_index(
            op.f("ix_items_title"),
            "items",
            ["title"],
            unique=False,
        )

    if not table_exists("orders"):
        op.create_table(
            "orders",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("item_id", sa.Integer(), nullable=False),
            sa.Column("customer_login", sa.String(length=255), nullable=False),
            sa.Column("customer_phone", sa.String(length=50), nullable=False),
            sa.Column("tariff_type", sa.String(length=50), nullable=False),
            sa.Column("total_price", sa.Numeric(10, 2), nullable=False),
            sa.Column("status", sa.String(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["item_id"], ["items.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not index_exists("orders", "ix_orders_id"):
        op.create_index(op.f("ix_orders_id"), "orders", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_orders_id"), table_name="orders")
    op.drop_table("orders")
    op.drop_index(op.f("ix_items_title"), table_name="items")
    op.drop_index(op.f("ix_items_id"), table_name="items")
    op.drop_table("items")
