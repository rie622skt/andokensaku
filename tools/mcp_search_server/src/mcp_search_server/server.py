from __future__ import annotations

import asyncio
from typing import Any

from mcp.server.fastmcp import FastMCP

from .cache import Cache
from .config import get_settings
from .cse_client import CSEClient, QuotaExceededError
from .normalize import cache_key_and, cache_key_simple, normalize_query


mcp = FastMCP("search-hit-count")

_cache: Cache | None = None
_client: CSEClient | None = None
_lock = asyncio.Lock()


def _get_cache() -> Cache:
    global _cache
    if _cache is None:
        _cache = Cache(get_settings().cache_db_path)
    return _cache


def _get_client() -> CSEClient:
    global _client
    if _client is None:
        s = get_settings()
        _client = CSEClient(
            api_key=s.google_cse_api_key,
            cx=s.google_cse_cx,
            timeout_sec=s.request_timeout_sec,
        )
    return _client


async def _quota_check_and_consume() -> int:
    """Reserve one quota slot for an upcoming API call.

    Returns the new count. Raises QuotaExceededError if the daily limit
    would be exceeded.
    """
    cache = _get_cache()
    limit = get_settings().daily_quota
    used = await cache.quota_used_today()
    if used >= limit:
        raise QuotaExceededError(
            f"Daily CSE quota exhausted ({used}/{limit}). Retry tomorrow (UTC)."
        )
    return await cache.increment_quota()


async def _lookup_or_fetch(
    *, raw_query: str, cache_key: str, variant: str, api_query: str
) -> dict[str, Any]:
    cache = _get_cache()
    async with _lock:
        cached = await cache.get(cache_key)
        if cached is not None:
            return {
                "query": raw_query,
                "normalized": normalize_query(raw_query)
                if variant == "simple"
                else cache_key.removeprefix("and:"),
                "variant": variant,
                "total_results": cached.total_results,
                "fetched_at": cached.fetched_at,
                "source": "cache",
            }
        await _quota_check_and_consume()
        client = _get_client()
        total = await client.total_results(api_query)
        stored = await cache.put(
            cache_key=cache_key,
            raw_query=raw_query,
            variant=variant,
            total_results=total,
        )
        return {
            "query": raw_query,
            "normalized": normalize_query(raw_query)
            if variant == "simple"
            else cache_key.removeprefix("and:"),
            "variant": variant,
            "total_results": stored.total_results,
            "fetched_at": stored.fetched_at,
            "source": "api",
        }


@mcp.tool()
async def search_hit_count(query: str) -> dict[str, Any]:
    """Return the estimated Google search hit count for a single query.

    Caches results in SQLite — repeat queries never spend daily quota.
    """
    normalized = normalize_query(query)
    if not normalized:
        raise ValueError("query must be non-empty after normalization")
    return await _lookup_or_fetch(
        raw_query=query,
        cache_key=cache_key_simple(query),
        variant="simple",
        api_query=normalized,
    )


@mcp.tool()
async def batch_hit_count(queries: list[str]) -> list[dict[str, Any]]:
    """Look up hit counts for many queries sequentially.

    Cached entries return instantly; uncached entries are fetched one at a
    time to respect the per-day quota. Stops early with a partial list if
    quota is hit mid-batch (last item will include an `error` field).
    """
    if not queries:
        return []
    results: list[dict[str, Any]] = []
    for q in queries:
        try:
            results.append(await search_hit_count(q))
        except QuotaExceededError as exc:
            results.append(
                {
                    "query": q,
                    "error": str(exc),
                    "source": "error",
                }
            )
            break
    return results


@mcp.tool()
async def and_hit_count(term_a: str, term_b: str) -> dict[str, Any]:
    """Return hit count for an AND search of two terms (panel9 use case)."""
    norm_a = normalize_query(term_a)
    norm_b = normalize_query(term_b)
    if not norm_a or not norm_b:
        raise ValueError("both terms must be non-empty after normalization")
    api_query = f"{norm_a} {norm_b}"
    return await _lookup_or_fetch(
        raw_query=f"{term_a} AND {term_b}",
        cache_key=cache_key_and(term_a, term_b),
        variant="and",
        api_query=api_query,
    )


@mcp.tool()
async def compare_words(word_a: str, word_b: str) -> dict[str, Any]:
    """Compare two words by hit count. Useful for `compare` mode question gen."""
    a = await search_hit_count(word_a)
    b = await search_hit_count(word_b)
    hit_a = int(a["total_results"])
    hit_b = int(b["total_results"])
    if hit_a == hit_b:
        winner = "tie"
        ratio = 1.0
    elif hit_a > hit_b:
        winner = "a"
        ratio = (hit_a / hit_b) if hit_b > 0 else float("inf")
    else:
        winner = "b"
        ratio = (hit_b / hit_a) if hit_a > 0 else float("inf")
    return {
        "word_a": word_a,
        "word_b": word_b,
        "hit_a": hit_a,
        "hit_b": hit_b,
        "winner": winner,
        "ratio": ratio if ratio != float("inf") else None,
        "fetched_at_a": a["fetched_at"],
        "fetched_at_b": b["fetched_at"],
    }


@mcp.tool()
async def cache_stats() -> dict[str, Any]:
    """Inspect cache hit rate and remaining daily quota."""
    cache = _get_cache()
    s = await cache.stats()
    limit = get_settings().daily_quota
    s["quota_limit"] = limit
    s["quota_remaining_today"] = max(0, limit - s["quota_used_today"])
    return s


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
