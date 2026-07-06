"""events.date_start nullable (U6/U7: ApiEvent contract allows a missing start date)

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-06

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # batch mode so the ALTER also works on SQLite dev databases
    with op.batch_alter_table('events') as batch_op:
        batch_op.alter_column('date_start', existing_type=sa.Date(), nullable=True)


def downgrade() -> None:
    with op.batch_alter_table('events') as batch_op:
        batch_op.alter_column('date_start', existing_type=sa.Date(), nullable=False)
