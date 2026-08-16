"""add MXMEDIA Black Magnet catalog item

Revision ID: 202608150001
Revises: 202608050001
Create Date: 2026-08-15 17:30:00.000000

"""

from collections.abc import Sequence
import json
from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision: str = "202608150001"
down_revision: str | None = "202608050001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ITEM_TITLE = "Микронаушник MXMEDIA Black Magnet"


def load_instruction() -> dict[str, object]:
    data_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "catalog_instructions.v1.json"
    )
    entries = json.loads(data_path.read_text(encoding="utf-8"))

    for entry in entries:
        if ITEM_TITLE in entry["titles"]:
            return entry["instruction"]

    raise RuntimeError(f"Instruction not found for {ITEM_TITLE}")


def upgrade() -> None:
    connection = op.get_bind()
    items = sa.table(
        "items",
        sa.column("id", sa.Integer()),
        sa.column("title", sa.String()),
        sa.column("description", sa.String()),
        sa.column("category", sa.String()),
        sa.column("image_url", sa.String()),
        sa.column("icon_key", sa.String()),
        sa.column("sort_order", sa.Integer()),
        sa.column("price_per_3h", sa.Numeric()),
        sa.column("price_per_24h", sa.Numeric()),
        sa.column("price_per_7d", sa.Numeric()),
        sa.column("is_available", sa.Boolean()),
        sa.column("is_active", sa.Boolean()),
        sa.column("instruction", sa.JSON()),
        sa.column("instruction_is_published", sa.Boolean()),
    )
    instruction = load_instruction()
    existing_id = connection.execute(
        sa.select(items.c.id).where(items.c.title == ITEM_TITLE),
    ).scalar_one_or_none()

    if existing_id is None:
        connection.execute(
            items.insert().values(
                title=ITEM_TITLE,
                description=(
                    "Магнитный Bluetooth-комплект с петлей, адаптивным "
                    "микрофоном, безопасными динамиками и набором "
                    "магнитных элементов."
                ),
                category="Гаджеты",
                image_url=(
                    "/uploads/catalog/items/transparent/"
                    "mxmedia-black-magnet.webp"
                ),
                icon_key="headphones",
                sort_order=90,
                price_per_3h=500,
                price_per_24h=700,
                price_per_7d=2600,
                is_available=True,
                is_active=True,
                instruction=instruction,
                instruction_is_published=True,
            ),
        )
        return

    connection.execute(
        items.update()
        .where(items.c.id == existing_id)
        .where(items.c.instruction.is_(None))
        .values(
            instruction=instruction,
            instruction_is_published=True,
        ),
    )


def downgrade() -> None:
    # Keep catalog data intact so existing orders cannot lose their item link.
    pass
