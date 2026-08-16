/**
 * Minimal Playwright script to run a search and validate rating badges ordering.
 * Note: Playwright is not added to package.json on purpose; this file is a reference e2e script.
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/home');
  await page.fill('input[placeholder="Pesquisar filmes"]', 'Inception');
  await page.waitForTimeout(1200);
  const items = await page.$$('app-movie-item');
  if (items.length === 0) {
    console.error('No movie items found');
    process.exit(2);
  }

  // expand first item (robust)
  const toggle = await items[0].$('button');
  if (!toggle) {
    console.error('No toggle button found on first item');
    await browser.close();
    process.exit(2);
  }
  await toggle.click();
  // wait for badges to appear inside the expanded item
  await page.waitForSelector('app-movie-item:first-of-type .rs-source__badge', { timeout: 5000 });

  const texts = await page.$$eval('app-movie-item:first-of-type .rs-source__badge', els => els.map(e => e.innerText.trim()));
  console.log('Badges:', texts.join(', '));
  // Expect Letterboxd first if present
  if (texts.length > 0 && texts[0].toLowerCase().includes('letterboxd')) {
    console.log('Priority OK: letterboxd first');
    await browser.close();
    process.exit(0);
  } else {
    console.error('Priority not observed');
    await browser.close();
    process.exit(1);
  }
})();
