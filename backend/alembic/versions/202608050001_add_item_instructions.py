"""add item instructions and Telegram support contact

Revision ID: 202608050001
Revises: 202606240002
Create Date: 2026-08-05 22:00:00.000000

"""

from collections.abc import Sequence
import json
from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision: str = "202608050001"
down_revision: str | None = "202606240002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(
        column["name"] == column_name
        for column in inspector.get_columns(table_name)
    )


def load_instruction_entries() -> list[dict[str, object]]:
    data_path = (
        Path(__file__).resolve().parents[2]
        / "data"
        / "catalog_instructions.v1.json"
    )
    return json.loads(data_path.read_text(encoding="utf-8"))


def upgrade() -> None:
    if not column_exists("items", "instruction"):
        op.add_column("items", sa.Column("instruction", sa.JSON(), nullable=True))

    if not column_exists("items", "instruction_is_published"):
        op.add_column(
            "items",
            sa.Column(
                "instruction_is_published",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )

    if not column_exists("service_settings", "support_telegram_url"):
        op.add_column(
            "service_settings",
            sa.Column("support_telegram_url", sa.String(length=2048), nullable=True),
        )

    connection = op.get_bind()
    items = sa.table(
        "items",
        sa.column("title", sa.String()),
        sa.column("instruction", sa.JSON()),
        sa.column("instruction_is_published", sa.Boolean()),
    )

    for entry in load_instruction_entries():
        connection.execute(
            items.update()
            .where(items.c.title.in_(entry["titles"]))
            .where(items.c.instruction.is_(None))
            .values(
                instruction=entry["instruction"],
                instruction_is_published=True,
            ),
        )

    connection.execute(
        items.update()
        .where(items.c.title == "PlayStation VR")
        .values(title="PlayStation VR2"),
    )

    service_settings = sa.table(
        "service_settings",
        sa.column("support_telegram_url", sa.String()),
    )
    connection.execute(
        service_settings.update()
        .where(service_settings.c.support_telegram_url.is_(None))
        .values(support_telegram_url="https://t.me/xapkoofff"),
    )


def downgrade() -> None:
    if column_exists("service_settings", "support_telegram_url"):
        op.drop_column("service_settings", "support_telegram_url")

    if column_exists("items", "instruction_is_published"):
        op.drop_column("items", "instruction_is_published")

    if column_exists("items", "instruction"):
        op.drop_column("items", "instruction")
