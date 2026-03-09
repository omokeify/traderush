"""CoinGecko API client. Auth: https://docs.coingecko.com/v3.0.1/reference/authentication"""

import asyncio
import os
import aiohttp
from typing import Any

# Free plan: 2 pages (~500 coins), 6s delay. Set COINGECKO_MAX_PAGES=4 for 1000 coins.
MAX_PAGES = min(int(os.getenv("COINGECKO_MAX_PAGES", "2")), 4)
DELAY_SEC = 6


class CoinGeckoClient:
    """Fetches market data from CoinGecko. Uses header + query param per auth docs."""

    def __init__(self, api_key: str | None = None):
        self._base = "https://api.coingecko.com/api/v3"
        self._api_key = api_key
        self._headers: dict[str, str] = {}
        if api_key:
            self._headers["x-cg-demo-api-key"] = api_key  # Header (recommended)

    def _params(self, extra: dict) -> dict:
        p = dict(extra)
        if self._api_key:
            p["x_cg_demo_api_key"] = self._api_key  # Query fallback
        return p

    async def get_top_coins(self, per_page: int = 250, page: int = 1) -> list[dict[str, Any]]:
        """Fetch coins by market cap rank."""
        url = f"{self._base}/coins/markets"
        params = self._params({
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": per_page,
            "page": page,
            "sparkline": "false",
        })
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=self._headers) as resp:
                if resp.status == 429:
                    raise Exception(
                        "CoinGecko rate limit (429). Free plan: 2 pages. Set COINGECKO_MAX_PAGES=4 for more."
                    )
                resp.raise_for_status()
                return await resp.json()

    async def get_top_coins_limited(self) -> list[dict[str, Any]]:
        """Fetch top coins (2 pages = ~500 by default). 6s delay between pages for free plan."""
        all_coins = []
        for page in range(1, MAX_PAGES + 1):
            coins = await self.get_top_coins(per_page=250, page=page)
            all_coins.extend(coins)
            if page < MAX_PAGES:
                await asyncio.sleep(DELAY_SEC)
        return all_coins

    async def get_top_1000_coins(self) -> list[dict[str, Any]]:
        """Alias for get_top_coins_limited (respects MAX_PAGES)."""
        return await self.get_top_coins_limited()

    async def get_coin_price(self, coin_id: str) -> float | None:
        """Get current price for a coin."""
        prices = await self.get_coin_prices([coin_id])
        return prices.get(coin_id)

    async def get_coin_prices(self, coin_ids: list[str]) -> dict[str, float]:
        """Batch fetch prices (1 API call for up to ~50 coins)."""
        if not coin_ids:
            return {}
        ids_str = ",".join(coin_ids[:50])  # CoinGecko limit
        url = f"{self._base}/simple/price"
        params = self._params({"ids": ids_str, "vs_currencies": "usd"})
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, headers=self._headers) as resp:
                if resp.status == 429:
                    return {}
                resp.raise_for_status()
                data = await resp.json()
                return {cid: data[cid]["usd"] for cid in data if "usd" in data.get(cid, {})}
