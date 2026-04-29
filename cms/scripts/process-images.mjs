// Image variant processor — generates responsive WebP variants for CMS media.
// Run before codegen in the deploy workflow.
// Usage: node process-images.mjs
//
// For each unprocessed media record:
//   1. Download original from Supabase Storage
//   2. Generate WebP variants at 8 widths (240-1600px)
//   3. Upload variants to Supabase Storage
//   4. Update media.variants JSON in the database

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VARIANT_WIDTHS = [240, 360, 480, 560, 640, 720, 1080, 1600];
const QUALITY = 76;

async function processImage(record) {
  const { id, storage_path, variants } = record;

  // Skip already-processed images
  if (variants && variants.processed) {
    return { skipped: true, id };
  }

  console.log(`  Processing: ${storage_path}`);

  // Download original
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('media')
    .download(storage_path);

  if (downloadError || !fileData) {
    console.error(`  Download failed for ${storage_path}: ${downloadError?.message}`);
    return { error: true, id };
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());
  const basePath = storage_path.replace(/\.[^.]+$/, '');

  // Get original dimensions
  const metadata = await sharp(buffer).metadata();
  const origW = metadata.width || 1600;
  const origH = metadata.height || 1600;

  const variantUrls = {};
  const variantRecords = {};

  for (const w of VARIANT_WIDTHS) {
    if (w > origW) continue; // Don't upscale

    const h = Math.round(origH * (w / origW));
    const variantPath = `${basePath}-${w}w.webp`;

    const resized = await sharp(buffer)
      .resize(w, h, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(variantPath, resized, { contentType: 'image/webp', upsert: true });

    if (uploadError) {
      console.error(`  Variant upload failed for ${w}w: ${uploadError.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(variantPath);
    variantUrls[`${w}w`] = urlData.publicUrl;
    variantRecords[w] = { url: urlData.publicUrl, width: w, height: h };
  }

  // Get public URL for the original (as fallback src)
  const { data: origUrlData } = supabase.storage.from('media').getPublicUrl(storage_path);

  // Update media record with variant info
  const updatedVariants = {
    ...variants,
    publicUrl: origUrlData.publicUrl,
    processed: true,
    originalWidth: origW,
    originalHeight: origH,
    variants: variantRecords,
  };

  const { error: updateError } = await supabase
    .from('media')
    .update({ variants: updatedVariants })
    .eq('id', id);

  if (updateError) {
    console.error(`  DB update failed for ${id}: ${updateError.message}`);
  }

  return { skipped: false, id, width: origW, height: origH, variantCount: Object.keys(variantRecords).length };
}

async function main() {
  console.log('[process-images] Fetching unprocessed media...');

  // Get media records that don't have 'processed' in variants
  const { data: records, error } = await supabase
    .from('media')
    .select('id, storage_path, variants')
    .order('created_at');

  if (error) {
    console.error('Failed to fetch media:', error.message);
    process.exit(1);
  }

  if (!records || records.length === 0) {
    console.log('[process-images] No media records found.');
    return;
  }

  const unprocessed = records.filter((r) => !r.variants?.processed);
  console.log(`[process-images] Found ${records.length} total, ${unprocessed.length} unprocessed.`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of unprocessed) {
    const result = await processImage(record);
    if (result.skipped) skipped++;
    else if (result.error) errors++;
    else processed++;
  }

  console.log(`[process-images] Done: ${processed} processed, ${skipped} skipped, ${errors} errors.`);
}

main().catch((err) => {
  console.error('[process-images] Fatal error:', err);
  process.exit(1);
});
