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
const outterZip = path.join(webRoot, 'outter.zip');

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
  fs.rmSync(outterZip, { force: true });
}

function createOutterZip() {
  // Zip the contents of .out at archive root so host uploads can extract directly.
  const zip = spawnSync('zip', ['-qry', outterZip, '.', '-x', '*.DS_Store', '__MACOSX/*'], {
    cwd: outDir,
    stdio: 'inherit',
  });
  if ((zip.status ?? 1) !== 0) {
    console.error('Failed to create outter.zip from .out contents.');
    process.exit(zip.status ?? 1);
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
createOutterZip();
removeMacMetadata(outDir);
removeFinderDuplicateCopies(outDir);
