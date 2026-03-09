-- Add price at detection for proper momentum validation
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS price_at_detection DECIMAL(20, 8);

-- Add signal_sent to avoid duplicate signals per announcement
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS signal_generated BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_announcements_validation ON announcements(detected_at)
  WHERE signal_generated = FALSE;
