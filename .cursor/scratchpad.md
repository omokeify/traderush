# Crypto Momentum Signal Agent – Scratchpad

## Background and Motivation

Build an automated trading intelligence system that:
- Monitors top 1,000 cryptocurrencies (CoinGecko)
- Tracks official Telegram channels for announcements
- Generates buy signals when news + ≥5% price momentum

**Stack**: Supabase + Vercel + Python worker (Windows)

---

## High-level Task Breakdown

| # | Task | Status |
|---|------|--------|
| 1 | Project structure + scratchpad | Done |
| 2 | Supabase schema (coins, signals, announcements, config) | Done |
| 3 | Next.js app – API routes, dashboard | Done |
| 4 | Python worker – Telethon + CoinGecko | Done |
| 5 | Signal engine + price validation | Done |
| 6 | Notifications + integration | Done |

---

## Project Status Board

- **Current**: Dashboard design planned
- **Next**: Implement dashboard enhancements (see below)

---

## Dashboard Design – Feature-Rich Layout

### Current State
- **Home**: Simple nav + manual refresh button
- **Signals**: Basic list (coin, type, price, %)
- **Positions**: Same as signals (active only)
- **Config**: Raw JSON display only

### Proposed Enhancements

#### 1. Command Center (Home)
- **System health** – DB status, last cron run
- **Stats cards** – Signals today | Active positions | Coins with Telegram | Pending announcements
- **Recent activity** – Last 5 signals + last 3 announcements
- **Quick actions** – Refresh coins, link to manual scan

#### 2. Signals Page (Enhanced)
- Filter by signal type (strong_buy / buy / watch)
- Filter by date range
- Link to signal detail (`/signals/[id]`)
- Show keywords from metadata
- Show coin symbol + name (join coins)
- Sort by date, % change

#### 3. Signal Detail Page (New)
- Full signal data + linked announcement
- Announcement text preview, keywords, price at detection
- Coin info (symbol, name, market cap rank)

#### 4. Announcements Page (New)
- List recent announcements (coin, detected_at, keywords, price_at_detection)
- Indicate `signal_generated` (✓ / pending)
- Truncated message text
- **API needed**: `GET /api/announcements`

#### 5. Coins Page (New)
- List coins with Telegram channels
- Market cap rank, symbol, name, last_updated_at
- Optional: current_price
- **API needed**: `GET /api/coins`

#### 6. Config Page (Editable)
- Form fields: momentum_threshold, monitoring_window_hours
- Keywords as editable list (add/remove)
- Save button → PUT /api/config

#### 7. Shared Layout
- Persistent sidebar or top nav (Signals | Positions | Announcements | Coins | Config)
- Branding + health indicator in header

### API Additions Required
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/announcements | List announcements (limit, since) |
| GET | /api/coins | List coins (with optional filters) |
| GET | /api/stats | Aggregates for dashboard (signals today, positions count, etc.) |

### High-level Task Breakdown (Dashboard)
| # | Task | Status |
|---|------|--------|
| 7a | API: /api/announcements, /api/coins, /api/stats | Pending |
| 7b | Shared layout + nav | Pending |
| 7c | Home: command center with stats + activity | Pending |
| 7d | Signals: filters, detail link, keywords | Pending |
| 7e | Signal detail page | Pending |
| 7f | Announcements page | Pending |
| 7g | Coins page | Pending |
| 7h | Config: editable form | Pending |

---

## Key Challenges and Analysis

1. **Telethon on Windows**: Worker runs as separate process; use NSSM or PM2 for persistence
2. **Supabase**: PostgreSQL + Realtime; no Redis – use Supabase for cache or Upstash if needed
3. **Vercel Cron**: 10s timeout (hobby); use for triggering, not heavy work

---

## Security Review & Audit Notes

_(To be filled by Auditor when applicable)_

---

## Lessons

_(To be filled as we go)_
