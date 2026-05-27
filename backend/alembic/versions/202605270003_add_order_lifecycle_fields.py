"""add order lifecycle fields

Revision ID: 202605270003
Revises: 202605270002
Create Date: 2026-05-27 00:03:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202605270003"
down_revision: str | None = "202605270002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        column["name"] == column_name
        for column in inspector.get_columns(table_name)
    )


def upgrade() -> None:
    if not column_exists("orders", "customer_name"):
        op.add_column(
            "orders",
            sa.Column(
                "customer_name",
                sa.String(length=255),
                server_default="Клиент",
                nullable=False,
            ),
        )
        op.execute(
            "UPDATE orders SET customer_name = COALESCE(customer_login, 'Клиент')",
        )

    if not column_exists("orders", "delivery_address"):
        op.add_column(
            "orders",
            sa.Column(
                "delivery_address",
                sa.String(length=500),
                server_default="Адрес уточнит оператор",
                nullable=False,
            ),
        )

    if not column_exists("orders", "payment_method"):
        op.add_column(
            "orders",
            sa.Column(
                "payment_method",
                sa.String(length=50),
                server_default="cash",
                nullable=False,
            ),
        )

    if not column_exists("orders", "comment"):
        op.add_column(
            "orders",
            sa.Column("comment", sa.String(length=1000), nullable=True),
        )

    if not column_exists("orders", "rental_date"):
        op.add_column(
            "orders",
            sa.Column(
                "rental_date",
                sa.String(length=20),
                server_default="",
                nullable=False,
            ),
        )

    if not column_exists("orders", "rental_time"):
        op.add_column(
            "orders",
            sa.Column(
                "rental_time",
                sa.String(length=20),
                server_default="",
                nullable=False,
            ),
        )

    if not column_exists("orders", "updated_at"):
        op.add_column(
            "orders",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )

    op.execute(
        "UPDATE orders SET delivery_address = 'Адрес уточнит оператор' "
        "WHERE delivery_address = '' OR delivery_address IS NULL",
    )
    op.execute(
        "UPDATE orders SET rental_date = COALESCE(TO_CHAR(created_at, 'YYYY-MM-DD'), '') "
        "WHERE rental_date = '' OR rental_date IS NULL",
    )
    op.execute(
        "UPDATE orders SET rental_time = COALESCE(TO_CHAR(created_at, 'HH24:MI'), '') "
        "WHERE rental_time = '' OR rental_time IS NULL",
    )

    op.alter_column("orders", "customer_name", server_default=None)
    op.alter_column("orders", "delivery_address", server_default=None)
    op.alter_column("orders", "payment_method", server_default=None)
    op.alter_column("orders", "rental_date", server_default=None)
    op.alter_column("orders", "rental_time", server_default=None)


def downgrade() -> None:
    for column_name in (
        "updated_at",
        "rental_time",
        "rental_date",
        "comment",
        "payment_method",
        "delivery_address",
        "customer_name",
    ):
        if column_exists("orders", column_name):
            op.drop_column("orders", column_name)
