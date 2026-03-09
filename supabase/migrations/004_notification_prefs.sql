-- Add sound and browser notification preferences
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS browser_notifications BOOLEAN DEFAULT TRUE;
