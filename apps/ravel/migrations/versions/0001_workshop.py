"""Initial workshop notebook, snapshots, jobs and source search."""

from alembic import op
import sqlalchemy as sa

revision = "0001_workshop"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    metadata = sa.MetaData()
    for name in [
        "projects",
        "snapshots",
        "features",
        "investigations",
        "discoveries",
        "profiles",
        "checks",
        "jobs",
    ]:
        sa.Table(
            name,
            metadata,
            sa.Column("id", sa.String, primary_key=True),
            sa.Column("project_id", sa.String, index=True),
            sa.Column("snapshot_id", sa.String, index=True),
            sa.Column("parent_id", sa.String, index=True),
            sa.Column("created_at", sa.String, nullable=False),
            sa.Column("updated_at", sa.String, nullable=False),
            sa.Column("data", sa.JSON, nullable=False),
        )
    sa.Table(
        "events",
        metadata,
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("job_id", sa.String, index=True, nullable=False),
        sa.Column("data", sa.JSON, nullable=False),
    )
    # checkfirst upgrades the first development database without losing notes.
    metadata.create_all(op.get_bind(), checkfirst=True)
    op.execute(
        "CREATE VIRTUAL TABLE IF NOT EXISTS source_search USING fts5(snapshot_id UNINDEXED, path, body, tokenize='unicode61')"
    )


def downgrade():
    op.execute("DROP TABLE IF EXISTS source_search")
    for name in [
        "events",
        "jobs",
        "checks",
        "profiles",
        "discoveries",
        "investigations",
        "features",
        "snapshots",
        "projects",
    ]:
        op.drop_table(name)
