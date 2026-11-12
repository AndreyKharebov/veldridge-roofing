import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(`${process.env.RUNNER_TEMP}/gallery-browser/package.json`);
const { chromium, webkit } = require('playwright');
const out = 'gallery-verification';
await mkdir(out, { recursive: true });
const report = { checks: [], errors: [] };
const base = 'http://127.0.0.1:4173';
async function loaded(page) {
  await page.locator('.project-card__button').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function photosReady(page) {
  await page.evaluate(async () => {
    const images = [...document.querySelectorAll('img')];
    for (const img of images) img.loading = 'eager';
    await Promise.all(images.map((img) => img.decode().catch(() => {})));
  });
}
async function check(name, task) {
  try { await task(); report.checks.push({ name, passed: true }); }
  catch (error) { report.errors.push({ name, error: String(error), stack: error.stack }); }
}
for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await launcher.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  for (const width of [320, 390, 700, 701, 900, 1000, 1101, 1280, 1440, 1920]) {
    await check(`${engine}: layout and dialog at ${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/gallery`);
      await loaded(page); await photosReady(page);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('header.header').count(), 1);
      assert.equal(await page.locator('footer.footer').count(), 1);
      assert.equal(await page.locator('.project-card__button').count(), 12);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        missing: [...document.images].filter((img) => !img.complete || !img.naturalWidth).map((img) => img.src),
        columns: getComputedStyle(document.querySelector('.project-gallery__grid')).gridTemplateColumns.split(' ').length,
      }));
      assert.equal(metrics.overflow, false);
      assert.deepEqual(metrics.missing, []);
      assert.equal(metrics.columns, width > 1100 ? 3 : width > 700 ? 2 : 1);
      if ([390, 1440].includes(width)) await page.screenshot({ path: `${out}/${engine}-gallery-${width}.png`, fullPage: true });
      const first = page.locator('.project-card__button').first();
      await first.click();
      await page.waitForSelector('dialog[open]'); await photosReady(page);
      // WebKit innerText normalizes explicit newlines differently from Chromium.
      assert.equal(await page.locator('.project-dialog__title').textContent(), 'Standing-Seam\nRoof Upgrade');
      assert.equal(await page.locator('.project-dialog__counter').innerText(), '01 / 03');
      assert.equal(await page.locator('.project-dialog__facts dd').count(), 4);
      assert.equal(await page.locator('.project-dialog__work li').count(), 3);
      const box = await page.locator('dialog').boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
      assert.ok(box.y >= 0 && box.y + box.height <= 901);
      assert.equal(await page.locator('body').evaluate((body) => body.style.position), 'fixed');
      assert.equal(await page.locator('dialog').evaluate((node) => node.scrollWidth > node.clientWidth + 1), false);
      if ([390, 1440].includes(width)) await page.screenshot({ path: `${out}/${engine}-dialog-${width}.png` });
      if (width === 390) {
        await page.locator('.project-dialog__cta').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${out}/${engine}-dialog-mobile-details.png` });
        await page.getByRole('button', { name: 'Close project', exact: true }).click();
      } else await page.keyboard.press('Escape');
      await page.waitForSelector('dialog', { state: 'detached' });
      assert.equal(await page.locator('body').evaluate((body) => body.style.position), '');
      assert.equal(await first.evaluate((node) => document.activeElement === node), true);
    });
  }
  await check(`${engine}: filters, incremental loading and focus`, async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${base}/gallery`); await loaded(page);
    await page.getByRole('button', { name: 'Load More', exact: true }).click();
    assert.equal(await page.locator('.project-card__button').count(), 18);
    assert.equal(await page.getByRole('button', { name: 'Load More', exact: true }).count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'project-card-residential-roofing-concept');
    for (const [category, count] of [['Roof Replacement', 5], ['Repairs', 5], ['Roof Renovation', 4], ['Commercial', 2], ['Solar', 2], ['All Projects', 12]]) {
      const filter = page.getByRole('button', { name: category, exact: true });
      await filter.click();
      assert.equal(await filter.getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.project-card__button').count(), count);
    }
  });
  await check(`${engine}: all project dialogs, photo navigation and close restoration`, async () => {
    await page.goto(`${base}/gallery`); await loaded(page);
    await page.getByRole('button', { name: 'Load More', exact: true }).click();
    const cards = page.locator('.project-card__button');
    for (let i = 0; i < 18; i++) {
      const card = cards.nth(i);
      const name = (await card.getAttribute('aria-label')).replace('View project: ', '');
      await card.scrollIntoViewIfNeeded(); await card.focus();
      const before = await page.evaluate(() => scrollY);
      await page.keyboard.press('Enter'); await page.waitForSelector('dialog[open]');
      assert.equal((await page.locator('.project-dialog__title').textContent()).replace(/\s+/g, ' '), name);
      await page.getByRole('button', { name: 'Next photo', exact: true }).click();
      assert.equal(await page.locator('.project-dialog__counter').innerText(), '02 / 03');
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('.project-dialog__counter').innerText(), '03 / 03');
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('.project-dialog__counter').innerText(), '01 / 03');
      await page.getByRole('button', { name: 'Previous photo', exact: true }).click();
      assert.equal(await page.locator('.project-dialog__counter').innerText(), '03 / 03');
      await page.getByRole('button', { name: /^View photo 2:/ }).click();
      assert.equal(await page.locator('.project-dialog__counter').innerText(), '02 / 03');
      await page.getByRole('button', { name: 'Close project', exact: true }).click();
      await page.waitForSelector('dialog', { state: 'detached' });
      assert.equal(await card.evaluate((node) => document.activeElement === node), true);
      assert.ok(Math.abs(await page.evaluate(() => scrollY) - before) <= 2);
    }
  });
  await check(`${engine}: backdrop, keyboard, anchor and Contact navigation`, async () => {
    await page.goto(`${base}/gallery`); await loaded(page);
    await page.getByRole('link', { name: 'Explore Projects', exact: true }).click();
    await page.waitForURL('**/gallery#projects');
    await page.waitForFunction(() => document.activeElement.id === 'projects');
    await page.locator('.project-card__button').first().click(); await page.waitForSelector('dialog[open]');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Close project');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)), true);
    await page.locator('.header__logo').evaluate((node) => node.focus());
    assert.equal(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)), true);
    await page.mouse.click(2, 2); await page.waitForSelector('dialog', { state: 'detached' });
    await page.locator('.project-card__button').first().click(); await page.waitForSelector('dialog[open]');
    await page.getByRole('link', { name: 'Discuss a Similar Project', exact: true }).click();
    await page.waitForURL('**/contact');
    await page.getByRole('heading', { name: 'Contact Us', exact: true }).waitFor();
    assert.equal(await page.locator('dialog').count(), 0);
    assert.equal(await page.locator('body').evaluate((body) => body.style.position), '');
    assert.equal(await page.evaluate(() => scrollY), 0);
    await page.goto(`${base}/gallery#projects`); await loaded(page);
    await page.waitForFunction(() => document.activeElement.id === 'projects');
    for (const route of ['about', 'services']) {
      await page.goto(`${base}/${route}`); await page.locator('h1').waitFor();
      assert.equal(await page.locator('h1').count(), 1);
    }
    assert.deepEqual(pageErrors, []);
  });
  await check(`${engine}: hover boundaries, reduced motion and touch photo gesture`, async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const width of [1440, 900, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}/gallery`); await loaded(page);
      const card = page.locator('.project-card__button').first();
      await card.hover(); await page.waitForTimeout(250);
      const matrix = await card.evaluate((node) => getComputedStyle(node).transform);
      assert.equal(matrix, width === 1440 ? 'matrix(1, 0, 0, 1, 0, -4)' : 'none');
    }
    await page.locator('.project-card__button').first().click(); await page.waitForSelector('dialog[open]');
    const stage = page.locator('.project-dialog__stage');
    await stage.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 220, clientY: 200 });
    await stage.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 100, clientY: 205 });
    assert.equal(await page.locator('.project-dialog__counter').innerText(), '02 / 03');
    await page.keyboard.press('Escape'); await page.waitForSelector('dialog', { state: 'detached' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.project-card__button').first().hover();
    assert.equal(await page.locator('.project-card__button').first().evaluate((node) => getComputedStyle(node).transform), 'none');
  });
  await browser.close();
}
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ passed: report.checks.length, errors: report.errors }, null, 2));
if (report.errors.length) process.exitCode = 1;
