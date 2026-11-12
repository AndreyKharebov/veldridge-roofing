/* global process, console, document, window, setTimeout, getComputedStyle */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const modules = path.join(process.env.RUNNER_TEMP, 'services-browser/node_modules');
const { chromium, webkit } = await import(pathToFileURL(path.join(modules, 'playwright/index.mjs')));
const { PNG } = await import(pathToFileURL(path.join(modules, 'pngjs/lib/png.js')));
const { default: pixelmatch } = await import(pathToFileURL(path.join(modules, 'pixelmatch/index.js')));
const out = path.resolve('services-verification');
await fs.mkdir(out, { recursive: true });
const report = { layouts: [], anchors: [], actions: [], regressions: [], errors: [] };
const widths = [1101, 1280, 1440, 1920, 900, 700, 390, 320];
const ids = ['free-inspection', 'roof-replacement', 'damage-repairs', 'roof-renovation', 'commercial-roofing', 'solar-panels', 'roof-maintenance', 'storm-damage-restoration', 'gutters-drainage'];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ready(page, route, base = 'http://127.0.0.1:4173') {
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('main img').forEach((image) => { image.loading = 'eager'; });
  });
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].every((image) => image.complete && image.naturalWidth > 0));
  await wait(150);
}

async function screenshotTop(page, filename) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await wait(100);
  return page.screenshot({ path: path.join(out, filename), fullPage: true, animations: 'disabled' });
}

