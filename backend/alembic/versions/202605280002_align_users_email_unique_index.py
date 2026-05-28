"""align users email unique index

Revision ID: 202605280002
Revises: 202605280001
Create Date: 2026-05-28 00:02:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202605280002"
down_revision: str | None = "202605280001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def index_exists(table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        index["name"] == index_name
        for index in inspector.get_indexes(table_name)
    )


def unique_constraint_exists(table_name: str, constraint_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        constraint["name"] == constraint_name
        for constraint in inspector.get_unique_constraints(table_name)
    )


def upgrade() -> None:
    if unique_constraint_exists("users", "uq_users_email"):
        op.drop_constraint("uq_users_email", "users", type_="unique")

    if index_exists("users", "ix_users_email"):
        op.drop_index(op.f("ix_users_email"), table_name="users")

    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)


def downgrade() -> None:
    if index_exists("users", "ix_users_email"):
        op.drop_index(op.f("ix_users_email"), table_name="users")

    if not unique_constraint_exists("users", "uq_users_email"):
        op.create_unique_constraint("uq_users_email", "users", ["email"])

    if not index_exists("users", "ix_users_email"):
        op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
