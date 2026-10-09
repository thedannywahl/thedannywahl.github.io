import { afterAll, beforeAll, expect, test } from 'vitest';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { parse as parseYaml } from 'yaml';
import { createServer } from 'node:http';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import postcss from 'postcss';
import { bluePalette, optimizeCss, productionCss } from '../build/optimize-css.js';
import { projectArtwork, projectUrl, readProjects, renderPage, site } from '../build/site.js';

let browser;
const servers = [];
const urls = {};
const mime = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain', '.js': 'text/javascript' };

beforeAll(async () => {
  for (const directory of ['dist', 'dist-baseline']) {
    const root = resolve(directory);
    const server = createServer(async (request, response) => {
      try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const filename = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
        if (relative(root, filename).startsWith('..')) throw new Error('Invalid path');
        response.setHeader('Content-Type', mime[extname(filename)] || 'application/octet-stream');
        response.end(await readFile(filename));
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    servers.push(server);
    urls[directory] = `http://127.0.0.1:${server.address().port}`;
  }
  browser = await chromium.launch();
  await mkdir('test-results', { recursive: true });
});

afterAll(async () => {
  await browser?.close();
  await Promise.all(servers.map(server => new Promise(done => server.close(done))));
});

test('Pantoken optimization retains live dependencies and removes unused tokens', () => {
  const css = ':root { --instui-live: var(--instui-value); --instui-value: red; --instui-unused: blue; } a { color: var(--instui-live); }';
  const result = optimizeCss(css);
  expect(result).toContain('red');
  expect(result).not.toContain('unused');
  expect(result).not.toContain('--instui-');
  expect(postcss([productionCss()]).process(css, { from: 'probe.css' }).css).toBe(result);
  const declarations = Array.from({ length: 20 }, (_unused, index) =>
    `--instui-primitive-color-blue-blue${(index + 1) * 10}: #123456;`).join('');
  expect(postcss([bluePalette()]).process(`:root { ${declarations} }`, { from: 'palette.css' }).css)
    .toContain('[data-pantoken-color="blue"]');
  expect(() => postcss([bluePalette()]).process(':root {}', { from: 'palette.css' }).css)
    .toThrow('Expected the complete Pantoken blue palette');
});

test('project URLs accept relative paths and HTTPS but reject unsafe schemes', () => {
  for (const url of ['/blog', 'blog', './blog', '../blog', '/blog?tag=css#posts']) {
    expect(projectUrl(url).origin).toBe('https://iywahl.com');
    expect(projectUrl(url).pathname).toBe('/blog');
  }
  expect(projectUrl('https://pantoken.app').href).toBe('https://pantoken.app/');
  for (const url of ['', ' ', null, 'http://example.com', 'javascript:alert(1)', 'data:text/html,test']) {
    expect(() => projectUrl(url)).toThrow('Invalid project URL');
  }
});

test('templates read original artwork and retain accessible project semantics', async () => {
  const projects = readProjects();
  expect(projects.map(project => project.name)).toEqual(['Blog', 'Pantoken', 'CSSDoc', 'automatica11y']);
  expect(projects[0].color).toBe('sea');
  for (const project of projects) {
    for (const scheme of ['light', 'dark']) {
      const artwork = projectArtwork(project, scheme);
      expect(artwork).toContain('aria-hidden="true"');
      expect(artwork).toContain(`class="og-${scheme}"`);
      expect(artwork).not.toContain(`>${projectUrl(project.url).hostname}</text>`);
    }
  }
  expect(() => projectArtwork(projects[0], 'unknown')).toThrow('Invalid color scheme');
  const html = renderPage(await readFile('src/index.html', 'utf8'));
  expect(html).not.toContain('{%');
  expect(html).toContain('href="/blog"');
  expect(html).toContain('Visit Blog at /blog');
  expect(html).not.toContain('aria-labelledby="intro-heading"');
  expect(html).toContain('Visit Pantoken at pantoken.app');
  const plugin = site({ optimize: false });
  const watched = [];
  plugin.buildStart.call({ addWatchFile: filename => watched.push(filename) });
  let onChange;
  const messages = [];
  plugin.configureServer({ watcher: { add() {}, on(_event, handler) { onChange = handler; } },
    ws: { send: message => messages.push(message) } });
  onChange(watched[0]);
  onChange('/unrelated-file');
  onChange(resolve('src/assets/projects/new-project-og.svg'));
  expect(messages).toEqual([{ type: 'full-reload' }, { type: 'full-reload' }]);
});

test('production output is smaller, self-contained and contains only resolvable CSS references', async () => {
  const files = await readdir('dist/assets');
  const css = await readFile(`dist/assets/${files.find(filename => filename.endsWith('.css'))}`, 'utf8');
  const baselineFiles = await readdir('dist-baseline/assets');
  const baseline = await readFile(`dist-baseline/assets/${baselineFiles.find(filename => filename.endsWith('.css'))}`, 'utf8');
  expect(css.length).toBeLessThan(baseline.length / 2);
  expect(gzipSync(css).length).toBeLessThan(gzipSync(baseline).length / 2);
  expect(css).not.toContain('--instui-icon-');
  expect(css).not.toContain('--instui-');
  const definitions = new Set();
  const references = new Set();
  const ast = postcss.parse(css);
  ast.walkDecls(declaration => {
    if (declaration.prop.startsWith('--')) definitions.add(declaration.prop);
    for (const match of declaration.value.matchAll(/var\((--[a-zA-Z0-9-]+)/g)) references.add(match[1]);
  });
  expect([...references].filter(reference => !definitions.has(reference))).toEqual([]);
  const html = await readFile('dist/index.html', 'utf8');
  expect(html.split('\n')).toHaveLength(1);
  expect(html).not.toContain('base64');
  expect(files.filter(filename => filename.endsWith('.js'))).toHaveLength(1);
  expect(files.filter(filename => filename.endsWith('.woff2'))).toHaveLength(4);
  expect(await readFile('dist/third-party-notices.txt', 'utf8')).toContain('SIL OPEN FONT LICENSE');
  expect((await readFile('dist/CNAME', 'utf8')).trim()).toBe('iywahl.com');
  console.log(`CSS: ${baseline.length} -> ${css.length} bytes; gzip: ${gzipSync(baseline).length} -> ${gzipSync(css).length} bytes`);
});

for (const width of [375, 1280]) {
  for (const colorScheme of ['light', 'dark']) {
    test(`${width}px ${colorScheme}: cards show palette-specific Pantoken focus rings`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme, javaScriptEnabled: false });
      const page = await context.newPage();
      const readFocusStyles = async (checkTokens = false) => {
        const rings = [];
        await page.keyboard.press('Tab');
        for (const link of await page.locator('.project-link').all()) {
          await link.focus();
          rings.push(await link.evaluate((element, checkTokens) => {
            const card = element.closest('.project-card');
            const style = getComputedStyle(card);
            const ring = { color: style.outlineColor, width: style.outlineWidth,
              offset: style.outlineOffset, style: style.outlineStyle };
            if (checkTokens) {
              const probe = document.createElement('span');
              probe.style.color = 'var(--instui-color-stroke-interactive-focus-ring-base)';
              probe.style.outline = 'var(--instui-focus-outline-width) var(--instui-focus-outline-style) currentColor';
              probe.style.outlineOffset = 'var(--instui-focus-outline-offset)';
              card.append(probe);
              const tokens = getComputedStyle(probe);
              ring.expected = { color: tokens.color, width: tokens.outlineWidth,
                offset: tokens.outlineOffset, style: tokens.outlineStyle };
              probe.remove();
            }
            return ring;
          }, checkTokens));
        }
        return rings;
      };
      await page.goto(urls['dist-baseline']);
      const baselineRings = await readFocusStyles(true);
      expect(baselineRings).toHaveLength(4);
      for (const { expected, ...ring } of baselineRings) {
        expect(ring).toEqual(expected);
        expect(parseFloat(ring.width)).toBeGreaterThan(0);
        expect(parseFloat(ring.offset)).toBeGreaterThanOrEqual(0);
        expect(ring.style).toBe('solid');
      }
      expect(new Set(baselineRings.map(ring => ring.color)).size).toBe(4);
      await page.goto(urls.dist);
      expect(await readFocusStyles()).toEqual(baselineRings.map(({ expected, ...ring }) => ring));
      await page.locator('.project-link').first().focus();
      await page.screenshot({ path: `test-results/focus-${width}-${colorScheme}.png`, fullPage: true });
      await context.close();
    });

    test(`${width}px ${colorScheme}: production matches baseline without overflow or broken assets`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme, javaScriptEnabled: false });
      const page = await context.newPage();
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      page.on('requestfailed', request => failures.push(request.url()));
      page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
      const readStyles = async () => page.evaluate(async () => {
        await document.fonts.ready;
        return [...document.querySelectorAll('html, h1, .intro, .project-card, .project-caption, .project-caption span, .project-link, .page-footer')]
          .map(element => {
            const style = getComputedStyle(element);
            return Object.fromEntries(['color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
              'borderRadius', 'boxShadow', 'outlineColor', 'outlineWidth', 'outlineOffset'].map(property => [property, style[property]]));
          });
      });
      await page.goto(urls['dist-baseline']);
      const baseline = await readStyles();
      await page.goto(urls.dist);
      expect(await readStyles()).toEqual(baseline);
      expect(await page.locator('html').getAttribute('data-pantoken-color')).toBe('sea');
      expect(await page.locator('.project-caption').evaluateAll(elements => elements.map(element => {
        const style = getComputedStyle(element);
        return { background: style.backgroundColor, border: style.borderTopWidth };
      }))).toEqual(Array.from({ length: 4 }, () => ({
        background: colorScheme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(16, 20, 26)', border: '0px',
      })));
      expect(await page.locator('.project-caption .-icon-external-link[aria-hidden="true"]').count()).toBe(4);
      expect(await page.locator('.project-caption .-icon-external-link').evaluateAll(elements =>
        elements.every(element => {
          const style = getComputedStyle(element, '::before');
          return style.maskImage !== 'none' && parseFloat(style.width) > 0 && parseFloat(style.height) > 0;
        }))).toBe(true);
      expect(await page.locator('h1').allTextContents()).toEqual(["Hi, I'm Danny."]);
      expect(await page.locator('.gallery > article').count()).toBe(4);
      expect(await page.locator('footer').textContent()).toBe('\u00a9 2026 Danny Wahl | danny@iywahl.com');
      expect(await page.locator('.project-link').evaluateAll(elements => elements.map(element => element.href)))
        .toEqual([`${urls.dist}/blog`, 'https://pantoken.app/', 'https://cssdoc.dev/', 'https://automatica11y.dev/']);
      expect(await page.locator('.project-art > svg[aria-hidden="true"]').count()).toBe(8);
      expect(await page.locator(`.og-${colorScheme === 'light' ? 'dark' : 'light'}`).evaluateAll(elements =>
        elements.every(element => getComputedStyle(element).display === 'none'))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.evaluate(() => document.fonts.check('400 16px "Atkinson Hyperlegible Next"'))).toBe(true);
      expect(await page.locator('.project-caption > span').evaluateAll(elements =>
        new Set(elements.map(element => getComputedStyle(element).color)).size)).toBe(4);
      expect(await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
        const references = [...document.querySelectorAll('[href^="#"], [fill^="url(#"], [mask^="url(#"]')];
        return ids.length === new Set(ids).size && references.every(element => {
          return ['href', 'fill', 'mask'].every(attribute => {
            const value = element.getAttribute(attribute);
            if (!value || (attribute !== 'href' && !value.startsWith('url(#'))) return true;
            const id = attribute === 'href' ? value.slice(1) : value.slice(5, -1);
            return document.getElementById(id) !== null;
          });
        });
      })).toBe(true);
      await page.keyboard.press('Tab');
      for (const selector of ['.project-link', '.page-footer a[href="mailto:danny@iywahl.com"]']) {
        await page.locator(selector).first().focus();
        await expect.poll(() => page.locator(selector).first().evaluate(element => {
          const style = getComputedStyle(element.closest('.project-card') || element);
          return style.outlineWidth !== '0px' && style.outlineColor !== 'rgba(0, 0, 0, 0)';
        })).toBe(true);
      }
      await page.locator('.project-link').first().focus();
      await page.screenshot({ path: `test-results/${width}-${colorScheme}.png`, fullPage: true });
      expect(failures).toEqual([]);
      await context.close();
    });
  }
}

