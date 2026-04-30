-- 005_scheduled_publish.sql
-- Add scheduled publishing support to content tables

ALTER TABLE products ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_scheduled ON products (scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_scheduled ON news_articles (scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pages_scheduled ON pages (scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;
