/**
 * Cross-platform production build: geo + llms (non-fatal) + vite + index stamp.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(root, '..');
const repoRoot = path.resolve(webRoot, '..', '..');
const outDir = path.join(webRoot, '.out');

function findViteCli() {
  const candidates = [
    path.join(webRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
    path.join(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}
const viteCli = findViteCli();

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runNode(script, { ignoreFail = false } = {}) {
  const r = spawnSync(process.execPath, [path.join(webRoot, 'tools', script)], {
    cwd: webRoot,
    stdio: 'inherit',
  });
  const code = r.status ?? 1;
  if (!ignoreFail && code !== 0) process.exit(code);
  return code;
}

function prepareOutputTargets() {
  // Start from a clean build so old assets never leak into the next deploy package.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(outDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 });
      break;
    } catch (error) {
      if (attempt === 4) throw error;
      sleep(250);
    }
  }
}

function removeMacMetadata(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.name === '.DS_Store') {
      fs.rmSync(entryPath, { force: true });
      continue;
    }
    if (entry.isDirectory()) removeMacMetadata(entryPath);
  }
}

function removeFinderDuplicateCopies(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const match = entry.name.match(/^(.*) (\d+)(\.[^/]+)?$/);
    if (!match) continue;

    const canonicalName = `${match[1]}${match[3] || ''}`;
    const duplicatePath = path.join(dir, entry.name);
    const canonicalPath = path.join(dir, canonicalName);

    if (fs.existsSync(canonicalPath)) {
      fs.rmSync(duplicatePath, { recursive: true, force: true });
    }
  }
}

prepareOutputTargets();

runNode('generate-geo-files.mjs');
runNode('generate-llms.js', { ignoreFail: true });

// Pull latest CMS data from Worker API (non-fatal: skips if API is unreachable)
function runCodegen() {
  // Prefer the API-based codegen (no secrets needed), fall back to Supabase-based
  const codegenApi = path.join(repoRoot, 'cms', 'scripts', 'codegen-from-api.mjs');
  const codegenSupabase = path.join(repoRoot, 'cms', 'scripts', 'codegen.mjs');

  const script = fs.existsSync(codegenApi) ? codegenApi : codegenSupabase;
  if (!fs.existsSync(script)) {
    console.log('[run-build] No codegen script found, skipping CMS data fetch');
    return;
  }

  // API-based codegen needs no secrets; Supabase-based needs SUPABASE_URL+SERVICE_ROLE_KEY
  if (script === codegenSupabase && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    console.log('[run-build] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set, skipping CMS data fetch');
    return;
  }

  console.log('[run-build] Fetching CMS data...');
  const r = spawnSync(process.execPath, [script], {
    cwd: webRoot,
    stdio: 'inherit',
    env: process.env,
  });
  if ((r.status ?? 1) !== 0) {
    console.warn('[run-build] codegen failed (non-fatal), continuing with existing .generated.js files');
  }
}
runCodegen();

if (!viteCli) {
  console.error('vite CLI not found. Run npm install in apps/web or repo root.');
  process.exit(1);
}

const vite = spawnSync(process.execPath, [viteCli, 'build', '--outDir', '.out'], {
  cwd: webRoot,
  stdio: 'inherit',
});
if ((vite.status ?? 1) !== 0) process.exit(vite.status ?? 1);

runNode('generate-blog-pages.mjs', { ignoreFail: false });

// Ensure dotfiles from public/ are present in output.
// Some hosts rely on .htaccess for SPA rewrites and correct MIME types.
try {
  const htaccessSrc = path.join(webRoot, 'public', '.htaccess');
  const htaccessDst = path.join(webRoot, '.out', '.htaccess');
  if (fs.existsSync(htaccessSrc)) {
    fs.copyFileSync(htaccessSrc, htaccessDst);
  }
} catch {
  // non-fatal
}

runNode('stamp-index-html.mjs');
runNode('generate-static-route-pages.mjs');
removeMacMetadata(outDir);
removeFinderDuplicateCopies(outDir);
runNode('copy-hostinger.mjs', { ignoreFail: true });
