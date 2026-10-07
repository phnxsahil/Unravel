"""Add local experiment recipes, runs and artifact references."""
from alembic import op
import sqlalchemy as sa

revision = "0002_experiments"
down_revision = "0001_workshop"
branch_labels = None
depends_on = None

def upgrade():
    for name in ("recipes", "experiment_runs", "artifacts"):
        op.create_table(name, sa.Column("id", sa.String, primary_key=True),
            sa.Column("project_id", sa.String, index=True), sa.Column("snapshot_id", sa.String, index=True),
            sa.Column("parent_id", sa.String, index=True), sa.Column("created_at", sa.String, nullable=False),
            sa.Column("updated_at", sa.String, nullable=False), sa.Column("data", sa.JSON, nullable=False))

def downgrade():
    for name in ("artifacts", "experiment_runs", "recipes"):
        op.drop_table(name)
