"""Small versioned SQLite repository. One connection/transaction per operation."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy import (
    JSON,
    Column,
    Integer,
    MetaData,
    String,
    Table,
    create_engine,
    delete,
    event,
    insert,
    select,
    update,
)


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Storage:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        self.engine = create_engine(
            f"sqlite:///{path.as_posix()}",
            connect_args={"check_same_thread": False, "timeout": 15},
        )

        @event.listens_for(self.engine, "connect")
        def configure(connection, _):
            connection.execute("PRAGMA journal_mode=WAL")
            connection.execute("PRAGMA foreign_keys=ON")
            connection.execute("PRAGMA busy_timeout=15000")

        self.meta = MetaData()
        self.tables: dict[str, Table] = {}
        for name in [
            "projects",
            "snapshots",
            "features",
            "investigations",
            "discoveries",
            "profiles",
            "checks",
            "jobs",
            "recipes",
            "experiment_runs",
            "artifacts",
        ]:
            self.tables[name] = Table(
                name,
                self.meta,
                Column("id", String, primary_key=True),
                Column("project_id", String, index=True),
                Column("snapshot_id", String, index=True),
                Column("parent_id", String, index=True),
                Column("created_at", String, nullable=False),
                Column("updated_at", String, nullable=False),
                Column("data", JSON, nullable=False),
            )
        self.events = Table(
            "events",
            self.meta,
            Column("id", Integer, primary_key=True, autoincrement=True),
            Column("job_id", String, index=True, nullable=False),
            Column("data", JSON, nullable=False),
        )
        from alembic import command
        from alembic.config import Config

        config = Config()
        config.set_main_option(
            "script_location", str(Path(__file__).parent / "migrations")
        )
        with self.engine.begin() as c:
            config.attributes["connection"] = c
            command.upgrade(config, "head")

    def create(
        self,
        kind: str,
        data: dict[str, Any],
        *,
        project_id: str | None = None,
        snapshot_id: str | None = None,
        parent_id: str | None = None,
    ) -> dict:
        item = {
            "id": str(uuid.uuid4()),
            "project_id": project_id,
            "snapshot_id": snapshot_id,
            "parent_id": parent_id,
            "created_at": now(),
            "updated_at": now(),
            "data": data,
        }
        with self.engine.begin() as c:
            c.execute(insert(self.tables[kind]).values(**item))
        return self._flatten(item)

    @staticmethod
    def _flatten(item) -> dict:
        d = dict(item)
        return {**d.pop("data"), **d}

    def get(self, kind: str, identifier: str) -> dict | None:
        t = self.tables[kind]
        with self.engine.connect() as c:
            row = c.execute(select(t).where(t.c.id == identifier)).mappings().first()
        return self._flatten(row) if row else None

    def list(
        self,
        kind: str,
        *,
        project_id: str | None = None,
        snapshot_id: str | None = None,
        parent_id: str | None = None,
    ) -> list[dict]:
        t = self.tables[kind]
        query = select(t).order_by(t.c.created_at.desc())
        for key, value in [
            ("project_id", project_id),
            ("snapshot_id", snapshot_id),
            ("parent_id", parent_id),
        ]:
            if value is not None:
                query = query.where(t.c[key] == value)
        with self.engine.connect() as c:
            return [self._flatten(r) for r in c.execute(query).mappings()]

    def patch(self, kind: str, identifier: str, changes: dict) -> dict:
        t = self.tables[kind]
        with self.engine.begin() as c:
            row = c.execute(select(t).where(t.c.id == identifier)).mappings().first()
            if not row:
                raise KeyError(identifier)
            data = {**row["data"], **changes}
            c.execute(
                update(t)
                .where(t.c.id == identifier)
                .values(data=data, updated_at=now())
            )
        return self.get(kind, identifier)  # type: ignore[return-value]

    def remove_project(self, identifier: str) -> None:
        with self.engine.begin() as c:
            snapshot_ids = [
                r[0]
                for r in c.execute(
                    select(self.tables["snapshots"].c.id).where(
                        self.tables["snapshots"].c.project_id == identifier
                    )
                )
            ]
            for sid in snapshot_ids:
                c.exec_driver_sql(
                    "DELETE FROM source_search WHERE snapshot_id = ?", (sid,)
                )
            job_ids = [
                r[0]
                for r in c.execute(
                    select(self.tables["jobs"].c.id).where(
                        self.tables["jobs"].c.project_id == identifier
                    )
                )
            ]
            if job_ids:
                c.execute(delete(self.events).where(self.events.c.job_id.in_(job_ids)))
            for name, table in self.tables.items():
                c.execute(
                    delete(table).where(
                        table.c.id == identifier
                        if name == "projects"
                        else table.c.project_id == identifier
                    )
                )

    def index(self, snapshot_id: str, files: list[dict]) -> None:
        with self.engine.begin() as c:
            c.exec_driver_sql(
                "DELETE FROM source_search WHERE snapshot_id = ?", (snapshot_id,)
            )
            for f in files:
                c.exec_driver_sql(
                    "INSERT INTO source_search(snapshot_id,path,body) VALUES (?,?,?)",
                    (snapshot_id, f["path"], f["body"]),
                )

    def search(self, snapshot_id: str, question: str, limit: int = 8) -> list[str]:
        import re

        words = re.findall(r"[\w]+", question)[:16]
        if not words:
            return []
        expression = " OR ".join('"' + word.replace('"', "") + '"' for word in words)
        with self.engine.connect() as c:
            rows = c.exec_driver_sql(
                "SELECT path FROM source_search WHERE source_search MATCH ? AND snapshot_id = ? ORDER BY bm25(source_search) LIMIT ?",
                (expression, snapshot_id, limit),
            )
            return [r[0] for r in rows]

    def emit(self, job_id: str, data: dict) -> None:
        with self.engine.begin() as c:
            c.execute(
                insert(self.events).values(job_id=job_id, data={**data, "time": now()})
            )

    def event_list(self, job_id: str, after: int = 0) -> list[dict]:
        with self.engine.connect() as c:
            rows = c.execute(
                select(self.events)
                .where(self.events.c.job_id == job_id, self.events.c.id > after)
                .order_by(self.events.c.id)
            ).mappings()
            return [{"id": r["id"], **r["data"]} for r in rows]
