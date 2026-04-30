-- 004_content_versions.sql
-- Content version history for rollback support

CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('product', 'news', 'page')),
  entity_id UUID NOT NULL,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, version)
);

CREATE INDEX idx_content_versions_entity ON content_versions (entity_type, entity_id);
CREATE INDEX idx_content_versions_created ON content_versions (created_at DESC);