for (const [engineName, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch();
  let page;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    page = await context.newPage();
    page.on('pageerror', (error) => report.errors.push(`${engineName}: ${error.message}`));

    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await ready(page, '/services');
      assert.equal(await page.title(), 'Roofing Services | Veldridge Roofing');
      assert.equal(await page.locator('main h1').count(), 1);
      assert.equal(await page.locator('.header').count(), 1);
      assert.equal(await page.locator('.footer').count(), 1);
      assert.equal(await page.locator('.service-detail').count(), 6);
      assert.equal(await page.locator('.service-care__card').count(), 3);
      assert.equal(await page.locator('.service-finder__link').count(), 9);
      assert.equal(await page.locator('.header__nav-link.active[href="/services"]').count(), 1);
      const measurements = await page.evaluate(() => {
        const rect = (node) => {
          const box = node.getBoundingClientRect();
          return { x: box.x, y: box.y + window.scrollY, width: box.width, height: box.height };
        };
        const root = document.querySelector('.services-page');
        return {
          viewport: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          font: getComputedStyle(root.querySelector('h1')).fontFamily,
          sections: [...root.children].map((node) => ({ className: node.className, ...rect(node) })),
          images: [...root.querySelectorAll('img')].map((node) => ({ src: node.currentSrc, naturalWidth: node.naturalWidth, naturalHeight: node.naturalHeight, alt: node.alt, ...rect(node) })),
          contactLinks: root.querySelectorAll('a[href="/contact"]').length,
          nestedLinks: root.querySelectorAll('a a').length,
          textOverflow: [...root.querySelectorAll('h1, h2, h3, p, .service-finder__label')].filter((n) => n.scrollWidth > n.clientWidth + 1).map((n) => n.textContent),
        };
      });
      report.layouts.push({ engine: engineName, width, ...measurements });
      if ([1440, 1101, 900, 390].includes(width)) {
        await screenshotTop(page, `${engineName}-services-${width}.png`);
      }
      assert(measurements.scrollWidth <= width + 1, `${engineName} ${width}: horizontal overflow`);
      assert(measurements.font.includes('Plus Jakarta Sans'), 'Wrong product font');
      assert.equal(measurements.images.length, 11);
      assert.equal(measurements.contactLinks, 11);
      assert.equal(measurements.nestedLinks, 0);
      assert.deepEqual(measurements.textOverflow, [], `Text overflow at ${width}`);
      for (const image of measurements.images) {
        assert(image.naturalWidth > 0 && image.width > 0 && image.height > 0, 'Invalid image');
        assert(image.alt.length > 0, 'Missing alt');
        assert(!image.src.includes('figma.com'), 'Temporary runtime image URL');
      }
      if (width === 1440) {
        assert(Math.abs(measurements.images[0].width - 608) < 1);
        assert(Math.abs(measurements.images[0].height - 536) < 1);
        for (const image of measurements.images.slice(1, 7)) {
          assert(Math.abs(image.width - 608) < 1);
          assert(Math.abs(image.height - 432) < 1);
        }
        assert(Math.abs(measurements.images.at(-1).width - 496) < 1);
        assert(Math.abs(measurements.images.at(-1).height - 320) < 1);
      }
    }

    await page.setViewportSize({ width: 1440, height: 1000 });
    await ready(page, '/services');
    await page.getByRole('link', { name: 'Explore Services', exact: true }).click();
    await page.waitForFunction(() => Math.abs(document.getElementById('service-finder').getBoundingClientRect().top - 24) < 3);
    for (const id of ids) {
      await page.locator(`.service-finder__link[href$="#${id}"]`).click();
      await page.waitForFunction((targetId) => {
        const target = document.getElementById(targetId);
        return window.location.hash === `#${targetId}` && document.activeElement === target && Math.abs(target.getBoundingClientRect().top - 24) < 3;
      }, id);
      report.anchors.push({ engine: engineName, id, passed: true });
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('.service-finder__link[href$="#gutters-drainage"]').click();
    await page.waitForFunction(() => Math.abs(document.getElementById('gutters-drainage').getBoundingClientRect().top - 24) < 3);

    for (const selector of ['.page-hero__button', '#damage-repairs .services-page__button', '#roof-maintenance .service-care__card-link', '.page-cta__button']) {
      await ready(page, '/services');
      await page.locator(selector).click();
      await page.getByRole('heading', { name: 'Contact Us', exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, '/contact');
      assert.equal((await page.locator('main h1').innerText()).trim(), 'Contact Us');
      await page.goBack();
      await page.waitForSelector('.services-page');
      report.actions.push({ engine: engineName, selector, passed: true });
    }

    await ready(page, '/services#solar-panels');
    await page.waitForFunction(() => Math.abs(document.getElementById('solar-panels').getBoundingClientRect().top - 24) < 3);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => Math.abs(document.getElementById('solar-panels').getBoundingClientRect().top - 24) < 3);
    await ready(page, '/services#%E0%A4%A');
    assert.equal(await page.locator('main h1').count(), 1);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page, '/services');
    const keyboardLink = page.locator('.service-finder__link[href$="#solar-panels"]');
    await keyboardLink.focus();
    assert.equal(await keyboardLink.evaluate((node) => getComputedStyle(node).outlineStyle), 'solid');
    await keyboardLink.press('Enter');
    await page.waitForFunction(() => Math.abs(document.getElementById('solar-panels').getBoundingClientRect().top - 16) < 3);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'solar-panels');
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await ready(page, '/about', 'http://127.0.0.1:4174');
      const before = PNG.sync.read(await screenshotTop(page, `${engineName}-about-before-${width}.png`));
      await ready(page, '/about');
      const after = PNG.sync.read(await screenshotTop(page, `${engineName}-about-after-${width}.png`));
      assert.equal(after.width, before.width);
      assert.equal(after.height, before.height, `About height changed at ${width}`);
      const diff = new PNG({ width: before.width, height: before.height });
      const changed = pixelmatch(before.data, after.data, diff.data, before.width, before.height, { threshold: 0.1 });
      await fs.writeFile(path.join(out, `${engineName}-about-diff-${width}.png`), PNG.sync.write(diff));
      const ratio = changed / (before.width * before.height);
      report.regressions.push({ engine: engineName, width, changedPixels: changed, ratio });
      assert(ratio < 0.001, `About visual regression: ${ratio}`);
    }
    await context.close();
  } catch (error) {
    report.errors.push(`${engineName}: ${error.stack}`);
    if (page && !page.isClosed()) {
      await page.screenshot({ path: path.join(out, `${engineName}-failure.png`), fullPage: true });
      report[`${engineName}Failure`] = await page.evaluate(() => ({
        url: window.location.href, scrollY: window.scrollY,
        activeElement: document.activeElement?.id,
        finderLinks: [...document.querySelectorAll('.service-finder__link')].map((node) => node.getAttribute('href')),
      }));
    }
  } finally {
    await browser.close();
    await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  }
}

console.log(JSON.stringify({ layouts: report.layouts.length, anchors: report.anchors.length, actions: report.actions.length, regressions: report.regressions, errors: report.errors }, null, 2));
assert.deepEqual(report.errors, [], 'Services verification failed; see report.json');
