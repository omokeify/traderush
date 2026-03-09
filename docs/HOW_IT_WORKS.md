# How TradeRush Works

## Quick Start (Get Everything Working)

1. **Preferences** → Select categories to monitor (AI, RWA, etc.) or leave empty for all
2. **Manual Scan** → Load coins (with category if selected, or all top coins)
3. **Sync Telegram** → Fetches Telegram channels from CoinGecko for coins in your categories
4. **Run Worker** → `python main.py` – monitors channels, generates real signals
5. **Generate Demo Signals** (optional) → Test the UI with sample data

## Data Flow

```
Preferences (categories) → user_preferences
         ↓
Manual Scan (by category) → coins table (with category_id)
         ↓
Sync Telegram → telegram_channel on coins (filtered by categories)
         ↓
Worker → reads preferences → monitors only coins in selected categories
         ↓
Worker (Telegram) → announcements → price validation (every 10 min) → signals table
         ↓
Dashboard / Signals / Positions → filtered by categories (or all if none selected)
```

## How the Worker Monitors Channels

The Python worker (`worker/main.py`) uses Telethon:

1. **Reads user preferences** – Gets `selected_categories` from `user_preferences`
2. **Loads coins** – Fetches coins with `telegram_channel` set:
   - **If categories selected** → Only coins in those categories (e.g. AI, RWA)
   - **If no categories** → All coins with Telegram channels
3. **Registers channels** – Maps each channel (username like `@bitcoin` or numeric ID) to its coin
4. **Listens for messages** – Telethon connects and monitors new messages in those channels
5. **Keyword detection** – For each message, checks for keywords: `announcement`, `partnership`, `listing`, `launch`, `upgrade`, `mainnet`, `testnet`, `airdrop`, `burn`, `staking`, `collaboration`, `integration`, `adoption`
6. **On match** → `on_announcement`:
   - Fetches current price from CoinGecko
   - Inserts into `announcements` (with `price_at_detection`)
   - Inserts a price snapshot
7. **Validation job** (every 10 min) – Checks if price moved ≥5% since announcement
8. **If yes** → Generates signal + optional Telegram notification

## How It Works for Users

### Setup (one-time)

| Step | Action | Where |
|------|--------|-------|
| 1 | Select categories (AI, RWA, etc.) or leave empty for all | **Preferences** |
| 2 | Run Manual Scan with your category (or "All" if no categories) | **Manual Scan** |
| 3 | Sync Telegram channels for those coins | **Manual Scan** → Sync Telegram |
| 4 | Run the worker locally | Terminal: `python main.py` |

### What users see

- **Dashboard** – Signals, coins, positions (filtered by your categories, or all)
- **Signals** – Buy/strong_buy signals from monitored channels
- **Positions** – Valid signals being tracked
- **Announcements** – Raw Telegram messages that triggered detection

### Category behavior

| Preferences | Worker monitors | Dashboard / Signals / Positions show |
|-------------|-----------------|--------------------------------------|
| **Categories selected** (e.g. AI, RWA) | Only coins in those categories | Filtered by those categories |
| **No categories** | All coins with Telegram | All (normal) |

## Sections Explained

### 1. Market Pulse (Dashboard)

- **With signals**: Top momentum signal (coin + price + % change)
- **Without signals**: Top 5 coins as fallback
- **Chart**: Momentum visualization

### 2. Live Momentum Signals

- **With signals**: Buy/strong_buy/watch signals from the engine
- **Without signals**: Top 5 coins as fallback
- **Demo**: Use "Generate Demo Signals" to test the full UI

### 3. Positions

- Valid signals (`valid_signal = true`)
- Same data as Signals, filtered

### 4. Announcements

- Telegram messages detected by the worker (with keywords)
- Pending = awaiting price validation; Signal ✓ = signal generated

### 5. Config

- Editable: momentum threshold (%), monitoring window (hours)
