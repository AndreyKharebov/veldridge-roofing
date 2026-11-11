import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(path.join(process.env.RUNNER_TEMP, 'about-browser/package.json'));
const { chromium, webkit } = require('playwright');
const output = 'about-verification';
await mkdir(output, { recursive: true });
const results = [];

for (const [name, browserType] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await browserType.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    for (const width of [1101, 1280, 1440, 1920, 900, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://127.0.0.1:4173/about', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page.locator('.about-page img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(img => img.decode());
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      const state = await page.evaluate(() => {
        const about = document.querySelector('.about-page');
        const rect = node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
        return {
          title: document.title,
          viewport: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          headers: document.querySelectorAll('header.header').length,
          footers: document.querySelectorAll('footer.footer').length,
          h1: document.querySelectorAll('h1').length,
          sections: [...about.querySelectorAll('section')].map(n => ({ name: n.className, ...rect(n) })),
          font: getComputedStyle(about).fontFamily,
          images: [...about.querySelectorAll('img')].map(n => ({ src: n.currentSrc, loaded: n.complete && n.naturalWidth > 0, ...rect(n) })),
          links: [...about.querySelectorAll('a')].map(n => ({ text: n.textContent.trim(), href: n.getAttribute('href') })),
          values: document.querySelectorAll('.our-values__card').length,
          steps: document.querySelectorAll('.how-we-work__step').length,
          areas: document.querySelectorAll('.service-areas__card').length,
          mask: getComputedStyle(document.querySelector('.about-hero__image')).maskImage || getComputedStyle(document.querySelector('.about-hero__image')).webkitMaskImage,
        };
      });
      assert.equal(state.title, 'About Us | Veldridge Roofing');
      assert.equal(state.h1, 1);
      assert.equal(state.headers, 1);
      assert.equal(state.footers, 1);
      assert.equal(state.sections.length, 6);
      assert.equal(state.values, 3);
      assert.equal(state.steps, 4);
      assert.equal(state.areas, 3);
      assert.ok(state.documentWidth <= width + 1, `${name} ${width}px: horizontal overflow ${state.documentWidth}`);
      assert.ok(state.font.includes('Plus Jakarta Sans'), `${name}: product font missing`);
      assert.ok(state.images.every(n => n.loaded && n.width > 0 && n.height > 0), `${name}: broken image`);
      assert.ok(state.links.every(n => ['/', '/contact', '/gallery'].includes(n.href)), `${name}: invalid link`);
      if (width > 1100) assert.notEqual(state.mask, 'none');
      if (width === 1440) {
        assert.ok(Math.abs(state.images[0].width - 608) < 1);
        assert.ok(Math.abs(state.images[0].height - 536) < 1);
      }
      await page.screenshot({ path: `${output}/${name}-about-${width}.png`, fullPage: true });
      results.push({ browser: name, width, ...state });
    }

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://127.0.0.1:4173/about');
    const contact = page.getByRole('link', { name: 'Contact Our Team', exact: true });
    await contact.focus();
    const outline = await contact.evaluate(el => getComputedStyle(el).outlineStyle);
    assert.notEqual(outline, 'none', 'Contact button needs a keyboard focus outline');
    await page.keyboard.press('Enter');
    await page.waitForURL('**/contact');
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).click();
    await page.waitForURL('**/about');
    assert.equal(await page.evaluate(() => window.scrollY), 0);
    await page.getByRole('link', { name: 'Explore Our Work', exact: true }).click();
    await page.waitForURL('**/gallery');
    assert.deepEqual(errors, [], `${name}: runtime errors`);
  } finally {
    await browser.close();
  }
}
await writeFile(`${output}/report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify({ status: 'passed', browserLayouts: results.length, browsers: ['chromium', 'webkit'], widths: [1101, 1280, 1440, 1920, 900, 390] }, null, 2));
