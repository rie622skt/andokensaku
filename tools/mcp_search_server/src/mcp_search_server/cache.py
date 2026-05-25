from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import aiosqlite

SCHEMA = """
CREATE TABLE IF NOT EXISTS queries (
    cache_key     TEXT PRIMARY KEY,
    raw_query     TEXT NOT NULL,
    variant       TEXT NOT NULL,
    total_results INTEGER NOT NULL,
    fetched_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quota_usage (
    date_utc   TEXT PRIMARY KEY,
    call_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hit_stats (
    id          INTEGER PRIMARY KEY CHECK (id = 1),
    cache_hits   INTEGER NOT NULL DEFAULT 0,
    cache_misses INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO hit_stats(id, cache_hits, cache_misses) VALUES (1, 0, 0);
"""


@dataclass(frozen=True, slots=True)
class CachedResult:
    cache_key: str
    raw_query: str
    variant: str
    total_results: int
    fetched_at: str


def _today_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _now_iso_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Cache:
    """Async SQLite cache + daily-quota counter for CSE results."""

    def __init__(self, db_path: Path) -> None:
        self._db_path = db_path
        self._initialized = False

    async def _ensure_open(self) -> aiosqlite.Connection:
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = await aiosqlite.connect(self._db_path)
        conn.row_factory = aiosqlite.Row
        if not self._initialized:
            await conn.executescript(SCHEMA)
            await conn.commit()
            self._initialized = True
        return conn

    async def get(self, cache_key: str) -> CachedResult | None:
        conn = await self._ensure_open()
        try:
            async with conn.execute(
                "SELECT cache_key, raw_query, variant, total_results, fetched_at "
                "FROM queries WHERE cache_key = ?",
                (cache_key,),
            ) as cur:
                row = await cur.fetchone()
            if row is None:
                await conn.execute(
                    "UPDATE hit_stats SET cache_misses = cache_misses + 1 WHERE id = 1"
                )
                await conn.commit()
                return None
            await conn.execute(
                "UPDATE hit_stats SET cache_hits = cache_hits + 1 WHERE id = 1"
            )
            await conn.commit()
            return CachedResult(
                cache_key=row["cache_key"],
                raw_query=row["raw_query"],
                variant=row["variant"],
                total_results=row["total_results"],
                fetched_at=row["fetched_at"],
            )
        finally:
            await conn.close()

    async def put(
        self,
        *,
        cache_key: str,
        raw_query: str,
        variant: str,
        total_results: int,
    ) -> CachedResult:
        fetched_at = _now_iso_utc()
        conn = await self._ensure_open()
        try:
            await conn.execute(
                "INSERT OR REPLACE INTO queries"
                "(cache_key, raw_query, variant, total_results, fetched_at) "
                "VALUES (?, ?, ?, ?, ?)",
                (cache_key, raw_query, variant, total_results, fetched_at),
            )
            await conn.commit()
        finally:
            await conn.close()
        return CachedResult(
            cache_key=cache_key,
            raw_query=raw_query,
            variant=variant,
            total_results=total_results,
            fetched_at=fetched_at,
        )

    async def quota_used_today(self) -> int:
        conn = await self._ensure_open()
        try:
            async with conn.execute(
                "SELECT call_count FROM quota_usage WHERE date_utc = ?",
                (_today_utc(),),
            ) as cur:
                row = await cur.fetchone()
            return int(row["call_count"]) if row else 0
        finally:
            await conn.close()

    async def increment_quota(self) -> int:
        today = _today_utc()
        conn = await self._ensure_open()
        try:
            await conn.execute(
                "INSERT INTO quota_usage(date_utc, call_count) VALUES (?, 1) "
                "ON CONFLICT(date_utc) DO UPDATE SET call_count = call_count + 1",
                (today,),
            )
            await conn.commit()
            async with conn.execute(
                "SELECT call_count FROM quota_usage WHERE date_utc = ?",
                (today,),
            ) as cur:
                row = await cur.fetchone()
            return int(row["call_count"]) if row else 0
        finally:
            await conn.close()

    async def stats(self) -> dict[str, int]:
        conn = await self._ensure_open()
        try:
            async with conn.execute(
                "SELECT cache_hits, cache_misses FROM hit_stats WHERE id = 1"
            ) as cur:
                hits_row = await cur.fetchone()
            async with conn.execute(
                "SELECT call_count FROM quota_usage WHERE date_utc = ?",
                (_today_utc(),),
            ) as cur:
                quota_row = await cur.fetchone()
            async with conn.execute("SELECT COUNT(*) AS n FROM queries") as cur:
                count_row = await cur.fetchone()
            cache_hits = int(hits_row["cache_hits"]) if hits_row else 0
            cache_misses = int(hits_row["cache_misses"]) if hits_row else 0
            quota_used = int(quota_row["call_count"]) if quota_row else 0
            entries = int(count_row["n"]) if count_row else 0
            return {
                "cache_hits": cache_hits,
                "cache_misses": cache_misses,
                "cached_entries": entries,
                "quota_used_today": quota_used,
            }
        finally:
            await conn.close()
