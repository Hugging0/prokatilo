"""make actual rental dates nullable

Revision ID: 202606070001
Revises: 202606060001
Create Date: 2026-06-07 20:20:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "202606070001"
down_revision: Union[str, None] = "202606060001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "orders",
        "rental_start_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
    )
    op.alter_column(
        "orders",
        "rental_end_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=True,
    )
    op.execute(
        """
        UPDATE orders
        SET rental_start_at = NULL,
            rental_end_at = NULL
        WHERE status IN ('pending', 'confirmed', 'delivery')
        """,
    )


def downgrade() -> None:
    op.alter_column(
        "orders",
        "rental_end_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
    )
    op.alter_column(
        "orders",
        "rental_start_at",
        existing_type=sa.DateTime(timezone=True),
        nullable=False,
    )
