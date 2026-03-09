"""Configuration loader for the Crypto Momentum worker."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    """Worker configuration."""

    supabase_url: str
    supabase_key: str
    telegram_api_id: int
    telegram_api_hash: str
    telegram_session_name: str
    coingecko_api_key: str | None
    momentum_threshold: float
    monitoring_window_hours: int
    telegram_bot_token: str | None
    telegram_notify_chat_id: str | None

    @classmethod
    def from_env(cls) -> "Config":
        """Load config from environment variables."""
        api_id = os.getenv("TELEGRAM_API_ID")
        api_hash = os.getenv("TELEGRAM_API_HASH")
        if not api_id or not api_hash:
            raise ValueError("TELEGRAM_API_ID and TELEGRAM_API_HASH are required")

        return cls(
            supabase_url=os.getenv("SUPABASE_URL", ""),
            supabase_key=os.getenv("SUPABASE_SERVICE_KEY", ""),
            telegram_api_id=int(api_id),
            telegram_api_hash=api_hash,
            telegram_session_name=os.getenv("TELEGRAM_SESSION_NAME", "momentum_agent"),
            coingecko_api_key=os.getenv("COINGECKO_API_KEY") or None,
            momentum_threshold=float(os.getenv("MOMENTUM_THRESHOLD", "5.0")),
            monitoring_window_hours=int(os.getenv("MONITORING_WINDOW_HOURS", "24")),
            telegram_bot_token=os.getenv("TELEGRAM_BOT_TOKEN") or None,
            telegram_notify_chat_id=os.getenv("TELEGRAM_NOTIFY_CHAT_ID") or None,
        )


def get_session_path() -> Path:
    """Return path for Telethon session file."""
    return Path(__file__).parent / f"{os.getenv('TELEGRAM_SESSION_NAME', 'momentum_agent')}.session"
