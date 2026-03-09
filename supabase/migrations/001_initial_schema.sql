-- Crypto Momentum Signal Agent - Initial Schema
-- Run in Supabase SQL Editor or via CLI

-- Coins from CoinGecko (top 1000, refreshed daily)
CREATE TABLE IF NOT EXISTS coins (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  market_cap_rank INT,
  current_price DECIMAL(20, 8),
  telegram_channel TEXT,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coins_rank ON coins(market_cap_rank);
CREATE INDEX idx_coins_telegram ON coins(telegram_channel) WHERE telegram_channel IS NOT NULL;

-- Price snapshots for momentum calculation
CREATE TABLE IF NOT EXISTS price_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id TEXT NOT NULL REFERENCES coins(id),
  price DECIMAL(20, 8) NOT NULL,
  snapshot_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_snapshots_coin_time ON price_snapshots(coin_id, snapshot_at DESC);

-- Announcements from Telegram
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id TEXT NOT NULL REFERENCES coins(id),
  channel_id BIGINT,
  message_id INT,
  message_text TEXT,
  keywords_matched TEXT[],
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coin_id, channel_id, message_id)
);

CREATE INDEX idx_announcements_coin ON announcements(coin_id);
CREATE INDEX idx_announcements_detected ON announcements(detected_at DESC);

-- Generated signals
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id TEXT NOT NULL REFERENCES coins(id),
  announcement_id UUID REFERENCES announcements(id),
  signal_type TEXT NOT NULL CHECK (signal_type IN ('strong_buy', 'buy', 'watch')),
  entry_price DECIMAL(20, 8),
  price_change_percent DECIMAL(10, 4),
  valid_signal BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signals_coin ON signals(coin_id);
CREATE INDEX idx_signals_created ON signals(created_at DESC);

-- Config / thresholds
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO config (key, value) VALUES
  ('momentum_threshold', '5.0'),
  ('monitoring_window_hours', '24'),
  ('keywords', '["announcement","partnership","listing","launch","upgrade","mainnet","testnet","airdrop","burn","staking","collaboration","integration","adoption"]')
ON CONFLICT (key) DO NOTHING;

-- Enable Realtime for signals: Supabase Dashboard > Database > Replication > signals
