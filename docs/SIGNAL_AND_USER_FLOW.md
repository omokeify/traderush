# Signal Flow & User Delivery – How It Works

## 1. How Signals Are Generated and Sent

### End-to-end pipeline

```
Telegram channels (monitored by worker)
    → Keyword match (announcement, partnership, listing, etc.)
    → Store in announcements (with price_at_detection)
    → Every 10 min: price validation (≥5% move?)
    → If yes: INSERT into signals table
    → Notifications (see below)
```

### What happens when a signal is generated

1. **Worker** (`worker/main.py`) inserts a row into the `signals` table.
2. **Supabase Realtime** broadcasts an `INSERT` event to subscribed clients.
3. **SignalNotificationProvider** (in the web app) listens for that event and:
   - Plays a sound (if `sound_enabled`)
   - Shows a browser notification (if `browser_notifications` and permission granted)

---

## 2. How Users Receive Signals (Current State)

| Channel | Implemented? | How it works |
|---------|--------------|---------------|
| **In-app (Realtime)** | ✅ Yes | User has app open → Supabase Realtime → sound + browser notification |
| **Telegram (global)** | ⚠️ Partial | Worker sends to **one** chat via `TELEGRAM_BOT_TOKEN` + `TELEGRAM_NOTIFY_CHAT_ID` (env vars). **Not per-user.** |
| **Per-user Telegram** | ✅ Yes | Worker sends to each user's `telegram_chat_id` from Preferences |
| **Email** | ✅ Yes | Resend integration when `notify_email` + `email` set |
| **Webhook** | ✅ Yes | Worker POSTs to `webhook_url` when `notify_webhook` set |

### What is set up on our end

- ✅ **Database**: `signals`, `announcements`, `user_preferences`, etc.
- ✅ **Worker**: Monitors Telegram, validates price, inserts signals.
- ✅ **Realtime**: In-app notifications (sound + browser) when user has the app open.
- ✅ **Auth**: Sign up, login, protected routes.
- ✅ **Preferences UI**: Categories, notify_telegram, notify_email, webhook, sound, browser notifications.
- ⚠️ **Realtime on `signals`**: Must be enabled in Supabase (Database → Replication → `signals`).
- ❌ **Per-user delivery**: Worker does not read `user_preferences` for Telegram/email/webhook.

---

## 3. What Users Need to Use the Platform

### One-time setup (admin/platform)

1. **Supabase**: Migrations run, Realtime enabled for `signals`.
2. **Vercel**: App deployed, env vars set.
3. **Worker**: Deployed (Railway/Render), env vars set, Telegram session created.
4. **Cron**: Daily sync (`/api/cron/daily-sync`) runs to refresh coins + Telegram channels.

### Per-user flow

1. Sign up at `/signup`.
2. Sign in at `/login`.
3. Go to **Preferences** → select categories (or leave empty for all).
4. Platform cron syncs coins + Telegram for those categories.
5. Worker monitors channels and generates signals.
6. User sees signals in **Dashboard**, **Signals**, **Positions**.
7. If app is open: sound + browser notification on new signal.

### What users do not do

- ❌ Manual Scan (cron handles it)
- ❌ Sync Telegram (cron handles it)
- ❌ Run the worker (platform runs it)

---

## 4. Gaps for Full User Experience

| Gap | Impact | Fix |
|-----|--------|-----|
| Per-user Telegram | Users who want Telegram alerts don’t get them per-user | Worker reads `user_preferences` and sends to each user’s `telegram_chat_id` when `notify_telegram` is true |
| Email | No email delivery | Add email sending (e.g. Resend) in worker when `notify_email` is true |
| Webhook | No webhook delivery | Worker POSTs to `webhook_url` when `notify_webhook` is true |
| Realtime not enabled | No in-app alerts | Enable Realtime for `signals` in Supabase |
| RLS on user_preferences | Possible data exposure | Add RLS so users only see their own preferences |

---

## 5. Database Completeness

### Tables we have

| Table | Purpose |
|-------|---------|
| `coins` | CoinGecko data, category, telegram_channel, project info |
| `price_snapshots` | Price history for momentum |
| `announcements` | Telegram messages with keywords, price_at_detection |
| `signals` | Generated buy/strong_buy/watch signals |
| `config` | momentum_threshold, monitoring_window_hours, keywords |
| `user_preferences` | user_id, selected_categories, notify_*, webhook_url, email, telegram_chat_id, sound_enabled, browser_notifications |

### What’s covered

- ✅ Coins, categories, project info
- ✅ Announcements and signals
- ✅ User preferences (categories + notification settings)
- ✅ Config for thresholds and keywords

### Optional additions

| Table / feature | Use case |
|----------------|----------|
| RLS policies | Secure `user_preferences` and other user-scoped data |
| `notification_log` | Track sent notifications (Telegram, email, webhook) for debugging |
| `signal_read` / `seen` | Mark signals as read per user |

---

## 6. Summary

**Signals are sent** by the worker inserting into `signals`. Users receive them via:

1. **In-app**: Realtime subscription → sound + browser notification (when app is open).
2. **Telegram**: Per-user (Preferences → Telegram Chat ID) + optional global broadcast (`TELEGRAM_NOTIFY_CHAT_ID`).
3. **Email**: Resend (set `RESEND_API_KEY`, `FROM_EMAIL` in worker; enable in Preferences).
4. **Webhook**: POST to user's `webhook_url` when `notify_webhook` is true.

**Platform readiness**: Core flow works. Per-user Telegram, email, and webhook are implemented.
