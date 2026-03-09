"""Signal generation and price validation."""

from coingecko_client import CoinGeckoClient


class SignalEngine:
    """Validates price momentum and generates signals."""

    def __init__(self, threshold_percent: float = 5.0, coingecko: CoinGeckoClient | None = None):
        self._threshold = threshold_percent
        self._coingecko = coingecko or CoinGeckoClient()

    def _categorize_signal(self, price_change: float) -> str:
        """Map price change to signal type."""
        if price_change >= 10.0:
            return "strong_buy"
        if price_change >= 5.0:
            return "buy"
        return "watch"

    async def validate_and_signal(
        self,
        coin_id: str,
        baseline_price: float,
        current_price: float,
    ) -> dict | None:
        """
        Validate momentum and return signal if threshold met.
        Returns None if below threshold.
        """
        if baseline_price <= 0:
            return None
        change = ((current_price - baseline_price) / baseline_price) * 100
        if change < self._threshold:
            return None

        return {
            "valid_signal": True,
            "coin_id": coin_id,
            "entry_price": current_price,
            "price_change_percent": round(change, 4),
            "signal_type": self._categorize_signal(change),
        }
