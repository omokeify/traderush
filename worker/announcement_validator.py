"""Validates announcements against price movement and generates signals."""

from datetime import datetime, timedelta
from typing import Optional

from coingecko_client import CoinGeckoClient
from supabase_client import SupabaseClient
from signal_engine import SignalEngine
from user_notifier import UserNotifier


class AnnouncementValidator:
    """Checks announcements for ≥5% price movement within monitoring window."""

    def __init__(
        self,
        supabase: SupabaseClient,
        coingecko: CoinGeckoClient,
        signal_engine: SignalEngine,
        window_hours: int = 24,
        notifier: Optional[UserNotifier] = None,
    ):
        self._supabase = supabase
        self._coingecko = coingecko
        self._signal_engine = signal_engine
        self._window_hours = window_hours
        self._notifier = notifier

    async def run(self) -> int:
        """Validate announcements from last N hours. Returns count of new signals."""
        cutoff = datetime.utcnow() - timedelta(hours=self._window_hours)
        cutoff_str = cutoff.strftime("%Y-%m-%dT%H:%M:%S")

        announcements = self._supabase.get_announcements_for_validation(cutoff_str)
        if not announcements:
            return 0

        coin_ids = list({a["coin_id"] for a in announcements})
        prices = await self._coingecko.get_coin_prices(coin_ids)

        count = 0
        for ann in announcements:
            baseline = ann.get("price_at_detection")
            if baseline is None or float(baseline) <= 0:
                continue

            coin_id = ann["coin_id"]
            current_price = prices.get(coin_id)
            if not current_price:
                continue

            signal = await self._signal_engine.validate_and_signal(
                coin_id, float(baseline), current_price
            )
            if signal:
                keywords = ann.get("keywords_matched") or []
                signal_id = self._supabase.insert_signal(
                    coin_id=coin_id,
                    announcement_id=ann.get("id"),
                    signal_type=signal["signal_type"],
                    entry_price=signal["entry_price"],
                    price_change=signal["price_change_percent"],
                    metadata={"keywords": keywords},
                )
                self._supabase.mark_announcement_signal_generated(ann["id"])

                if self._notifier:
                    users = self._supabase.get_users_to_notify(coin_id)
                    delivered = await self._notifier.notify_users(
                        users=users,
                        coin_id=coin_id,
                        signal_type=signal["signal_type"],
                        entry_price=signal["entry_price"],
                        price_change=signal["price_change_percent"],
                        keywords=keywords,
                        signal_id=signal_id,
                    )
                    if delivered > 0:
                        print(f"  Notified {delivered} user(s) for {coin_id}")
                count += 1

        return count
