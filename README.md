# Crypto Momentum Signal Agent

News-driven momentum trading signals. Monitors top 1,000 cryptocurrencies and their Telegram channels for announcements, generating buy signals when price moves ≥5%.

## Stack

- **Frontend & API**: Next.js on Vercel
- **Database**: Supabase (PostgreSQL)
- **Worker**: Python + Telethon (runs on Windows or any server)

## Quick Start

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in **SQL Editor** (in order):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_announcement_price_and_notify.sql`

3. Get your URL and keys from **Settings → API**

### 2. Vercel / Next.js

```bash
cp .env.example .env.local
# Edit .env.local with Supabase URL and keys

npm install
npm run dev
```

Deploy to Vercel and add env vars. Configure cron in `vercel.json` (daily coin refresh).

### 3. Worker (Windows)

```bash
cd worker
cp .env.example .env
# Edit .env with Supabase + Telegram API credentials

pip install -r requirements.txt
python main.py
```

**Telegram API**: Get `api_id` and `api_hash` from [my.telegram.org](https://my.telegram.org).

**Telegram channels**: Add `telegram_channel` (numeric ID) to the `coins` table for projects you want to monitor. CoinGecko provides some links; you can also look up channel IDs manually.

**Signal notifications**: Create a bot via [@BotFather](https://t.me/BotFather), add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_NOTIFY_CHAT_ID` to worker `.env` to receive signal alerts.

**CoinGecko 429**: Get a free API key at [CoinGecko Pricing](https://www.coingecko.com/en/api/pricing). Add `COINGECKO_API_KEY` to `.env.local` (Next.js) and worker `.env`.

### 4. Run as Windows Service (optional)

Use [NSSM](https://nssm.cc/) to run the worker as a service:

```powershell
nssm install CryptoMomentumWorker "C:\Python311\python.exe" "C:\path\to\worker\main.py"
nssm start CryptoMomentumWorker
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | System status |
| GET | /api/signals | List signals |
| GET | /api/signals/:id | Signal details |
| GET | /api/positions | Active positions |
| POST | /api/manual/scan | Trigger manual scan |
| GET/PUT | /api/config | Config |
| GET | /api/cron/daily-coins | Cron: refresh coins (daily) |

## Project Structure

```
traderush/
├── src/                 # Next.js app
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── signals/     # Signals page
│   │   ├── positions/   # Positions page
│   │   └── config/      # Config page
│   └── lib/             # Supabase client
├── worker/               # Python worker
│   ├── main.py          # Entry point
│   ├── config.py        # Config
│   ├── coingecko_client.py
│   ├── telegram_monitor.py
│   ├── signal_engine.py
│   └── supabase_client.py
├── supabase/
│   └── migrations/      # SQL schema
└── .cursor/
    └── scratchpad.md    # Plan & status
```

## Testing

**Frontend** (requires Supabase for full functionality):
```bash
npm run dev
# Open http://localhost:3000
```

**Worker (refresh-only, no Telegram)**:
```bash
cd worker
# Set SUPABASE_URL, SUPABASE_SERVICE_KEY in .env
python main.py --refresh-only
```

**Worker (full)**:
```bash
cd worker
# Set all vars in .env (including Telegram)
pip install -r requirements.txt
python main.py
```

## How It Works

See [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md) for the data flow and how each section (Market Pulse, Signals, Positions) gets its data.

## Disclaimer

Cryptocurrency trading involves significant risk. This system is for educational and research purposes only.
