"""engagement metrics + likes + user avatar

Adds users.avatar_url, cards.views_count / cards.clicks_count (backfilled to 0),
and the card_likes table (composite PK user_id+card_id). Batch mode keeps the
ALTERs working on the SQLite dev database (same pattern as 0002).

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-06

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('avatar_url', sa.String(length=500), nullable=True))

    # NOT NULL with server_default='0' backfills existing rows with 0 counts
    with op.batch_alter_table('cards') as batch_op:
        batch_op.add_column(
            sa.Column('views_count', sa.Integer(), nullable=False, server_default='0')
        )
        batch_op.add_column(
            sa.Column('clicks_count', sa.Integer(), nullable=False, server_default='0')
        )

    op.create_table(
        'card_likes',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('card_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['card_id'], ['cards.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'card_id'),
    )
    op.create_index(op.f('ix_card_likes_card_id'), 'card_likes', ['card_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_card_likes_card_id'), table_name='card_likes')
    op.drop_table('card_likes')

    with op.batch_alter_table('cards') as batch_op:
        batch_op.drop_column('clicks_count')
        batch_op.drop_column('views_count')

    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('avatar_url')
