# How Users Get Updates & Announcements

## 1. How Users Get Updates

| Channel | How It Works | Setup |
|---------|--------------|-------|
| **Telegram Bot** | Worker sends signal message to your Telegram chat | `TELEGRAM_BOT_TOKEN` + `TELEGRAM_NOTIFY_CHAT_ID` in worker `.env` |
| **Email** | (Future) SMTP or Resend integration | Configure in Preferences |
| **Webhook** | POST to your URL when signal is generated | Add webhook URL in Preferences; worker calls it |
| **Dashboard** | Real-time view of signals, positions, announcements | Open `/signals`, `/positions`, `/announcements` |

### Preferences

Go to **Preferences** to:
- Select categories to monitor (AI, RWA, Layer 1, etc.)
- Enable/disable Telegram, Email, Webhook
- Set webhook URL for trading bot integration

---

## 2. Category Selection (AI, RWA, etc.)

CoinGecko provides categories via `/coins/categories/list`:
- `artificial-intelligence` – AI tokens
- `real-world-assets` – RWA
- `layer-1` – L1 chains
- `decentralized-finance-defi` – DeFi
- etc.

**How to use:**
1. **Manual Scan** → Select a category from the dropdown (or leave empty for all)
2. **Preferences** → Select categories you want to track
3. Coins are filtered by category when you scan with a category selected

---

## 3. How We Get Announcements from Projects

**Flow:**
1. **CoinGecko** has `links.telegram_channel_identifier` for each coin (e.g. `bitcoin`)
2. **Sync Telegram** – Fetches these usernames for coins in your selected categories (or top 20 if no categories)
3. **Worker** – Reads user preferences, then:
   - **If categories selected** → Monitors only coins in those categories
   - **If no categories** → Monitors all coins with Telegram channels
4. **Worker** – Uses Telethon to listen for new messages in those channels

**Keyword filters** (from config):
- announcement, partnership, listing, launch, upgrade, mainnet, testnet, airdrop, burn, staking, collaboration, integration, adoption

When a message in a monitored channel contains any keyword:
- Worker stores it in `announcements` table
- Records price at detection
- Every 10 min: validates if price moved ≥5%
- If yes: generates signal + sends notification

**Limitation:** Telegram channels must be public. CoinGecko provides official project channels. Sync Telegram adds them to the `coins` table.

**User flow:** Set categories in Preferences → Manual Scan with those categories → Sync Telegram → Run Worker. The worker will only monitor coins in your selected categories.

---

## 4. Project Info in Signals

Each signal now includes:
- **Coin** – image, name, symbol, category, homepage
- **Announcement** – message text, keywords, price at detection (when linked)

**Signal detail** (`/api/signals/:id`) returns:
- Full signal data
- `coin` – image, category_name, homepage, description, telegram_channel
- `announcement` – message_text, keywords_matched, detected_at

**Signal card** displays:
- Coin image (from CoinGecko)
- Project name
- Category (e.g. "Artificial Intelligence")
- Price, momentum, signal type
