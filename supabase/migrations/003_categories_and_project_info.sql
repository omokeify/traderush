-- Add category and project info to coins
ALTER TABLE coins ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS category_name TEXT;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS homepage TEXT;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_coins_category ON coins(category_id) WHERE category_id IS NOT NULL;

-- User preferences (categories to monitor, notification channels)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE,
  selected_categories TEXT[] DEFAULT '{}',
  notify_telegram BOOLEAN DEFAULT TRUE,
  notify_email BOOLEAN DEFAULT FALSE,
  notify_webhook BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  email TEXT,
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add project info to signals metadata (or we join with coins)
-- Signals already have coin_id; we'll join coins for project details in API
