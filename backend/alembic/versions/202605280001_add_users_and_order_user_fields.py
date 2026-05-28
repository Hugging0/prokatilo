"""add users and order user fields

Revision ID: 202605280001
Revises: 202605270003
Create Date: 2026-05-28 00:01:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202605280001"
down_revision: str | None = "202605270003"
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


def foreign_key_exists(table_name: str, constraint_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        constraint["name"] == constraint_name
        for constraint in inspector.get_foreign_keys(table_name)
    )


def upgrade() -> None:
    if not table_exists("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("phone", sa.String(length=50), nullable=True),
            sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
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

    if not index_exists("users", "ix_users_id"):
        op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    if not index_exists("users", "ix_users_email"):
        op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    if not column_exists("orders", "user_id"):
        op.add_column("orders", sa.Column("user_id", sa.Integer(), nullable=True))

    if not column_exists("orders", "customer_email"):
        op.add_column(
            "orders",
            sa.Column("customer_email", sa.String(length=255), nullable=True),
        )

    if not foreign_key_exists("orders", "fk_orders_user_id_users"):
        op.create_foreign_key(
            "fk_orders_user_id_users",
            "orders",
            "users",
            ["user_id"],
            ["id"],
        )


def downgrade() -> None:
    if foreign_key_exists("orders", "fk_orders_user_id_users"):
        op.drop_constraint("fk_orders_user_id_users", "orders", type_="foreignkey")

    if column_exists("orders", "customer_email"):
        op.drop_column("orders", "customer_email")

    if column_exists("orders", "user_id"):
        op.drop_column("orders", "user_id")

    if table_exists("users"):
        if index_exists("users", "ix_users_email"):
            op.drop_index(op.f("ix_users_email"), table_name="users")
        if index_exists("users", "ix_users_id"):
            op.drop_index(op.f("ix_users_id"), table_name="users")
        op.drop_table("users")
