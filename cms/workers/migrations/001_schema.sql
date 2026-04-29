-- Puxijie CMS Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth + public metadata)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('waterproof_bt', 'normal_bt', 'specialty', 'earbuds')),
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'fr', 'vi')),
  name VARCHAR(200) NOT NULL,
  subtitle VARCHAR(200),
  material VARCHAR(255),
  weight VARCHAR(50),
  dimensions VARCHAR(100),
  waterproof_depth VARCHAR(100),
  frequency_range VARCHAR(100),
  features JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  procurement_notes JSONB DEFAULT '[]',
  description_html TEXT,
  UNIQUE(product_id, locale)
);

CREATE TABLE product_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  ipx_rating VARCHAR(20),
  battery_life VARCHAR(20),
  chipset VARCHAR(100),
  bluetooth_version VARCHAR(20),
  transmission_distance VARCHAR(20),
  speaker_spec VARCHAR(100),
  battery_spec VARCHAR(100),
  function_set VARCHAR(200),
  color_options VARCHAR(200),
  moq VARCHAR(100),
  package_size VARCHAR(100),
  carton_size VARCHAR(100),
  carton_quantity VARCHAR(50),
  carton_weight VARCHAR(50),
  accessory_content VARCHAR(200)
);

-- Media
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_filename VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(50),
  width INT,
  height INT,
  file_size_bytes BIGINT,
  variants JSONB DEFAULT '{}',
  alt_text VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Pages
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  page_type VARCHAR(30) NOT NULL CHECK (page_type IN ('home', 'standard', 'contact')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE page_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'fr', 'vi')),
  title VARCHAR(200) NOT NULL,
  meta_description VARCHAR(500),
  hero_badge VARCHAR(200),
  headline_line1 VARCHAR(300),
  headline_line2 VARCHAR(300),
  headline_emphasis VARCHAR(300),
  subhead TEXT,
  body_json JSONB,
  UNIQUE(page_id, locale)
);

-- News Articles
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) NOT NULL,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'fr', 'vi')),
  title VARCHAR(300) NOT NULL,
  description VARCHAR(500),
  body_markdown TEXT NOT NULL,
  date DATE,
  keywords JSONB DEFAULT '[]',
  hero_image_url VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, locale)
);

-- FAQ Sections
CREATE TABLE faq_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key VARCHAR(50) NOT NULL,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'fr', 'vi')),
  short_title VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  UNIQUE(section_key, locale)
);

-- Legal Pages
CREATE TABLE legal_page_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type VARCHAR(30) NOT NULL CHECK (page_type IN ('terms', 'privacy', 'warranty', 'do-not-sell')),
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en', 'fr', 'vi')),
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  eyebrow VARCHAR(200),
  h1 VARCHAR(200),
  lead TEXT,
  intro JSONB DEFAULT '[]',
  sections JSONB NOT NULL DEFAULT '[]',
  UNIQUE(page_type, locale)
);

-- Site Settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics pageview tracking
CREATE TABLE analytics_pageviews (
  id BIGSERIAL PRIMARY KEY,
  path VARCHAR(500) NOT NULL,
  referrer VARCHAR(500) DEFAULT '',
  session_id VARCHAR(100) DEFAULT '',
  user_agent VARCHAR(500) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_pageviews_created ON analytics_pageviews(created_at);
CREATE INDEX idx_pageviews_path ON analytics_pageviews(path);

-- Deploy Logs
CREATE TABLE deploy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'uploading', 'success', 'failed')),
  triggered_by UUID REFERENCES users(id),
  build_log TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_product_translations_locale ON product_translations(locale);
CREATE INDEX idx_media_mime_type ON media(mime_type);
CREATE INDEX idx_pages_type ON pages(page_type);
CREATE INDEX idx_news_locale ON news_articles(locale);
CREATE INDEX idx_news_slug ON news_articles(slug);
CREATE INDEX idx_faq_locale ON faq_sections(locale);
CREATE INDEX idx_legal_locale ON legal_page_translations(locale);
CREATE INDEX idx_deploy_logs_status ON deploy_logs(status);

-- Insert default admin user (password set via Supabase Auth separately)
INSERT INTO users (email, display_name, role) VALUES ('admin@puxijietech.com', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', '"Puxijie"'),
  ('site_origin', '"https://puxijietech.com"'),
  ('contact_info', '{"email":"info@puxijietech.com","phone":"","wechat":"","whatsapp":""}'),
  ('social_links', '{}'),
  ('seo_defaults', '{"coreKeywords":[],"secondaryKeywords":[]}'),
  ('theme', '{"primaryColor":"#2563eb","logoUrl":"","faviconUrl":""}'),
  ('google_analytics_id', '""')
ON CONFLICT (key) DO NOTHING;

-- RLS policies (enable RLS on all tables)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_logs ENABLE ROW LEVEL SECURITY;
