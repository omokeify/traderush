# TradeRush Deployment Guide

## Prerequisites

- Vercel account
- Supabase project
- Railway / Render / Fly.io (for worker)

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order: `001`, `002`, `003`, `004`, `005`
3. **Realtime**: Migration `005` enables Realtime for `signals`. If it fails, enable manually: Database → Replication → `signals`
4. **Auth**:
   - Authentication → URL Configuration:
     - Site URL: `https://your-app.vercel.app` (must match production; localhost breaks email confirm links)
     - Redirect URLs: add `https://your-app.vercel.app/**` and `https://your-app.vercel.app/auth/callback`
   - Enable Email provider (or add Google/GitHub OAuth)

## 2. Vercel Deployment

1. Connect your repo to Vercel
2. Add environment variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `COINGECKO_API_KEY` | CoinGecko API key |
| `CRON_SECRET` | Random string for cron auth |
| `NEXT_PUBLIC_APP_URL` | **Required** for auth email confirmation redirects. Use your production URL (e.g. https://traderush.vercel.app) |

3. **Cron**: Vercel runs `/api/cron/daily-sync` daily at 00:00 UTC. Add `CRON_SECRET` to Vercel env – cron requests include `Authorization: Bearer CRON_SECRET`.

## 3. Worker Deployment (Railway / Render)

The worker must run 24/7 to monitor Telegram.

1. Create a new service from the `worker/` directory
2. Set **Start Command**: `python main.py`
3. Add environment variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Same as NEXT_PUBLIC_SUPABASE_URL |
| `SUPABASE_SERVICE_KEY` | Same as SUPABASE_SERVICE_ROLE_KEY |
| `TELEGRAM_API_ID` | From [my.telegram.org](https://my.telegram.org) |
| `TELEGRAM_API_HASH` | From my.telegram.org |
| `COINGECKO_API_KEY` | CoinGecko API key |
| `TELEGRAM_BOT_TOKEN` | Required for per-user Telegram notifications |
| `TELEGRAM_NOTIFY_CHAT_ID` | (Optional) Global broadcast chat – all signals also sent here |
| `RESEND_API_KEY` | (Optional) For email notifications – from [resend.com](https://resend.com) |
| `FROM_EMAIL` | (Optional) Sender email for Resend (e.g. `signals@yourdomain.com`) |
| `APP_URL` | (Optional) App URL for "View details" links in emails (e.g. `https://traderush.vercel.app`) |

4. On first run, the worker will prompt for Telegram phone number (one-time).
5. **Per-user notifications**: Users set `telegram_chat_id`, `email`, or `webhook_url` in Preferences. To get a Telegram chat ID: message your bot, then use [@userinfobot](https://t.me/userinfobot) or similar.

## 4. Initial Data Bootstrap

Before users sign up, run the daily sync once to seed coins:

```bash
curl -X GET "https://your-app.vercel.app/api/cron/daily-sync" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or create a user, set categories in Preferences, then trigger manually (cron will pick up).

## 5. User Flow

1. User signs up at `/signup`
2. User confirms email (if required)
3. User signs in at `/login`
4. User sets categories in **Preferences**
5. User sees dashboard filtered by their categories
6. **Platform** runs daily sync (coins + Telegram) via cron
7. **Worker** monitors Telegram for all users' categories
8. New signals → sound + browser notification (if enabled)

## 6. What Users Don't Do

- ❌ Manual Scan
- ❌ Sync Telegram
- ❌ Run the worker

All of that is handled by the platform (cron + worker).
