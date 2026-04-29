import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3000/';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror:${e?.message || String(e)}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console:${m.text()}`);
});

const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
await page.waitForTimeout(1200);

let rootText = '';
try {
  rootText = await page.$eval('#root', (el) => (el.innerText || '').slice(0, 400));
} catch {
  rootText = '(no #root found)';
}

console.log('URL:', url);
console.log('STATUS:', resp?.status());
console.log('ROOT_TEXT:', JSON.stringify(rootText));
console.log('ERRORS_COUNT:', errors.length);
if (errors.length) console.log(errors.slice(0, 50).join('\n'));

await browser.close();

