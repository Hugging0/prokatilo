"""drop six hour item price

Revision ID: 202606240001
Revises: 202606210002
Create Date: 2026-06-24 00:01:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606240001"
down_revision: str | None = "202606210002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        column["name"] == column_name
        for column in inspector.get_columns(table_name)
    )


def upgrade() -> None:
    if column_exists("items", "price_per_6h"):
        op.drop_column("items", "price_per_6h")


def downgrade() -> None:
    if not column_exists("items", "price_per_6h"):
        op.add_column(
            "items",
            sa.Column(
                "price_per_6h",
                sa.Numeric(10, 2),
                server_default="0",
                nullable=False,
            ),
        )
        op.alter_column("items", "price_per_6h", server_default=None)
