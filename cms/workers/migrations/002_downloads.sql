-- Add downloads JSONB column to products table
-- Stores [{ title: string, url: string }] for spec sheets, color option PDFs, etc.

ALTER TABLE products ADD COLUMN IF NOT EXISTS downloads JSONB DEFAULT '[]';
