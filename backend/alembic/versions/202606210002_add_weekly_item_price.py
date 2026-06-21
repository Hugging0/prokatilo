"""add weekly item price

Revision ID: 202606210002
Revises: 202606120001
Create Date: 2026-06-21 23:30:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606210002"
down_revision: str | None = "202606120001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        column["name"] == column_name
        for column in inspector.get_columns(table_name)
    )


def upgrade() -> None:
    if not column_exists("items", "price_per_7d"):
        op.add_column(
            "items",
            sa.Column("price_per_7d", sa.Numeric(10, 2), nullable=True),
        )

    op.execute(
        """
        UPDATE items
        SET price_per_7d = COALESCE(price_per_24h, 0) * 7
        WHERE price_per_7d IS NULL
        """,
    )
    op.alter_column("items", "price_per_7d", nullable=False)


def downgrade() -> None:
    if column_exists("items", "price_per_7d"):
        op.drop_column("items", "price_per_7d")
