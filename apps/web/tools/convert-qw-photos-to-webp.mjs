import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd(), 'src/assets/qw-photos');
const MAX_WIDTH = 1600;
const QUALITY = 78;

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function isJpeg(file) {
  return /\.(jpe?g)$/i.test(file);
}

function toWebpPath(jpegPath) {
  return jpegPath.replace(/\.(jpe?g)$/i, '.webp');
}

async function convertOne(jpegPath) {
  const webpPath = toWebpPath(jpegPath);

  try {
    await fs.access(webpPath);
    return { status: 'skipped', jpegPath, webpPath };
  } catch {
    // continue
  }

  const image = sharp(jpegPath, { failOn: 'none' });
  const meta = await image.metadata();

  let pipeline = image;
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  await pipeline.webp({ quality: QUALITY }).toFile(webpPath);
  return { status: 'converted', jpegPath, webpPath };
}

async function main() {
  const started = Date.now();
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  const files = [];
  for await (const file of walk(ROOT)) {
    if (isJpeg(file)) files.push(file);
  }

  for (const file of files) {
    try {
      const res = await convertOne(file);
      if (res.status === 'converted') converted += 1;
      else skipped += 1;
    } catch (err) {
      failed += 1;
      console.warn('[webp] failed:', file, String(err?.message || err));
    }
  }

  const elapsedMs = Date.now() - started;
  console.log(
    `[webp] done. converted=${converted} skipped=${skipped} failed=${failed} elapsedMs=${elapsedMs}`
  );
}

await main();

