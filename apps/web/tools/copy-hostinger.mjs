// Copy .out/ to hostinger/v{version}/ after each build.
// Version counter stored in .build-version at project root.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = join(__dirname, '..');
const OUT_DIR = join(BASE, '.out');
const HOSTINGER_DIR = join(BASE, 'hostinger');
const VERSION_FILE = join(BASE, '.build-version');

if (!existsSync(OUT_DIR)) {
  console.error('[copy-hostinger] .out/ not found. Run build first.');
  process.exit(1);
}

// Read & bump version
let version = 1;
if (existsSync(VERSION_FILE)) {
  version = parseInt(readFileSync(VERSION_FILE, 'utf-8').trim(), 10) || 1;
}
const targetDir = join(HOSTINGER_DIR, `v${version}`);

// Ensure clean target
if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true });
}
mkdirSync(targetDir, { recursive: true });

// Copy .out/ → hostinger/v{N}/
cpSync(OUT_DIR, targetDir, { recursive: true });

// Bump version for next build
writeFileSync(VERSION_FILE, String(version + 1), 'utf-8');

console.log(`[copy-hostinger] Copied .out/ → hostinger/v${version}/`);
console.log(`[copy-hostinger] Next build will be v${version + 1}`);
