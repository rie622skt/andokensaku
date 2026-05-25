"""Run with: uv run python scripts/smoke_cache.py

Exercises the SQLite cache layer end-to-end without touching the CSE API.
"""
from __future__ import annotations

import asyncio
import tempfile
from pathlib import Path

from mcp_search_server.cache import Cache
from mcp_search_server.normalize import cache_key_and, cache_key_simple


async def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        cache = Cache(Path(tmp) / "cse.db")

        # Miss + put
        key = cache_key_simple("東京")
        assert await cache.get(key) is None
        await cache.put(
            cache_key=key, raw_query="東京", variant="simple", total_results=12345
        )

        # Hit
        hit = await cache.get(key)
        assert hit is not None
        assert hit.total_results == 12345

        # AND key is order-independent
        k1 = cache_key_and("東京", "寿司")
        k2 = cache_key_and("寿司", "東京")
        assert k1 == k2, (k1, k2)

        # Quota counter
        for i in range(3):
            count = await cache.increment_quota()
            assert count == i + 1

        stats = await cache.stats()
        print("stats:", stats)
        assert stats["cache_hits"] >= 1
        assert stats["cache_misses"] >= 1
        assert stats["quota_used_today"] == 3
        assert stats["cached_entries"] == 1

    print("OK")


if __name__ == "__main__":
    asyncio.run(main())
