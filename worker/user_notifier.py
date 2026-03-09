"""Per-user notification delivery: Telegram, Email (Resend), Webhook."""

import asyncio
import os
from typing import Optional

import aiohttp

# Resend is sync; we run it in a thread
try:
    import resend
    HAS_RESEND = True
except ImportError:
    HAS_RESEND = False


class UserNotifier:
    """Sends signal notifications to users based on their preferences."""

    def __init__(
        self,
        telegram_bot_token: Optional[str] = None,
        resend_api_key: Optional[str] = None,
        from_email: Optional[str] = None,
        app_url: Optional[str] = None,
        global_telegram_chat_id: Optional[str] = None,
    ):
        self._tg_token = telegram_bot_token
        self._resend_key = resend_api_key
        self._from_email = from_email or os.getenv("FROM_EMAIL", "signals@resend.dev")
        self._app_url = app_url
        self._global_chat_id = global_telegram_chat_id

    async def notify_users(
        self,
        users: list[dict],
        coin_id: str,
        signal_type: str,
        entry_price: float,
        price_change: float,
        keywords: list[str],
        signal_id: Optional[str] = None,
    ) -> int:
        """Notify each user via their enabled channels. Returns count of deliveries."""
        text = (
            f"Signal: {coin_id.upper()}\n"
            f"Type: {signal_type.replace('_', ' ').title()}\n"
            f"Entry: ${entry_price:,.2f}\n"
            f"Change: +{price_change:.2f}%\n"
            f"Keywords: {', '.join(keywords[:5])}"
        )
        html = (
            f"<h2>Signal: {coin_id.upper()}</h2>"
            f"<p><strong>Type:</strong> {signal_type.replace('_', ' ').title()}</p>"
            f"<p><strong>Entry:</strong> ${entry_price:,.2f}</p>"
            f"<p><strong>Change:</strong> +{price_change:.2f}%</p>"
            f"<p><strong>Keywords:</strong> {', '.join(keywords[:5])}</p>"
        )
        if signal_id and self._app_url:
            html += f'<p><a href="{self._app_url.rstrip("/")}/signals/{signal_id}">View details</a></p>'

        # Add global broadcast chat if configured (backward compatibility)
        users_to_notify = list(users)
        if self._global_chat_id and self._tg_token:
            users_to_notify.append({
                "notify_telegram": True,
                "telegram_chat_id": self._global_chat_id,
                "notify_email": False,
                "notify_webhook": False,
            })

        count = 0
        for user in users_to_notify:
            if user.get("notify_telegram") and user.get("telegram_chat_id") and self._tg_token:
                ok = await self._send_telegram(
                    user["telegram_chat_id"],
                    coin_id, signal_type, entry_price, price_change, keywords,
                )
                if ok:
                    count += 1

            if user.get("notify_email") and user.get("email"):
                ok = await self._send_email(
                    user["email"],
                    coin_id, signal_type, entry_price, price_change, html,
                )
                if ok:
                    count += 1

            if user.get("notify_webhook") and user.get("webhook_url"):
                ok = await self._send_webhook(
                    user["webhook_url"],
                    coin_id, signal_type, entry_price, price_change, keywords, signal_id,
                )
                if ok:
                    count += 1

        return count

    async def _send_telegram(
        self,
        chat_id: str,
        coin_id: str,
        signal_type: str,
        entry_price: float,
        price_change: float,
        keywords: list[str],
    ) -> bool:
        tg_text = (
            f"🚀 <b>Signal: {coin_id.upper()}</b>\n"
            f"Type: {signal_type.replace('_', ' ').title()}\n"
            f"Entry: ${entry_price:,.2f}\n"
            f"Change: +{price_change:.2f}%\n"
            f"Keywords: {', '.join(keywords[:5])}"
        )
        url = f"https://api.telegram.org/bot{self._tg_token}/sendMessage"
        payload = {"chat_id": chat_id, "text": tg_text, "parse_mode": "HTML"}
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as resp:
                    return resp.status == 200
        except Exception:
            return False

    async def _send_email(
        self,
        to_email: str,
        coin_id: str,
        signal_type: str,
        entry_price: float,
        price_change: float,
        html: str,
    ) -> bool:
        if not self._resend_key or not HAS_RESEND:
            return False
        subject = f"Signal: {coin_id.upper()} – {signal_type.replace('_', ' ').title()}"
        params = {
            "from": self._from_email,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }
        try:
            resend.api_key = self._resend_key
            result = await asyncio.to_thread(resend.Emails.send, params)
            return result is not None
        except Exception:
            return False

    async def _send_webhook(
        self,
        url: str,
        coin_id: str,
        signal_type: str,
        entry_price: float,
        price_change: float,
        keywords: list[str],
        signal_id: Optional[str],
    ) -> bool:
        payload = {
            "event": "signal",
            "coin_id": coin_id,
            "signal_type": signal_type,
            "entry_price": entry_price,
            "price_change_percent": price_change,
            "keywords": keywords,
            "signal_id": signal_id,
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    return resp.status in (200, 201, 202, 204)
        except Exception:
            return False
