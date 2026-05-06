-- News Categories Taxonomy
CREATE TABLE news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE news_category_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES news_categories(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'fr', 'vi')),
  name VARCHAR(100) NOT NULL,
  UNIQUE(category_id, locale)
);

CREATE TABLE news_article_categories (
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES news_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- Indexes
CREATE INDEX idx_news_cat_translations_locale ON news_category_translations(locale);
CREATE INDEX idx_news_article_cats_article ON news_article_categories(article_id);
CREATE INDEX idx_news_article_cats_category ON news_article_categories(category_id);

-- Enable RLS
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies: allow all operations (authenticated via API layer)
CREATE POLICY "news_categories_allow_all" ON news_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "news_category_translations_allow_all" ON news_category_translations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "news_article_categories_allow_all" ON news_article_categories FOR ALL USING (true) WITH CHECK (true);
