"""add catalog management fields to items

Revision ID: 202605270002
Revises: 202605270001
Create Date: 2026-05-27 00:02:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202605270002"
down_revision: str | None = "202605270001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        column["name"] == column_name
        for column in inspector.get_columns(table_name)
    )


def upgrade() -> None:
    if not column_exists("items", "category"):
        op.add_column(
            "items",
            sa.Column(
                "category",
                sa.String(length=100),
                server_default="Техника",
                nullable=False,
            ),
        )

    if not column_exists("items", "image_url"):
        op.add_column(
            "items",
            sa.Column("image_url", sa.String(length=2048), nullable=True),
        )

    if not column_exists("items", "icon_key"):
        op.add_column(
            "items",
            sa.Column(
                "icon_key",
                sa.String(length=50),
                server_default="package",
                nullable=False,
            ),
        )

    if not column_exists("items", "sort_order"):
        op.add_column(
            "items",
            sa.Column(
                "sort_order",
                sa.Integer(),
                server_default="100",
                nullable=False,
            ),
        )

    if not column_exists("items", "is_active"):
        op.add_column(
            "items",
            sa.Column(
                "is_active",
                sa.Boolean(),
                server_default=sa.true(),
                nullable=False,
            ),
        )

    if not column_exists("items", "updated_at"):
        op.add_column(
            "items",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )

    op.alter_column("items", "category", server_default=None)
    op.alter_column("items", "icon_key", server_default=None)
    op.alter_column("items", "sort_order", server_default=None)
    op.alter_column("items", "is_active", server_default=None)


def downgrade() -> None:
    for column_name in (
        "updated_at",
        "is_active",
        "sort_order",
        "icon_key",
        "image_url",
        "category",
    ):
        if column_exists("items", column_name):
            op.drop_column("items", column_name)
