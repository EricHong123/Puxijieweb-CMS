/**
 * Prepends a build timestamp to .out/index.html so you can verify deployment
 * (View Page Source → first line <!-- puxijie-build ... -->).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve(process.cwd(), '.out');
const indexPath = path.join(outDir, 'index.html');

const stamp = `<!-- puxijie-build ${new Date().toISOString()} -->\n`;

let html = await fs.readFile(indexPath, 'utf8');
if (html.startsWith('<!-- puxijie-build')) {
  html = html.replace(/^<!-- puxijie-build [^>]+ -->\s*\n?/, '');
}
html = stamp + html;
await fs.writeFile(indexPath, html, 'utf8');
