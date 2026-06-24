"""add delivery addresses

Revision ID: 202606240002
Revises: 202606240001
Create Date: 2026-06-24 18:40:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606240002"
down_revision: str | None = "202606240001"
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
    if not table_exists("delivery_addresses"):
        op.create_table(
            "delivery_addresses",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("osm_type", sa.String(length=20), nullable=False),
            sa.Column("osm_id", sa.String(length=50), nullable=False),
            sa.Column("display_name", sa.String(length=500), nullable=False),
            sa.Column("street", sa.String(length=255), nullable=False),
            sa.Column("house_number", sa.String(length=50), nullable=True),
            sa.Column("normalized_street", sa.String(length=255), nullable=False),
            sa.Column("normalized_house", sa.String(length=50), nullable=True),
            sa.Column("lat", sa.Float(), nullable=False),
            sa.Column("lon", sa.Float(), nullable=False),
            sa.Column("distance_m", sa.Integer(), nullable=False),
            sa.Column("source", sa.String(length=50), nullable=False),
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

    indexes = (
        ("ix_delivery_addresses_id", ["id"], False),
        ("ix_delivery_addresses_street", ["street"], False),
        ("ix_delivery_addresses_normalized_street", ["normalized_street"], False),
        ("ix_delivery_addresses_normalized_house", ["normalized_house"], False),
        ("ix_delivery_addresses_distance_m", ["distance_m"], False),
        (
            "ix_delivery_addresses_street_house",
            ["normalized_street", "normalized_house"],
            False,
        ),
        ("ix_delivery_addresses_osm_ref", ["osm_type", "osm_id"], True),
    )

    for index_name, columns, unique in indexes:
        if not index_exists("delivery_addresses", index_name):
            op.create_index(index_name, "delivery_addresses", columns, unique=unique)


def downgrade() -> None:
    if table_exists("delivery_addresses"):
        op.drop_table("delivery_addresses")
