"""Refreshes coin data from CoinGecko and upserts to Supabase."""

import asyncio
from coingecko_client import CoinGeckoClient
from supabase_client import SupabaseClient


class DataRefreshService:
    """Fetches top coins and syncs to database."""

    def __init__(self, coingecko: CoinGeckoClient, supabase: SupabaseClient):
        self._coingecko = coingecko
        self._supabase = supabase

    async def run(self) -> int:
        """Fetch top 1000 coins and upsert. Returns count."""
        coins = await self._coingecko.get_top_1000_coins()
        rows = []
        for c in coins:
            rows.append({
                "id": c["id"],
                "symbol": c["symbol"],
                "name": c["name"],
                "market_cap_rank": c.get("market_cap_rank"),
                "current_price": c.get("current_price"),
            })
        self._supabase.upsert_coins(rows)
        return len(rows)
