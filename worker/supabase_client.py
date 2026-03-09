"""Supabase client for the worker."""

from supabase import create_client, Client


class SupabaseClient:
    """Handles all Supabase operations for the worker."""

    def __init__(self, url: str, key: str):
        self._client: Client = create_client(url, key)

    def get_all_users_selected_categories(self) -> list[str]:
        """Aggregate selected_categories from ALL users for platform-wide monitoring."""
        result = (
            self._client.table("user_preferences")
            .select("selected_categories")
            .execute()
        )
        rows = result.data or []
        all_cats: set[str] = set()
        for row in rows:
            cats = row.get("selected_categories") if isinstance(row, dict) else None
            if isinstance(cats, (list, tuple)):
                all_cats.update(str(c) for c in cats if c)
        return list(all_cats)

    def get_coins_with_telegram(self, category_ids: list[str] | None = None) -> list[dict]:
        """Fetch coins that have Telegram channels configured.
        If category_ids is provided and non-empty, filter by those categories.
        """
        query = (
            self._client.table("coins")
            .select("id, symbol, name, telegram_channel")
            .not_.is_("telegram_channel", "null")
        )
        if category_ids and len(category_ids) > 0:
            query = query.in_("category_id", category_ids)
        result = query.execute()
        return result.data or []

    def insert_price_snapshot(self, coin_id: str, price: float) -> None:
        """Store price snapshot for momentum calculation."""
        self._client.table("price_snapshots").insert({
            "coin_id": coin_id,
            "price": price,
        }).execute()

    def upsert_coins(self, coins: list[dict]) -> None:
        """Upsert coins into the database."""
        if not coins:
            return
        self._client.table("coins").upsert(coins, on_conflict="id").execute()

    def insert_announcement(
        self,
        coin_id: str,
        channel_id: int,
        message_id: int,
        text: str,
        keywords: list[str],
        price_at_detection: float | None = None,
    ) -> dict | None:
        """Insert an announcement. Returns the row if inserted, None if duplicate."""
        row = {
            "coin_id": coin_id,
            "channel_id": channel_id,
            "message_id": message_id,
            "message_text": text[:5000] if text else None,
            "keywords_matched": keywords,
            "price_at_detection": price_at_detection,
        }
        try:
            result = self._client.table("announcements").insert(row).execute()
            return result.data[0] if result.data else None
        except Exception:
            return None  # Duplicate or other error, skip

    def insert_signal(self, coin_id: str, announcement_id: str | None, signal_type: str, entry_price: float, price_change: float, metadata: dict | None = None) -> None:
        """Insert a generated signal."""
        self._client.table("signals").insert({
            "coin_id": coin_id,
            "announcement_id": announcement_id,
            "signal_type": signal_type,
            "entry_price": entry_price,
            "price_change_percent": price_change,
            "valid_signal": True,
            "metadata": metadata or {},
        }).execute()

    def get_announcements_for_validation(self, since: str) -> list[dict]:
        """Get announcements not yet validated, from within the monitoring window."""
        result = (
            self._client.table("announcements")
            .select("id, coin_id, price_at_detection, keywords_matched")
            .gte("detected_at", since)
            .or_("signal_generated.eq.false,signal_generated.is.null")
            .not_.is_("price_at_detection", "null")
            .execute()
        )
        return result.data or []

    def mark_announcement_signal_generated(self, announcement_id: str) -> None:
        """Mark announcement as having generated a signal."""
        self._client.table("announcements").update({"signal_generated": True}).eq(
            "id", announcement_id
        ).execute()

    def get_config(self, key: str) -> dict | None:
        """Get a config value by key."""
        result = self._client.table("config").select("value").eq("key", key).execute()
        if result.data and len(result.data) > 0:
            return result.data[0].get("value")
        return None
