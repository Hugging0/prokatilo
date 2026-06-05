"""add loyalty and promo codes

Revision ID: 202606050001
Revises: 202606010001
Create Date: 2026-06-05 11:30:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606050001"
down_revision: str | None = "202606010001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def table_exists(table_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return table_name in inspector.get_table_names()


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
    if not table_exists("loyalty_accounts"):
        op.create_table(
            "loyalty_accounts",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("balance", sa.Numeric(10, 2), nullable=False, server_default="0"),
            sa.Column(
                "lifetime_earned",
                sa.Numeric(10, 2),
                nullable=False,
                server_default="0",
            ),
            sa.Column(
                "lifetime_spent",
                sa.Numeric(10, 2),
                nullable=False,
                server_default="0",
            ),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("user_id"),
        )
        op.create_index("ix_loyalty_accounts_id", "loyalty_accounts", ["id"])
        op.create_index("ix_loyalty_accounts_user_id", "loyalty_accounts", ["user_id"])

    if not table_exists("promo_codes"):
        op.create_table(
            "promo_codes",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("code", sa.String(length=50), nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("description", sa.String(length=500), nullable=True),
            sa.Column("kind", sa.String(length=50), nullable=False),
            sa.Column("discount_percent", sa.Numeric(10, 2), nullable=True),
            sa.Column("discount_amount", sa.Numeric(10, 2), nullable=True),
            sa.Column("bonus_amount", sa.Numeric(10, 2), nullable=True),
            sa.Column("min_order_amount", sa.Numeric(10, 2), nullable=True),
            sa.Column("max_uses", sa.Integer(), nullable=True),
            sa.Column("used_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("max_uses_per_user", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
            sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("code"),
        )
        op.create_index("ix_promo_codes_id", "promo_codes", ["id"])
        op.create_index("ix_promo_codes_code", "promo_codes", ["code"])

    if not column_exists("orders", "subtotal_price"):
        op.add_column(
            "orders",
            sa.Column("subtotal_price", sa.Numeric(10, 2), nullable=True),
        )
    if not column_exists("orders", "promo_code_id"):
        op.add_column(
            "orders",
            sa.Column("promo_code_id", sa.Integer(), nullable=True),
        )
        op.create_foreign_key(
            "fk_orders_promo_code_id_promo_codes",
            "orders",
            "promo_codes",
            ["promo_code_id"],
            ["id"],
        )
    if not column_exists("orders", "promo_discount_amount"):
        op.add_column(
            "orders",
            sa.Column(
                "promo_discount_amount",
                sa.Numeric(10, 2),
                nullable=False,
                server_default="0",
            ),
        )
    if not column_exists("orders", "bonus_spent_amount"):
        op.add_column(
            "orders",
            sa.Column(
                "bonus_spent_amount",
                sa.Numeric(10, 2),
                nullable=False,
                server_default="0",
            ),
        )
    if not column_exists("orders", "bonus_earned_amount"):
        op.add_column(
            "orders",
            sa.Column(
                "bonus_earned_amount",
                sa.Numeric(10, 2),
                nullable=False,
                server_default="0",
            ),
        )
    if not column_exists("orders", "loyalty_processed_at"):
        op.add_column(
            "orders",
            sa.Column("loyalty_processed_at", sa.DateTime(timezone=True), nullable=True),
        )

    op.execute("UPDATE orders SET subtotal_price = total_price WHERE subtotal_price IS NULL")
    op.alter_column("orders", "subtotal_price", nullable=False)

    if not table_exists("loyalty_transactions"):
        op.create_table(
            "loyalty_transactions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("order_id", sa.Integer(), nullable=True),
            sa.Column("promo_code_id", sa.Integer(), nullable=True),
            sa.Column("type", sa.String(length=50), nullable=False),
            sa.Column("amount", sa.Numeric(10, 2), nullable=False),
            sa.Column("description", sa.String(length=500), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
            sa.ForeignKeyConstraint(["promo_code_id"], ["promo_codes.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_loyalty_transactions_id", "loyalty_transactions", ["id"])
        op.create_index("ix_loyalty_transactions_user_id", "loyalty_transactions", ["user_id"])

    if not table_exists("promo_code_redemptions"):
        op.create_table(
            "promo_code_redemptions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("promo_code_id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("order_id", sa.Integer(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
            sa.ForeignKeyConstraint(["promo_code_id"], ["promo_codes.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_promo_code_redemptions_id", "promo_code_redemptions", ["id"])

    if not index_exists(
        "promo_code_redemptions",
        "ix_promo_code_redemptions_promo_user",
    ):
        op.create_index(
            "ix_promo_code_redemptions_promo_user",
            "promo_code_redemptions",
            ["promo_code_id", "user_id"],
        )


def downgrade() -> None:
    if table_exists("promo_code_redemptions"):
        if index_exists("promo_code_redemptions", "ix_promo_code_redemptions_promo_user"):
            op.drop_index(
                "ix_promo_code_redemptions_promo_user",
                table_name="promo_code_redemptions",
            )
        op.drop_table("promo_code_redemptions")

    if table_exists("loyalty_transactions"):
        op.drop_table("loyalty_transactions")

    for column_name in (
        "loyalty_processed_at",
        "bonus_earned_amount",
        "bonus_spent_amount",
        "promo_discount_amount",
        "promo_code_id",
        "subtotal_price",
    ):
        if column_exists("orders", column_name):
            op.drop_column("orders", column_name)

    if table_exists("promo_codes"):
        op.drop_table("promo_codes")

    if table_exists("loyalty_accounts"):
        op.drop_table("loyalty_accounts")
