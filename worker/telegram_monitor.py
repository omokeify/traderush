"""Telegram channel monitor using Telethon."""

from pathlib import Path
from typing import Callable, Awaitable

from telethon import TelegramClient
from telethon.events import NewMessage
from telethon.tl.types import Channel

from keywords import matches_keywords


class TelegramMonitor:
    """Monitors Telegram channels for announcement keywords."""

    def __init__(self, api_id: int, api_hash: str, session_path: Path, on_announcement: Callable[..., Awaitable[None]]):
        self._client = TelegramClient(str(session_path), api_id, api_hash)
        self._on_announcement = on_announcement
        self._channel_to_coin: dict[int, str] = {}
        self._pending: list[tuple[str, str]] = []  # (username_or_id, coin_id)

    def register_channel(self, channel_ref: str | int, coin_id: str) -> None:
        """Map a channel to a coin. channel_ref: username (e.g. 'bitcoin') or numeric ID."""
        self._pending.append((str(channel_ref).strip(), coin_id))

    async def start(self) -> None:
        """Start the client, resolve usernames to IDs, register handlers."""
        await self._client.start()
        for ref, coin_id in self._pending:
            try:
                entity = await self._client.get_entity(ref)
                if hasattr(entity, "id"):
                    self._channel_to_coin[entity.id] = coin_id
            except Exception:
                pass
        if self._channel_to_coin:
            self._client.add_event_handler(
                self._on_message, NewMessage(chats=list(self._channel_to_coin.keys()))
            )
        await self._client.run_until_disconnected()

    async def _on_message(self, event: NewMessage.Event) -> None:
        """Handle new messages from monitored channels."""
        text = event.message.text or ""
        keywords = matches_keywords(text)
        if not keywords:
            return

        chat_id = event.chat_id
        coin_id = self._channel_to_coin.get(chat_id)
        if not coin_id:
            return

        await self._on_announcement(
            coin_id=coin_id,
            channel_id=chat_id,
            message_id=event.message.id,
            text=text,
            keywords=keywords,
        )

    async def stop(self) -> None:
        """Disconnect the client."""
        await self._client.disconnect()
