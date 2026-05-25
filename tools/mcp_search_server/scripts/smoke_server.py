"""Run with: uv run python scripts/smoke_server.py

Drives the FastMCP server programmatically: imports it, calls cache_stats
(no API access required), and asserts it returns sane values.
"""
from __future__ import annotations

import asyncio
import os
import tempfile
from pathlib import Path

# Force a temp DB so we don't pollute the repo's .cache during smoke.
os.environ.setdefault("GOOGLE_CSE_API_KEY", "dummy")
os.environ.setdefault("GOOGLE_CSE_CX", "dummy")

tmp_db = Path(tempfile.gettempdir()) / "mcp_smoke_cse.db"
if tmp_db.exists():
    tmp_db.unlink()
os.environ["MCP_CACHE_DB_PATH"] = str(tmp_db)


from mcp_search_server import server  # noqa: E402


async def main() -> None:
    stats = await server.cache_stats()
    print("cache_stats:", stats)
    assert stats["quota_limit"] == 100
    assert stats["quota_remaining_today"] == 100
    assert stats["cached_entries"] == 0
    print("OK")


if __name__ == "__main__":
    asyncio.run(main())