test('grid breakpoint and reduced motion stay stable', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  for (const width of [420, 899, 900]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(urls.dist);
    expect(await page.locator('.gallery').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length))
      .toBe(width < 900 ? 1 : 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.locator('.card').first().evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await page.close();
});

for (const width of [320, 375, 1280]) {
  test(`${width}px: theme button-set switches artwork and preserves gallery geometry`, async () => {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto(urls.dist);
    await page.evaluate(() => document.fonts.ready);
    const switcher = page.locator('.theme-switcher');
    await expect.poll(() => switcher.isVisible()).toBe(true);
    const geometry = () => page.locator('main, .gallery, .card').evaluateAll(elements =>
      elements.map(element => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }));
    const initialGeometry = await geometry();
    await switcher.evaluate(element => { element.hidden = true; });
    expect(await geometry()).toEqual(initialGeometry);
    await switcher.evaluate(element => { element.hidden = false; });
    const control = await switcher.boundingBox();
    const gallery = await page.locator('.gallery').boundingBox();
    expect(control.y + control.height).toBeLessThanOrEqual(gallery.y);
    expect(control.x + control.width).toBeLessThanOrEqual(width);
    expect(await page.locator('.theme-switcher .instui-icon').evaluateAll(elements =>
      elements.every(element => getComputedStyle(element, '::before').maskImage !== 'none'))).toBe(true);
    const assertMode = async (mode, scheme) => {
      await expect.poll(() => page.locator('html').getAttribute('data-color-mode')).toBe(mode);
      await expect.poll(() => page.locator('html').getAttribute('data-color-scheme')).toBe(scheme);
      expect(await page.locator('html').evaluate(element => getComputedStyle(element).colorScheme)).toBe(scheme);
      expect(await page.locator('.theme-switcher [aria-pressed="true"]').getAttribute('data-color-mode')).toBe(mode);
      expect(await page.locator(`.og-${scheme}`).first().isVisible()).toBe(true);
      expect(await page.locator(`.og-${scheme === 'light' ? 'dark' : 'light'}`).first().isVisible()).toBe(false);
      expect(await page.locator('.project-caption').first().evaluate(element => getComputedStyle(element).backgroundColor))
        .toBe(scheme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(16, 20, 26)');
      expect(await geometry()).toEqual(initialGeometry);
    };
    await assertMode('system', 'dark');
    await page.getByRole('button', { name: 'Light', exact: true }).click();
    await assertMode('light', 'light');
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await assertMode('light', 'light');
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    await assertMode('dark', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await assertMode('dark', 'dark');
    await page.getByRole('button', { name: 'System', exact: true }).click();
    await assertMode('system', 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await assertMode('system', 'dark');
    await page.screenshot({ path: `test-results/theme-${width}-dark.png`, fullPage: true });
    await context.close();
  });
}

test('theme control remains usable when local storage is blocked or invalid', async () => {
  for (const blocked of [false, true]) {
    const context = await browser.newContext({ colorScheme: 'light' });
    await context.addInitScript(blocked => {
      if (blocked) {
        Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } });
      } else {
        localStorage.setItem('iywahl-color-mode', 'invalid-mode');
      }
    }, blocked);
    const page = await context.newPage();
    await page.goto(urls.dist);
    await expect.poll(() => page.locator('html').getAttribute('data-color-mode')).toBe('system');
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    expect(await page.locator('html').getAttribute('data-color-scheme')).toBe('dark');
    await context.close();
  }
});

