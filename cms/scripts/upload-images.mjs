import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const ROOT = join(__dirname, '../..');
const ASSETS = join(ROOT, 'apps/web/src/features/products/assets');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIME_MAP = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

// Directory → product slug mapping
const SLUG_MAP = {
  'earbuds/ME-728': 'me-728',
  'earbuds/ME-136': 'me-136',
  'earbuds/ME-76': 'me-76',
  'earbuds/ME-88P': 'me-88p',
  'earbuds/ME-636': 'me-636',
  'earbuds/ME-176': 'me-176',
  'qw-photos/A5': 'qw-a5',
  'qw-photos/C01/C01-bell': 'qw-c-01',
  'qw-photos/C01/C01-cotton': 'qw-c-01-cotton',
  'qw-photos/F19': 'qw-f19',
  'qw-photos/G06': 'qw-g06',
  'qw-photos/G14': 'qw-g14',
  'qw-photos/G21': 'qw-g21',
  'qw-photos/G23': 'qw-g23',
  'qw-photos/G29': 'qw-g29',
  'qw-photos/G31': 'qw-g31',
  'qw-photos/G34': 'qw-g34',
};

function walkFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === '.DS_Store') continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...walkFiles(full));
    } else {
      const ext = extname(e.name).toLowerCase();
      if (MIME_MAP[ext]) results.push(full);
    }
  }
  return results;
}

function findSlug(filePath) {
  const rel = relative(ASSETS, filePath);
  // Try longest prefix match
  let bestKey = '';
  for (const key of Object.keys(SLUG_MAP)) {
    if (rel.startsWith(key) && key.length > bestKey.length) {
      bestKey = key;
    }
  }
  return SLUG_MAP[bestKey] || null;
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
  }

  console.log('=== Upload product images to Supabase ===\n');

  const files = walkFiles(ASSETS).filter((f) => findSlug(f));
  console.log(`Found ${files.length} product images\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of files) {
    const slug = findSlug(filePath);
    const filename = filePath.split('/').pop();
    const ext = extname(filename).toLowerCase();
    const mimeType = MIME_MAP[ext];
    const fileSize = statSync(filePath).size;

    // Get product UUID from slug
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!product) {
      console.log(`  SKIP ${slug}/${filename} (product not found in DB)`);
      skipped++;
      continue;
    }

    // Check if this image already exists for this product
    const storagePath = `products/${slug}/${filename}`;
    const { data: existingMedia } = await supabase
      .from('media')
      .select('id')
      .eq('storage_path', storagePath)
      .single();

    if (existingMedia) {
      // Ensure product_images association exists
      const { data: existingAssoc } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', product.id)
        .eq('media_id', existingMedia.id)
        .single();

      if (!existingAssoc) {
        await supabase.from('product_images').insert({
          product_id: product.id,
          media_id: existingMedia.id,
          sort_order: 0,
          is_primary: false,
        });
      }
      console.log(`  SKIP ${slug}/${filename} (already exists)`);
      skipped++;
      continue;
    }

    // Read & upload
    try {
      const buffer = readFileSync(filePath);

      const { error: uploadErr } = await supabase.storage
        .from('media')
        .upload(storagePath, buffer, { contentType: mimeType, upsert: true });

      if (uploadErr) {
        console.error(`  FAIL upload ${slug}/${filename}: ${uploadErr.message}`);
        failed++;
        continue;
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(storagePath);

      const { data: mediaRecord, error: dbErr } = await supabase
        .from('media')
        .insert({
          original_filename: filename,
          storage_path: storagePath,
          mime_type: mimeType,
          file_size_bytes: fileSize,
          variants: { publicUrl: urlData.publicUrl },
        })
        .select()
        .single();

      if (dbErr) {
        console.error(`  FAIL media record ${slug}/${filename}: ${dbErr.message}`);
        failed++;
        continue;
      }

      // Associate with product
      await supabase.from('product_images').insert({
        product_id: product.id,
        media_id: mediaRecord.id,
        sort_order: 0,
        is_primary: filename.endsWith('-1.webp') || filename.endsWith('-1.jpg'),
      });

      uploaded++;
      console.log(`  OK ${slug}/${filename}`);
    } catch (err) {
      console.error(`  FAIL ${slug}/${filename}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done: ${uploaded} uploaded, ${skipped} skipped, ${failed} failed ===`);
}

main().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
