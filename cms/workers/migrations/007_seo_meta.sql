-- Enhanced SEO Meta Fields
ALTER TABLE page_translations
  ADD COLUMN og_title VARCHAR(200),
  ADD COLUMN og_description VARCHAR(500),
  ADD COLUMN og_image_url VARCHAR(500),
  ADD COLUMN canonical_url VARCHAR(500),
  ADD COLUMN noindex BOOLEAN DEFAULT FALSE;

ALTER TABLE news_articles
  ADD COLUMN og_title VARCHAR(200),
  ADD COLUMN og_description VARCHAR(500),
  ADD COLUMN og_image_url VARCHAR(500),
  ADD COLUMN canonical_url VARCHAR(500),
  ADD COLUMN noindex BOOLEAN DEFAULT FALSE;
