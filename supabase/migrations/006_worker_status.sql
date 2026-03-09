-- Worker heartbeat for dashboard "Scouting" status
CREATE TABLE IF NOT EXISTS worker_status (
  id TEXT PRIMARY KEY DEFAULT 'monitor',
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service role (worker) bypasses RLS. Allow anon/auth to read.
ALTER TABLE worker_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read worker status"
  ON worker_status FOR SELECT
  USING (true);
