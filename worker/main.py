"""
Crypto Momentum Signal Agent - Worker
Run: python main.py
Run: python main.py --refresh-only  (test mode: only refresh coins, no Telegram)
"""

import asyncio
import sys
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import Config, get_session_path
from coingecko_client import CoinGeckoClient
from supabase_client import SupabaseClient
from telegram_monitor import TelegramMonitor
from user_notifier import UserNotifier
from signal_engine import SignalEngine
from data_refresh import DataRefreshService
from announcement_validator import AnnouncementValidator


async def on_announcement(
    supabase: SupabaseClient,
    coingecko: CoinGeckoClient,
    coin_id: str,
    channel_id: int,
    message_id: int,
    text: str,
    keywords: list[str],
) -> None:
    """Store announcement with price at detection. Validation loop generates signals later."""
    current_price = await coingecko.get_coin_price(coin_id)
    if not current_price:
        return

    ann = supabase.insert_announcement(
        coin_id, channel_id, message_id, text, keywords, price_at_detection=current_price
    )
    if not ann:
        return  # Duplicate, skip

    supabase.insert_price_snapshot(coin_id, current_price)


async def run_validation_job(
    validator: AnnouncementValidator,
) -> None:
    """Periodic job: validate announcements and generate signals."""
    count = await validator.run()
    if count > 0:
        print(f"Validation: generated {count} new signal(s)")


async def run_refresh_only() -> None:
    """Test mode: refresh coins only, no Telegram required."""
    supabase_url = __import__("os").environ.get("SUPABASE_URL")
    supabase_key = __import__("os").environ.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        print("SUPABASE_URL and SUPABASE_SERVICE_KEY required for --refresh-only")
        sys.exit(1)

    from dotenv import load_dotenv
    load_dotenv()

    supabase = SupabaseClient(supabase_url, supabase_key)
    coingecko = CoinGeckoClient(api_key=__import__("os").environ.get("COINGECKO_API_KEY"))
    refresh = DataRefreshService(coingecko, supabase)
    count = await refresh.run()
    print(f"Refreshed {count} coins")
    return

async def run_worker() -> None:
    """Main worker loop."""
    if "--refresh-only" in sys.argv:
        await run_refresh_only()
        return

    try:
        cfg = Config.from_env()
    except ValueError as e:
        print(f"Config error: {e}")
        sys.exit(1)

    supabase = SupabaseClient(cfg.supabase_url, cfg.supabase_key)
    coingecko = CoinGeckoClient(api_key=cfg.coingecko_api_key)
    signal_engine = SignalEngine(threshold_percent=cfg.momentum_threshold)
    notifier = UserNotifier(
        telegram_bot_token=cfg.telegram_bot_token,
        resend_api_key=cfg.resend_api_key,
        from_email=cfg.from_email,
        app_url=cfg.app_url,
        global_telegram_chat_id=cfg.telegram_notify_chat_id,
    )
    validator = AnnouncementValidator(
        supabase, coingecko, signal_engine, cfg.monitoring_window_hours, notifier
    )

    # Initial data refresh
    refresh = DataRefreshService(coingecko, supabase)
    count = await refresh.run()
    print(f"Refreshed {count} coins")

    # Validation loop: every 10 min
    async def validation_job() -> None:
        await run_validation_job(validator)

    # Heartbeat for dashboard "Scouting" status
    def heartbeat_job() -> None:
        try:
            supabase.upsert_heartbeat()
        except Exception:
            pass

    scheduler = AsyncIOScheduler()
    scheduler.add_job(validation_job, "interval", minutes=10)
    scheduler.add_job(heartbeat_job, "interval", seconds=30)
    scheduler.start()
    heartbeat_job()  # Immediate heartbeat so dashboard shows Scouting
    print("Validation scheduler started (every 10 min)")

    # Build channel -> coin map (coins with telegram_channel set)
    # Aggregate ALL users' selected categories for platform-wide monitoring
    category_ids = supabase.get_all_users_selected_categories()
    coins = supabase.get_coins_with_telegram(category_ids=category_ids if category_ids else None)
    if not coins:
        if category_ids:
            print("No coins with Telegram in your selected categories.")
            print("Run Manual Scan with those categories, then Sync Telegram.")
        else:
            print("No coins with Telegram channels. Run Sync Telegram from Manual Scan.")
        print("Telegram monitor will not run. Exiting.")
        return
    if category_ids:
        print(f"Monitoring {len(coins)} coins in categories: {', '.join(category_ids)}")

    async def announcement_handler(
        coin_id: str, channel_id: int, message_id: int, text: str, keywords: list[str]
    ) -> None:
        await on_announcement(
            supabase, coingecko, coin_id, channel_id, message_id, text, keywords
        )

    monitor = TelegramMonitor(
        cfg.telegram_api_id,
        cfg.telegram_api_hash,
        get_session_path(),
        announcement_handler,
        phone=cfg.telegram_phone,
        code=cfg.telegram_code,
    )

    for c in coins:
        ch = c.get("telegram_channel")
        if ch:
            ref = str(ch).strip()
            if ref.lstrip("-").isdigit():
                monitor.register_channel(int(ref), c["id"])
            else:
                monitor.register_channel(f"@{ref}" if not ref.startswith("@") else ref, c["id"])

    if not monitor._pending:
        print("No valid Telegram channels mapped. Add telegram_channel to coins (run Sync Telegram).")
        return

    print("Starting Telegram monitor...")
    supabase.upsert_heartbeat()  # Initial heartbeat
    await monitor.start()


if __name__ == "__main__":
    asyncio.run(run_worker())
