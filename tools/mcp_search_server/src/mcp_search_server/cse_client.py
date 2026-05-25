from __future__ import annotations

import httpx


CSE_ENDPOINT = "https://www.googleapis.com/customsearch/v1"


class CSEError(Exception):
    """Raised when the Google CSE API returns an error or unexpected payload."""


class QuotaExceededError(CSEError):
    """Raised when the daily quota would be exceeded before the call is made."""


class CSEClient:
    """Thin async wrapper around Google Custom Search JSON API."""

    def __init__(
        self,
        *,
        api_key: str,
        cx: str,
        timeout_sec: float = 15.0,
    ) -> None:
        self._api_key = api_key
        self._cx = cx
        self._client = httpx.AsyncClient(timeout=timeout_sec)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def __aenter__(self) -> "CSEClient":
        return self

    async def __aexit__(self, *_: object) -> None:
        await self.aclose()

    async def total_results(self, query: str) -> int:
        """Return the totalResults integer for a query.

        Note: Google returns this as a string under
        searchInformation.totalResults. It is an estimate, not exact.
        """
        params = {
            "key": self._api_key,
            "cx": self._cx,
            "q": query,
            "num": 1,
            "fields": "searchInformation/totalResults",
        }
        resp = await self._client.get(CSE_ENDPOINT, params=params)
        if resp.status_code == 429:
            raise QuotaExceededError(
                "Google CSE returned 429 (rate limit / quota exceeded)"
            )
        if resp.status_code >= 400:
            raise CSEError(
                f"CSE HTTP {resp.status_code}: {resp.text[:200]}"
            )
        payload = resp.json()
        info = payload.get("searchInformation") or {}
        raw = info.get("totalResults")
        if raw is None:
            return 0
        try:
            return int(raw)
        except (TypeError, ValueError) as exc:
            raise CSEError(f"Unparseable totalResults: {raw!r}") from exc
