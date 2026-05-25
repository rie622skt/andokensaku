from __future__ import annotations

import unicodedata


def normalize_query(query: str) -> str:
    """Normalize a search query for cache-key purposes.

    Applies NFKC (unifies full/half-width, ligatures), trims, and collapses
    internal whitespace. Case is preserved because Google CSE treats
    ASCII case-insensitively but Japanese case-fold rules differ.
    """
    if not query:
        return ""
    normalized = unicodedata.normalize("NFKC", query)
    normalized = normalized.strip()
    normalized = " ".join(normalized.split())
    return normalized


def cache_key_simple(query: str) -> str:
    return f"q:{normalize_query(query)}"


def cache_key_and(term_a: str, term_b: str) -> str:
    a = normalize_query(term_a)
    b = normalize_query(term_b)
    # Order-independent: AND search hit counts are symmetric.
    lo, hi = sorted([a, b])
    return f"and:{lo}|{hi}"
