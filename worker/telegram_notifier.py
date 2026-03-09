"""Telegram Bot notifications for signals."""

import aiohttp
from typing import Optional


class TelegramNotifier:
    """Sends signal notifications via Telegram Bot API."""

    def __init__(self, bot_token: Optional[str] = None, chat_id: Optional[str] = None):
        self._token = bot_token
        self._chat_id = chat_id
        self._enabled = bool(bot_token and chat_id)

    async def notify_signal(
        self,
        coin_id: str,
        signal_type: str,
        entry_price: float,
        price_change: float,
        keywords: list[str],
    ) -> bool:
        """Send a signal notification. Returns True if sent."""
        if not self._enabled:
            return False

        text = (
            f"🚀 <b>Signal: {coin_id.upper()}</b>\n"
            f"Type: {signal_type.replace('_', ' ').title()}\n"
            f"Entry: ${entry_price:,.2f}\n"
            f"Change: +{price_change:.2f}%\n"
            f"Keywords: {', '.join(keywords[:5])}"
        )

        url = f"https://api.telegram.org/bot{self._token}/sendMessage"
        payload = {
            "chat_id": self._chat_id,
            "text": text,
            "parse_mode": "HTML",
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as resp:
                    return resp.status == 200
        except Exception:
            return False
