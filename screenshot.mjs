import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/najee/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

let n = 1;
while (fs.existsSync(path.join(screenshotsDir, label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`))) {
  n++;
}
const filename = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outputPath = path.join(screenshotsDir, filename);

(async () => {
  const chromeBase = 'C:/Users/najee/.cache/puppeteer/chrome';
  const builds = fs.readdirSync(chromeBase).sort();
  const latest = builds[builds.length - 1];
  const executablePath = path.join(chromeBase, latest, 'chrome-win64', 'chrome.exe');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Scroll through page to trigger observers, then force-reveal all hidden elements
  await page.evaluate(async () => {
    const totalHeight = document.body.scrollHeight;
    const step = 500;
    for (let y = 0; y <= totalHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    // Force-reveal anything the observer missed
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 600));
  });

  await page.screenshot({ path: outputPath, fullPage: true });
  await browser.close();

  console.log(`Screenshot saved: temporary screenshots/${filename}`);
})();
