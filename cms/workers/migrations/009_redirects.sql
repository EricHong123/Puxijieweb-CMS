-- 301 Redirects
CREATE TABLE redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path VARCHAR(500) NOT NULL UNIQUE,
  target_path VARCHAR(500) NOT NULL,
  status_code INT NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by source path
CREATE INDEX idx_redirects_source ON redirects(source_path);
CREATE INDEX idx_redirects_active ON redirects(is_active);

-- Enable RLS
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- RLS policies: allow all operations (authenticated via API layer)
CREATE POLICY "redirects_allow_all" ON redirects FOR ALL USING (true) WITH CHECK (true);
