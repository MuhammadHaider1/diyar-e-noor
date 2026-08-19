"""fix halal_relationships category slug

Revision ID: a1b2c3d4e5f6
Revises: 92f4519f1d69
Create Date: 2026-08-20
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '92f4519f1d69'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE postcategory ADD VALUE IF NOT EXISTS 'halalrelationship'")

    op.execute("UPDATE categories SET slug = 'halal_relationships' WHERE slug = 'halalrelationship'")


def downgrade() -> None:
    op.execute("UPDATE categories SET slug = 'halalrelationship' WHERE slug = 'halal_relationships'")