test('Pages workflow uses npm, deploys only master, and uploads only the production artifact', async () => {
  const text = await readFile('.github/workflows/deploy.yml', 'utf8');
  const workflow = parseYaml(text);
  expect(text.toLowerCase()).not.toContain('deno');
  expect(workflow.on.push.branches).toEqual(['master']);
  expect(workflow.on.pull_request.branches).toEqual(['master']);
  expect(workflow.jobs.deploy.needs).toBe('build');
  expect(workflow.jobs.deploy.if).toContain("github.ref == 'refs/heads/master'");
  expect(workflow.jobs.deploy.if).toContain("github.event_name != 'pull_request'");
  expect(workflow.jobs.deploy.permissions).toEqual({ pages: 'write', 'id-token': 'write' });
  const upload = workflow.jobs.build.steps.find(step => step.uses?.includes('upload-pages-artifact'));
  expect(upload.with.path).toBe('dist');
  expect(upload.if).toBe(workflow.jobs.deploy.if);
});

test('metadata assets resolve locally and light/dark pages pass accessibility checks', async () => {
  for (const colorScheme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();
    await page.goto(urls.dist);
    await page.evaluate(() => document.fonts.ready);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const paths = await page.locator('link[href], meta[property="og:image"], meta[name="twitter:image"]')
      .evaluateAll(elements => elements.map(element => element.getAttribute('href') || element.getAttribute('content'))
        .filter(value => !value.startsWith('https://') || new URL(value).pathname !== '/')
        .map(value => new URL(value, 'https://iywahl.com').pathname));
    for (const path of paths) expect((await page.request.get(`${urls.dist}${path}`)).status()).toBe(200);
    await context.close();
  }
});