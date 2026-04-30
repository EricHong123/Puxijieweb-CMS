-- Audit log for tracking all content changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,          -- 'create', 'update', 'delete', 'publish'
  entity_type TEXT NOT NULL,     -- 'product', 'news', 'page', 'faq', 'legal', 'media', 'site_setting'
  entity_id TEXT,                -- the id or slug of the entity
  changes JSONB DEFAULT '{}',    -- summary of what changed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
