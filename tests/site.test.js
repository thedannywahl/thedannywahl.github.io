import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { parse as parseYaml } from "yaml";
import { createServer } from "node:http";
import { readFile, readdir, mkdir, writeFile, rm, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative, extname } from "node:path";
import { gzipSync } from "node:zlib";
import postcss from "postcss";
import nunjucks from "nunjucks";
import { bluePalette, pantokenNames, productionCss } from "../build/optimize-css.js";
import {
  projectArtwork,
  projectUrl,
  readProjects,
  renderPage,
  site,
  structuredData,
} from "../build/site.js";
import { normalizePost, readBlog, sanitizeMarkdown } from "../build/blog.js";
import { blogAssets, generateSite, staging } from "../build/generate.js";
import { readTagIcons, tagIconStyles } from "../build/tag-icons.js";
import { createPostMarkdown } from "../build/markdown.js";

let browser;
const servers = [];
const urls = {};
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".xml": "application/atom+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".js": "text/javascript",
};

beforeAll(async () => {
  for (const directory of ["dist", "dist-baseline"]) {
    const root = resolve(directory);
    const server = createServer(async (request, response) => {
      try {
        const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        const filename = resolve(
          root,
          `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`,
        );
        if (relative(root, filename).startsWith("..")) throw new Error("Invalid path");
        response.setHeader("Content-Type", mime[extname(filename)] || "application/octet-stream");
        if (extname(filename) === ".woff2") response.setHeader("Access-Control-Allow-Origin", "*");
        response.end(await readFile(filename));
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise((done) => server.listen(0, "127.0.0.1", done));
    servers.push(server);
    urls[directory] = `http://127.0.0.1:${server.address().port}`;
  }
  browser = await chromium.launch();
  await mkdir("test-results", { recursive: true });
});

afterAll(async () => {
  await browser?.close();
  await Promise.all(servers.map((server) => new Promise((done) => server.close(done))));
});

test("Pantoken names are unprefixed and production pruning preserves example dependencies", () => {
  const css = `@property --instui-unused { syntax: "<color>"; inherits: true; initial-value: blue; }
    @property --instui-example-color { syntax: "<color>"; inherits: true; initial-value: green; }
    :root { --instui-example: var(--instui-example-color); --instui-unreferenced: orange; }
    [data-color-scheme="dark"] { --instui-example: var(--instui-dark-color); --instui-dark-color: black; }
    :root { --instui-live: var(--instui-value); --instui-value: red; }
    @scope (.instui-card) { .instui-button { color: var(--instui-live); } }`;
  const result = postcss([
    pantokenNames(),
    productionCss({ content: ["```css\n.example { background: var(--example); }\n```"] }),
  ]).process(css, {
    from: "probe.css",
  }).css;
  expect(result).not.toContain("--unused");
  expect(result).not.toContain("--unreferenced");
  expect(result).not.toContain("@property");
  expect(result).toContain("--example-color: green");
  expect(result).toContain("--example: var(--example-color)");
  expect(result).toContain("--dark-color: black");
  expect(result).not.toContain("content: var(");
  expect(result).toContain("--live: var(--value)");
  expect(result).toContain("@scope (.card)");
  expect(result).toContain(".button");
  expect(result).not.toContain("instui-");
  const declarations = Array.from(
    { length: 20 },
    (_unused, index) => `--instui-primitive-color-blue-blue${(index + 1) * 10}: #123456;`,
  ).join("");
  expect(
    postcss([bluePalette()]).process(`:root { ${declarations} }`, { from: "palette.css" }).css,
  ).toContain('[data-pantoken-color="blue"]');
  expect(() => postcss([bluePalette()]).process(":root {}", { from: "palette.css" }).css).toThrow(
    "Expected the complete Pantoken blue palette",
  );
});

test("project URLs accept relative paths and HTTPS but reject unsafe schemes", () => {
  for (const url of ["/blog", "blog", "./blog", "../blog", "/blog?tag=css#posts"]) {
    expect(projectUrl(url).origin).toBe("https://iywahl.com");
    expect(projectUrl(url).pathname).toBe("/blog");
  }
  expect(projectUrl("https://pantoken.app").href).toBe("https://pantoken.app/");
  for (const url of [
    "",
    " ",
    null,
    "http://example.com",
    "javascript:alert(1)",
    "data:text/html,test",
  ]) {
    expect(() => projectUrl(url)).toThrow("Invalid project URL");
  }
});

test.each([0, 1, 2])(
  "post list with %i entries uses the container variant only for multiple entries",
  async (count) => {
    const environment = new nunjucks.Environment(null, {
      autoescape: true,
      throwOnUndefined: true,
    });
    environment.addFilter("isoDate", (date) => date.toISOString());
    environment.addFilter("displayDate", (date) => date.toISOString());
    const entry = {
      date: new Date("2026-10-09T00:00:00Z"),
      title: "Example",
      url: "/blog/example/",
      description: "Example post.",
    };
    const html = environment.renderString(await readFile("src/partials/post-list.njk", "utf8"), {
      entries: Array.from({ length: count }, () => entry),
    });
    const page = await browser.newPage();
    await page.setContent(html);
    expect(await page.locator("ol").getAttribute("class")).toBe(
      `post-list card${count > 1 ? " -variant-container" : ""}`,
    );
    expect(await page.locator("li").count()).toBe(count);
    await page.close();
  },
);

test("templates read original artwork and retain accessible project semantics", async () => {
  const projects = readProjects();
  expect(projects.map((project) => project.name)).toEqual([
    "Blog",
    "Pantoken",
    "CSSDoc",
    "automatica11y",
  ]);
  expect(projects[0].color).toBe("sea");
  for (const project of projects) {
    for (const scheme of ["light", "dark"]) {
      const artwork = projectArtwork(project, scheme);
      expect(artwork).toContain('aria-hidden="true"');
      expect(artwork).toContain(`class="og-${scheme}"`);
      expect(artwork).not.toContain(`>${projectUrl(project.url).hostname}</text>`);
    }
  }
  expect(() => projectArtwork(projects[0], "unknown")).toThrow("Invalid color scheme");
  const html = renderPage(await readFile("src/index.html", "utf8"));
  expect(html).not.toContain("{%");
  expect(html).toContain('href="/blog/"');
  expect(html).not.toContain('aria-label="Visit Blog at /blog"');
  expect(html).not.toContain('aria-labelledby="intro-heading"');
  expect(html).not.toContain('aria-label="Visit Pantoken at pantoken.app"');
  const plugin = site({ optimize: false });
  const watched = [];
  plugin.buildStart.call({ addWatchFile: (filename) => watched.push(filename) });
  let onChange;
  const messages = [];
  plugin.configureServer({
    watcher: {
      add() {},
      on(_event, handler) {
        onChange = handler;
      },
    },
    ws: { send: (message) => messages.push(message) },
  });
  onChange(watched[0]);
  onChange("/unrelated-file");
  onChange(resolve("src/assets/projects/new-project-og.svg"));
  expect(messages).toEqual([{ type: "full-reload" }, { type: "full-reload" }]);
});

test.each(["light", "dark"])(
  "%s: screen-reader heading and shared theme button seams retain their styles",
  async (colorScheme) => {
    const page = await browser.newPage({ colorScheme });
    const readControl = () =>
      page.locator(".theme-switcher").evaluate((element) => {
        const group = element.querySelector('[role="group"]');
        const style = getComputedStyle(group);
        return {
          display: style.display,
          gap: style.gap,
          buttons: [...group.querySelectorAll("button")].map((button) => {
            const style = getComputedStyle(button);
            return Object.fromEntries(
              [
                "borderInlineStartWidth",
                "borderInlineEndWidth",
                "borderStartStartRadius",
                "borderStartEndRadius",
                "backgroundColor",
                "color",
              ].map((property) => [property, style[property]]),
            );
          }),
        };
      });
    for (const path of ["/", "/blog/"]) {
      let baseline;
      for (const directory of ["dist-baseline", "dist"]) {
        await page.goto(`${urls[directory]}${path}`);
        await expect.poll(() => page.locator(".theme-switcher").isVisible()).toBe(true);
        expect(await page.locator('[class*="instui-"]').count()).toBe(0);
        const control = await readControl();
        expect(control.display).toBe("flex");
        expect(control.gap).toBe("0px");
        expect(control.buttons).toHaveLength(3);
        expect(parseFloat(control.buttons[0].borderInlineStartWidth)).toBeGreaterThan(0);
        expect(parseFloat(control.buttons[0].borderStartStartRadius)).toBeGreaterThan(0);
        expect(parseFloat(control.buttons[2].borderStartEndRadius)).toBeGreaterThan(0);
        for (const button of control.buttons.slice(1)) {
          expect(button.borderInlineStartWidth).toBe("0px");
          expect(parseFloat(button.borderInlineEndWidth)).toBeGreaterThan(0);
        }
        if (directory === "dist-baseline") baseline = control;
        else expect(control).toEqual(baseline);
        if (path === "/") {
          expect(
            await page.locator("h1").evaluate((element) => {
              const style = getComputedStyle(element);
              return {
                position: style.position,
                clipPath: style.clipPath,
                blockSize: style.blockSize,
                inlineSize: style.inlineSize,
                overflow: style.overflow,
              };
            }),
          ).toEqual({
            position: "absolute",
            clipPath: "inset(50%)",
            blockSize: "1px",
            inlineSize: "1px",
            overflow: "hidden",
          });
          expect(await page.getByRole("heading", { name: "Hi, I'm Danny." }).count()).toBe(1);
        }
      }
    }
    await page.close();
  },
);

test("production output retains public tokens, is self-contained and contains only resolvable CSS references", async () => {
  const files = await readdir("dist/assets");
  const css = await readFile(
    `dist/assets/${files.find((filename) => filename.endsWith(".css"))}`,
    "utf8",
  );
  const baselineFiles = await readdir("dist-baseline/assets");
  const baseline = await readFile(
    `dist-baseline/assets/${baselineFiles.find((filename) => filename.endsWith(".css"))}`,
    "utf8",
  );
  expect(css).not.toContain("instui-");
  expect(css.length).toBeLessThan(baseline.length / 2);
  expect(gzipSync(css).length).toBeLessThan(gzipSync(baseline).length / 2);
  const definitions = new Set();
  const references = new Set();
  const ast = postcss.parse(css);
  ast.walkAtRules("property", (rule) => definitions.add(rule.params));
  ast.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) definitions.add(declaration.prop);
    for (const match of declaration.value.matchAll(/var\((--[a-zA-Z0-9-]+)/g))
      references.add(match[1]);
  });
  expect(definitions.has("--component-card-background-color")).toBe(true);
  const baselineDefinitions = new Set();
  const baselineAst = postcss.parse(baseline);
  baselineAst.walkAtRules("property", (rule) => baselineDefinitions.add(rule.params));
  baselineAst.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--")) baselineDefinitions.add(declaration.prop);
  });
  for (const post of readBlog().posts) {
    const source = await readFile(`src/blog/posts/${post.slug}/index.md`, "utf8");
    for (const [reference] of source.matchAll(/--[\w-]+/g)) {
      if (baselineDefinitions.has(reference)) expect(definitions.has(reference)).toBe(true);
    }
  }
  const inlineShikiVariables = new Set([
    "--shiki-light",
    "--shiki-dark",
    "--shiki-light-bg",
    "--shiki-dark-bg",
  ]);
  expect(
    [...references].filter(
      (reference) => !definitions.has(reference) && !inlineShikiVariables.has(reference),
    ),
  ).toEqual([]);
  const html = await readFile("dist/index.html", "utf8");
  expect(html.split("\n")).toHaveLength(1);
  expect(
    [...html.matchAll(/data:([^;,]+);base64,/g)].every((match) => match[1].startsWith("image/")),
  ).toBe(true);
  expect(files.filter((filename) => filename.endsWith(".js")).sort()).toEqual([
    expect.stringMatching(/^code-tabs-[\w-]+\.js$/),
    expect.stringMatching(/^color-scheme-[\w-]+\.js$/),
  ]);
  expect(files.filter((filename) => filename.endsWith(".woff2"))).toHaveLength(8);
  expect(await readFile("dist/third-party-notices.txt", "utf8")).toContain("SIL OPEN FONT LICENSE");
  expect((await readFile("dist/CNAME", "utf8")).trim()).toBe("iywahl.com");
  console.log(
    `CSS: ${baseline.length} -> ${css.length} bytes; gzip: ${gzipSync(baseline).length} -> ${gzipSync(css).length} bytes`,
  );
});

for (const width of [375, 1280]) {
  for (const colorScheme of ["light", "dark"]) {
    test(`${width}px ${colorScheme}: cards show palette-specific Pantoken focus rings`, async () => {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        colorScheme,
        javaScriptEnabled: false,
      });
      const page = await context.newPage();
      const readFocusStyles = async (checkTokens = false) => {
        const rings = [];
        await page.keyboard.press("Tab");
        for (const link of await page.locator(".project-link").all()) {
          await link.focus();
          rings.push(
            await link.evaluate((element, checkTokens) => {
              const card = element.closest(".project-card");
              const style = getComputedStyle(card);
              const ring = {
                color: style.outlineColor,
                width: style.outlineWidth,
                offset: style.outlineOffset,
                style: style.outlineStyle,
              };
              if (checkTokens) {
                const probe = document.createElement("span");
                probe.style.color = "var(--color-stroke-interactive-focus-ring-base)";
                probe.style.outline =
                  "var(--focus-outline-width) var(--focus-outline-style) currentColor";
                probe.style.outlineOffset = "var(--focus-outline-offset)";
                card.append(probe);
                const tokens = getComputedStyle(probe);
                ring.expected = {
                  color: tokens.color,
                  width: tokens.outlineWidth,
                  offset: tokens.outlineOffset,
                  style: tokens.outlineStyle,
                };
                probe.remove();
              }
              return ring;
            }, checkTokens),
          );
        }
        return rings;
      };
      await page.goto(urls["dist-baseline"]);
      const baselineRings = await readFocusStyles(true);
      expect(baselineRings).toHaveLength(4);
      for (const { expected, ...ring } of baselineRings) {
        expect(ring).toEqual(expected);
        expect(parseFloat(ring.width)).toBeGreaterThan(0);
        expect(parseFloat(ring.offset)).toBeGreaterThanOrEqual(0);
        expect(ring.style).toBe("solid");
      }
      expect(new Set(baselineRings.map((ring) => ring.color)).size).toBe(4);
      await page.goto(urls.dist);
      expect(await readFocusStyles()).toEqual(baselineRings.map(({ expected, ...ring }) => ring));
      await page.locator(".project-link").first().focus();
      await page.screenshot({
        path: `test-results/focus-${width}-${colorScheme}.png`,
        fullPage: true,
      });
      await context.close();
    });

    test(`${width}px ${colorScheme}: production matches baseline without overflow or broken assets`, async () => {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        colorScheme,
        javaScriptEnabled: false,
      });
      const page = await context.newPage();
      const failures = [];
      page.on("pageerror", (error) => failures.push(error.message));
      page.on("requestfailed", (request) => failures.push(request.url()));
      page.on("response", (response) => {
        if (response.status() >= 400) failures.push(response.url());
      });
      const readStyles = async () =>
        page.evaluate(async () => {
          await document.fonts.ready;
          return [
            ...document.querySelectorAll(
              "html, h1, .intro, .project-card, .project-caption, .project-caption span, .project-link, .page-footer",
            ),
          ].map((element) => {
            const style = getComputedStyle(element);
            return Object.fromEntries(
              [
                "color",
                "backgroundColor",
                "fontFamily",
                "fontSize",
                "fontWeight",
                "lineHeight",
                "borderRadius",
                "boxShadow",
                "outlineColor",
                "outlineWidth",
                "outlineOffset",
              ].map((property) => [property, style[property]]),
            );
          });
        });
      await page.goto(urls["dist-baseline"]);
      const baseline = await readStyles();
      await page.goto(urls.dist);
      expect(await readStyles()).toEqual(baseline);
      expect(await page.locator("html").getAttribute("data-pantoken-color")).toBe("sea");
      const cardBackground = await page
        .locator(".project-card")
        .first()
        .evaluate((element) => getComputedStyle(element).backgroundColor);
      expect(
        await page.locator(".project-caption").evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return { background: style.backgroundColor, border: style.borderTopWidth };
          }),
        ),
      ).toEqual(
        Array.from({ length: 4 }, () => ({
          background: cardBackground,
          border: "0px",
        })),
      );
      expect(
        await page.locator('.project-caption .-icon-external-link[aria-hidden="true"]').count(),
      ).toBe(3);
      expect(
        await page.locator(".project-caption .-icon-external-link").evaluateAll((elements) =>
          elements.every((element) => {
            const style = getComputedStyle(element, "::before");
            return (
              style.maskImage !== "none" &&
              parseFloat(style.width) > 0 &&
              parseFloat(style.height) > 0
            );
          }),
        ),
      ).toBe(true);
      expect(await page.locator(".project-caption > span").allTextContents()).toEqual([
        "/blog",
        "pantoken.app ",
        "cssdoc.dev ",
        "automatica11y.dev ",
      ]);
      expect(
        await page.locator(".project-link").evaluateAll((elements) =>
          elements.map((element) => ({
            target: element.getAttribute("target"),
            rel: element.getAttribute("rel"),
            label: element.getAttribute("aria-label"),
          })),
        ),
      ).toEqual([
        { target: null, rel: null, label: null },
        { target: "_blank", rel: "noopener noreferrer", label: null },
        { target: "_blank", rel: "noopener noreferrer", label: null },
        { target: "_blank", rel: "noopener noreferrer", label: null },
      ]);
      for (const name of [
        "Blog /blog",
        "Pantoken pantoken.app",
        "CSSDoc cssdoc.dev",
        "automatica11y automatica11y.dev",
      ]) {
        expect(await page.getByRole("link", { name, exact: true }).count()).toBe(1);
      }
      expect(await page.locator("h1").allTextContents()).toEqual(["Hi, I'm Danny."]);
      expect(await page.locator(".gallery > article").count()).toBe(4);
      expect(await page.locator("footer").textContent()).toBe(
        "\u00a9 2026 Danny Wahl | danny@iywahl.com",
      );
      expect(
        await page
          .locator(".project-link")
          .evaluateAll((elements) => elements.map((element) => element.href)),
      ).toEqual([
        `${urls.dist}/blog/`,
        "https://pantoken.app/",
        "https://cssdoc.dev/",
        "https://automatica11y.dev/",
      ]);
      expect(await page.locator('.project-art > svg[aria-hidden="true"]').count()).toBe(8);
      expect(
        await page
          .locator(`.og-${colorScheme === "light" ? "dark" : "light"}`)
          .evaluateAll((elements) =>
            elements.every((element) => getComputedStyle(element).display === "none"),
          ),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        await page.evaluate(() => document.fonts.check('400 16px "Atkinson Hyperlegible Next"')),
      ).toBe(true);
      expect(
        await page
          .locator(".project-caption > span")
          .evaluateAll(
            (elements) => new Set(elements.map((element) => getComputedStyle(element).color)).size,
          ),
      ).toBe(4);
      expect(
        await page.evaluate(() => {
          const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
          const references = [
            ...document.querySelectorAll('[href^="#"], [fill^="url(#"], [mask^="url(#"]'),
          ];
          return (
            ids.length === new Set(ids).size &&
            references.every((element) => {
              return ["href", "fill", "mask"].every((attribute) => {
                const value = element.getAttribute(attribute);
                if (!value || (attribute !== "href" && !value.startsWith("url(#"))) return true;
                const id = attribute === "href" ? value.slice(1) : value.slice(5, -1);
                return document.getElementById(id) !== null;
              });
            })
          );
        }),
      ).toBe(true);
      await page.keyboard.press("Tab");
      for (const selector of [".project-link", '.page-footer a[href="mailto:danny@iywahl.com"]']) {
        await page.locator(selector).first().focus();
        await expect
          .poll(() =>
            page
              .locator(selector)
              .first()
              .evaluate((element) => {
                const style = getComputedStyle(element.closest(".project-card") || element);
                return style.outlineWidth !== "0px" && style.outlineColor !== "rgba(0, 0, 0, 0)";
              }),
          )
          .toBe(true);
      }
      await page.locator(".project-link").first().focus();
      await page.screenshot({ path: `test-results/${width}-${colorScheme}.png`, fullPage: true });
      expect(failures).toEqual([]);
      await context.close();
    });
  }
}

test("grid breakpoint and reduced motion stay stable", async () => {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const width of [420, 899, 900]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(urls.dist);
    expect(
      await page
        .locator(".gallery")
        .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length),
    ).toBe(width < 900 ? 1 : 2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  expect(
    await page
      .locator(".project-card")
      .first()
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe("0s");
  await page.close();
});

for (const width of [320, 375, 1280]) {
  test(`${width}px: theme button-set switches artwork and preserves gallery geometry`, async () => {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      colorScheme: "dark",
    });
    const page = await context.newPage();
    await page.goto(urls.dist);
    await page.evaluate(() => document.fonts.ready);
    const switcher = page.locator(".theme-switcher");
    await expect.poll(() => switcher.isVisible()).toBe(true);
    const geometry = () =>
      page.locator("main, .gallery, .project-card").evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        }),
      );
    const initialGeometry = await geometry();
    await switcher.evaluate((element) => {
      element.hidden = true;
    });
    expect(await geometry()).toEqual(initialGeometry);
    await switcher.evaluate((element) => {
      element.hidden = false;
    });
    const control = await switcher.boundingBox();
    const gallery = await page.locator(".gallery").boundingBox();
    expect(control.y + control.height).toBeLessThanOrEqual(gallery.y);
    expect(control.x + control.width).toBeLessThanOrEqual(width);
    expect(
      await page
        .locator(".theme-switcher .icon")
        .evaluateAll((elements) =>
          elements.every((element) => getComputedStyle(element, "::before").maskImage !== "none"),
        ),
    ).toBe(true);
    const assertMode = async (mode, scheme) => {
      await expect.poll(() => page.locator("html").getAttribute("data-color-mode")).toBe(mode);
      await expect.poll(() => page.locator("html").getAttribute("data-color-scheme")).toBe(scheme);
      expect(
        await page.locator("html").evaluate((element) => getComputedStyle(element).colorScheme),
      ).toBe(scheme);
      expect(
        await page.locator('.theme-switcher [aria-pressed="true"]').getAttribute("data-color-mode"),
      ).toBe(mode);
      expect(await page.locator(`.og-${scheme}`).first().isVisible()).toBe(true);
      expect(
        await page
          .locator(`.og-${scheme === "light" ? "dark" : "light"}`)
          .first()
          .isVisible(),
      ).toBe(false);
      expect(
        await page
          .locator(".project-caption")
          .first()
          .evaluate((element) => getComputedStyle(element).backgroundColor),
      ).toBe(
        await page
          .locator(".project-card")
          .first()
          .evaluate((element) => getComputedStyle(element).backgroundColor),
      );
      expect(await geometry()).toEqual(initialGeometry);
    };
    await assertMode("system", "dark");
    await page.getByRole("button", { name: "Light", exact: true }).click();
    await assertMode("light", "light");
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await assertMode("light", "light");
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await assertMode("dark", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await assertMode("dark", "dark");
    await page.getByRole("button", { name: "System", exact: true }).click();
    await assertMode("system", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await assertMode("system", "dark");
    await page.screenshot({ path: `test-results/theme-${width}-dark.png`, fullPage: true });
    await context.close();
  });
}

test("theme control remains usable when local storage is blocked or invalid", async () => {
  for (const blocked of [false, true]) {
    const context = await browser.newContext({ colorScheme: "light" });
    await context.addInitScript((blocked) => {
      if (blocked) {
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new Error("Storage blocked");
          },
        });
      } else {
        localStorage.setItem("iywahl-color-mode", "invalid-mode");
      }
    }, blocked);
    const page = await context.newPage();
    await page.goto(urls.dist);
    await expect.poll(() => page.locator("html").getAttribute("data-color-mode")).toBe("system");
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    expect(await page.locator("html").getAttribute("data-color-scheme")).toBe("dark");
    await context.close();
  }
});

test("Pages workflow uses npm, deploys only master, and uploads only the production artifact", async () => {
  const text = await readFile(".github/workflows/deploy.yml", "utf8");
  const workflow = parseYaml(text);
  expect(text.toLowerCase()).not.toContain("deno");
  expect(workflow.on.push.branches).toEqual(["master"]);
  expect(workflow.on.pull_request.branches).toEqual(["master"]);
  expect(workflow.jobs.deploy.needs).toBe("build");
  expect(workflow.jobs.deploy.if).toContain("github.ref == 'refs/heads/master'");
  expect(workflow.jobs.deploy.if).toContain("github.event_name != 'pull_request'");
  expect(workflow.jobs.deploy.permissions).toEqual({ pages: "write", "id-token": "write" });
  const upload = workflow.jobs.build.steps.find((step) =>
    step.uses?.includes("upload-pages-artifact"),
  );
  expect(upload.with.path).toBe("dist");
  expect(upload.if).toBe(workflow.jobs.deploy.if);
});

test("homepage metadata uses a descriptive title and branded social image", async () => {
  const page = await browser.newPage();
  await page.setContent(renderPage(await readFile("src/index.html", "utf8")));
  const title = await page.title();
  expect(title).toBe("Accessible Web Tools by Danny Wahl | Pantoken & CSSDoc");
  expect(title.length).toBeGreaterThanOrEqual(50);
  expect(title.length).toBeLessThanOrEqual(60);
  expect(await page.locator('meta[property="og:title"]').getAttribute("content")).toBe(title);
  expect(await page.locator('meta[name="twitter:title"]').getAttribute("content")).toBe(title);
  const image = "https://iywahl.com/assets/social/iywahl-og-light.png";
  expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toBe(image);
  expect(await page.locator('meta[name="twitter:image"]').getAttribute("content")).toBe(image);
  expect(await page.locator('meta[property="og:image:alt"]').getAttribute("content")).toBe(
    "iyWahl. I break things. Danny Wahl. Software, technology, and EdTech.",
  );
  expect(await page.locator('meta[name="twitter:image:alt"]').getAttribute("content")).toBe(
    "iyWahl. I break things. Danny Wahl. Software, technology, and EdTech.",
  );
  await page.close();
});

test("structured metadata safely serializes titles, authors, dates and topics", () => {
  const post = normalizePost(
    {
      title: '</script><script>alert("title")</script>',
      published_at: "2024-01-01T00:00:00Z",
      modified_at: "2024-02-01T00:00:00Z",
      authors: "Guest Author",
      tags: "CSS, Education",
    },
    "metadata-probe",
  );
  const json = structuredData(post.title, 'Quotes " & <markup>', `${post.url}index.html`, post);
  expect(json).not.toContain("<");
  const article = JSON.parse(json)["@graph"].find((node) => node["@type"] === "BlogPosting");
  expect(article).toMatchObject({
    headline: post.title,
    description: 'Quotes " & <markup>',
    url: post.canonical,
    datePublished: post.date.toISOString(),
    dateModified: post.updated.toISOString(),
    author: { "@type": "Person", name: "Guest Author" },
    keywords: ["CSS", "Education"],
  });
});

test("built pages expose consistent schema.org and social unfurl metadata", async () => {
  const post = readBlog().posts[0];
  const page = await browser.newPage();
  for (const path of ["/", "/blog/", "/blog/page/2/", "/blog/archive/", "/blog/tags/", post.url]) {
    await page.goto(`${urls.dist}${path}`);
    const canonical = `https://iywahl.com${path}`;
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      expect(await page.locator(selector).getAttribute("content")).toBe(title);
    }
    expect(await page.locator('meta[property="og:url"]').getAttribute("content")).toBe(canonical);
    expect(await page.locator('meta[name="twitter:image"]').getAttribute("content")).toBe(
      "https://iywahl.com/assets/social/iywahl-og-light.png",
    );
    const schema = JSON.parse(
      await page.locator('script[type="application/ld+json"]').textContent(),
    );
    expect(schema["@context"]).toBe("https://schema.org");
    const nodes = schema["@graph"];
    const webpage = nodes.find((node) => node["@id"] === `${canonical}#webpage`);
    expect(webpage).toMatchObject({
      url: canonical,
      name: title,
      description,
      "@type": path === "/" ? "ProfilePage" : path === post.url ? "WebPage" : "CollectionPage",
    });
    expect(nodes.find((node) => node["@type"] === "ImageObject")).toMatchObject({
      width: 1200,
      height: 630,
    });
    const ids = new Set(nodes.map((node) => node["@id"]));
    for (const reference of JSON.stringify(nodes).matchAll(/\{"@id":"([^"]+)"\}/g)) {
      expect(ids.has(reference[1])).toBe(true);
    }
    if (path === post.url) {
      expect(nodes.find((node) => node["@type"] === "BlogPosting")).toMatchObject({
        headline: post.title,
        datePublished: post.date.toISOString(),
        dateModified: (post.updated || post.date).toISOString(),
        author: { "@id": "https://iywahl.com/#person" },
      });
    }
  }
  const artwork = {
    "iywahl-og.png": "3cb5d369bc72d90dcc2b12ace0dad5367707aba6e12c81665b54ec7c7784acaf",
    "iywahl-og-light.png": "4f83ef26e8a4af40c7285aae9c3264e601859a5226570a8a530a2f9c9f89b7ae",
    "iywahl-og.svg": "9e650abb23054ab5840b26dc7bb04a130efd78aa16889904ac4b0dc762e5b758",
    "iywahl-og-light.svg": "5cc0ab8b39c8c52cdd755042eeaaaa9124960748d265179d7bd61c9e2eb88b29",
  };
  for (const [filename, hash] of Object.entries(artwork)) {
    const response = await page.request.get(`${urls.dist}/assets/social/${filename}`);
    expect(response.status()).toBe(200);
    expect(
      createHash("sha256")
        .update(await response.body())
        .digest("hex"),
    ).toBe(hash);
  }
  await page.close();
});

test("metadata assets resolve locally and light/dark pages pass accessibility checks", async () => {
  for (const colorScheme of ["light", "dark"]) {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();
    await page.goto(urls.dist);
    await page.evaluate(() => document.fonts.ready);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const paths = await page
      .locator('link[href], meta[property="og:image"], meta[name="twitter:image"]')
      .evaluateAll((elements) =>
        elements
          .map((element) => element.getAttribute("href") || element.getAttribute("content"))
          .filter((value) => !value.startsWith("https://") || new URL(value).pathname !== "/")
          .map((value) => new URL(value, "https://iywahl.com").pathname),
      );
    for (const path of paths)
      expect((await page.request.get(`${urls.dist}${path}`)).status()).toBe(200);
    await context.close();
  }
});

test("blog normalization preserves UTC dates and rejects unsafe metadata", () => {
  const data = {
    title: "An example",
    published_at: "2024-01-30T00:48:19.476Z",
    modified_at: "2015-01-01T00:00:00Z",
    tags: "Moodle, CSS",
    authors: "Danny Wahl",
  };
  const post = normalizePost(data, "don't-use-dev-for-development");
  expect(post.updated).toBeNull();
  expect(post.date.toISOString()).toBe(data.published_at);
  expect(post.topics.map((topic) => topic.slug)).toEqual(["moodle", "css"]);
  expect(post.feedId).toBe("https://iywahl.com/Don't use .dev for Development");
  expect(normalizePost(data, "new-example").feedId).toBe("https://iywahl.com/blog/new-example/");
  expect(
    readBlog().posts.find((entry) => entry.slug === "whats-your-originality-score").description,
  ).toContain("model. What's");
  for (const slug of ["../escape", "archive", "feed", "unsafe/route", ""]) {
    expect(() => normalizePost(data, slug)).toThrow("Invalid blog slug");
  }
  expect(() => normalizePost({ ...data, published_at: "invalid" }, "example")).toThrow(
    "Invalid blog metadata",
  );
  expect(() => normalizePost({ ...data, draft: "false" }, "example")).toThrow("Invalid draft");
  expect(() => normalizePost({ ...data, modified_at: "invalid" }, "example")).toThrow(
    "Invalid modified",
  );
  expect(
    sanitizeMarkdown(
      '<script>alert(1)</script><img src="/blog/picture.png" onerror="alert(1)"><a href="javascript:alert(1)">link</a>',
    ),
  ).toBe('<img src="/blog/picture.png" /><a>link</a>');
});

test("tag map preserves brand colors and emits only selected Pantoken icon styles", () => {
  const mapping = readTagIcons();
  expect(mapping).toEqual({
    css: { icon: "css", color: "#663399" },
    deno: { icon: "deno", color: "#000000" },
    fresh: { icon: "fresh", color: "#FFDB1E" },
    ghost: { icon: "ghost", color: "#15171A" },
    github: { icon: "github", color: "#181717" },
    moodle: { icon: "moodle", color: "#F98012" },
    wordpress: { icon: "wordpress", color: "#21759B" },
  });
  const topics = normalizePost(
    {
      title: "Tags",
      published_at: "2026-10-09T00:00:00Z",
      tags: "Github, Education, Unmapped Topic",
    },
    "tag-probe",
  ).topics;
  expect(topics[0]).toMatchObject({ slug: "github", icon: "github", color: mapping.github.color });
  expect(topics.slice(1)).toEqual([
    { label: "Education", slug: "education", icon: "tag", color: null },
    { label: "Unmapped Topic", slug: "unmapped-topic", icon: "tag", color: null },
  ]);
  expect(
    normalizePost(
      { title: "Fallback", published_at: "2026-10-09T00:00:00Z", tags: "constructor" },
      "fallback-probe",
    ).topics[0],
  ).toMatchObject({ icon: "tag", color: null });
  const css = postcss([tagIconStyles(), pantokenNames()]).process("", {
    from: "tag-probe.css",
  }).css;
  for (const [tag, appearance] of Object.entries(mapping)) {
    expect(css).toContain(`--icon-${appearance.icon}`);
    expect(css).toContain(`data-topic="${tag}"`);
    expect(css).toContain(appearance.color);
  }
  expect(css).not.toContain("--icon-react");
});

for (const colorScheme of ["light", "dark"]) {
  test(`topic pills ${colorScheme}: brand masks, colors, neutral fallback and accessible links`, async () => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 1000 },
      colorScheme,
    });
    const page = await context.newPage();
    const mapping = readTagIcons();
    const posts = readBlog().posts;
    for (const tag of [...Object.keys(mapping), "education"]) {
      const post = posts.find((entry) => entry.topics.some((topic) => topic.slug === tag));
      const readStyles = async () =>
        page.locator(`.post-topic-pill[data-topic="${tag}"]`).evaluate((element) => {
          const style = getComputedStyle(element);
          const glyph = element.querySelector(".icon");
          const iconStyle = getComputedStyle(glyph);
          const mask = getComputedStyle(glyph, "::before");
          return {
            color: style.color,
            background: style.backgroundColor,
            icon: iconStyle.color,
            width: mask.width,
            hasMask: mask.maskImage !== "none",
          };
        });
      await page.goto(`${urls["dist-baseline"]}${post.url}`);
      const baseline = await readStyles();
      await page.goto(`${urls.dist}${post.url}`);
      expect(await readStyles()).toEqual(baseline);
      expect(baseline.hasMask).toBe(true);
      expect(parseFloat(baseline.width)).toBeGreaterThan(0);
      const pill = page.locator(`.post-topic-pill[data-topic="${tag}"]`);
      if (mapping[tag]) {
        expect(
          await pill.evaluate((element, brandColor) => {
            const probe = document.createElement("span");
            probe.style.color = "var(--topic-brand-color)";
            element.append(probe);
            const actual = getComputedStyle(probe).color;
            probe.style.color = brandColor;
            const expected = getComputedStyle(probe).color;
            probe.remove();
            return actual === expected;
          }, mapping[tag].color),
        ).toBe(true);
      }
      expect(await pill.getAttribute("href")).toBe(`/blog/tags/${tag}/`);
      expect(await pill.locator(".icon").getAttribute("aria-hidden")).toBe("true");
      expect(await pill.locator(`.-icon-${mapping[tag]?.icon || "tag"}`).count()).toBe(1);
      await pill.focus();
      expect(
        await pill.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth)),
      ).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect((await new AxeBuilder({ page }).include(".post-topics").analyze()).violations).toEqual(
        [],
      );
    }
    await page.goto(`${urls.dist}/blog/blogging-from-the-cli/`);
    await page.screenshot({ path: `test-results/topic-pills-${colorScheme}.png`, fullPage: true });
    await context.close();
  });
}

test("published posts and colocated assets retain static URLs without exposing source or editor files", async () => {
  const posts = readBlog().posts;
  expect(posts.length).toBeGreaterThan(0);
  for (const asset of await blogAssets()) {
    const digest = createHash("sha256")
      .update(await readFile(asset.source))
      .digest("hex");
    expect(
      createHash("sha256")
        .update(await readFile(`dist/${asset.fileName}`))
        .digest("hex"),
    ).toBe(digest);
    await expect(access(`public/${asset.fileName}`)).rejects.toThrow();
  }
  for (const post of posts) {
    const html = await readFile(`dist${post.url}index.html`, "utf8");
    expect(html).toContain('data-pantoken-color="sea"');
    expect(html).toContain(post.canonical.replaceAll("'", "&#39;"));
    await expect(access(`dist${post.url}index.md`)).rejects.toThrow();
  }
  await expect(access("dist/admin")).rejects.toThrow();
  await expect(access("dist/tools")).rejects.toThrow();
});

test("blog feeds, pagination and sitemap retain stable static routes", async () => {
  const page = await browser.newPage();
  const feed = await readFile("dist/blog/feed.xml", "utf8");
  const result = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    return {
      errors: document.querySelectorAll("parsererror").length,
      entries: document.querySelectorAll("entry").length,
      firstId: document.querySelector("entry id").textContent,
      firstLink: document.querySelector("entry link").getAttribute("href"),
    };
  }, feed);
  expect(result).toEqual({
    errors: 0,
    entries: 57,
    firstId: "https://iywahl.com/Blogging from the CLI",
    firstLink: "https://iywahl.com/blog/blogging-from-the-cli/",
  });
  expect(await readFile("dist/blog/feed", "utf8")).toBe(feed);
  expect(await readFile("dist/feed", "utf8")).toBe(feed);
  await page.goto(`${urls.dist}/blog/`);
  expect(await page.locator(".post-list > li").count()).toBe(10);
  await page.getByRole("link", { name: "Older posts", exact: true }).click();
  expect(new URL(page.url()).pathname).toBe("/blog/page/2/");
  await page.goto(`${urls.dist}/blog/archive/`);
  expect(await page.locator(".archive-year li").count()).toBe(57);
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  expect(
    await page.evaluate(
      (xml) =>
        new DOMParser().parseFromString(xml, "application/xml").querySelectorAll("parsererror")
          .length,
      sitemap,
    ),
  ).toBe(0);
  expect((await page.request.get(`${urls.dist}/blog/does-not-exist/`)).status()).toBe(404);
  await page.close();
});

test("post navigation keeps newer left and older right at either end of the blog", async () => {
  const posts = readBlog().posts;
  const page = await browser.newPage();
  try {
    for (const directory of ["dist", "dist-baseline"]) {
      for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const index of [0, 1, posts.length - 1]) {
          await page.goto(`${urls[directory]}${posts[index].url}`);
          const nav = page.getByRole("navigation", { name: "More posts" });
          const newer = nav.getByRole("link", { name: /^Newer:/ });
          const older = nav.getByRole("link", { name: /^Older:/ });
          expect(await newer.count()).toBe(index > 0 ? 1 : 0);
          expect(await older.count()).toBe(index < posts.length - 1 ? 1 : 0);
          const bounds = await nav.boundingBox();
          if (index > 0) {
            expect(await newer.getAttribute("href")).toBe(posts[index - 1].url);
            expect((await newer.boundingBox()).x).toBeCloseTo(bounds.x, 0);
          }
          if (index < posts.length - 1) {
            expect(await older.getAttribute("href")).toBe(posts[index + 1].url);
            const link = await older.boundingBox();
            expect(link.x + link.width).toBeCloseTo(bounds.x + bounds.width, 0);
          }
        }
      }
    }
  } finally {
    await page.close();
  }
});

test("topics are wrapped in a card and retain responsive columns", async () => {
  const page = await browser.newPage();
  try {
    for (const directory of ["dist", "dist-baseline"]) {
      for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${urls[directory]}/blog/tags/`);
        const topics = page.locator(".card > .topic-index");
        expect(await topics.locator("li").count()).toBe(readBlog().topics.length);
        const layout = await topics.evaluate((list) => ({
          columns: getComputedStyle(list).columnCount,
          padding: parseFloat(getComputedStyle(list.parentElement).paddingTop),
          overflow: document.documentElement.scrollWidth > innerWidth,
        }));
        expect(layout.columns).toBe(width < 600 ? "1" : "2");
        expect(layout.padding).toBeGreaterThan(0);
        expect(layout.overflow).toBe(false);
      }
    }
  } finally {
    await page.close();
  }
});

test("archive years are nested cards inside a full-width card", async () => {
  const page = await browser.newPage();
  try {
    for (const directory of ["dist", "dist-baseline"]) {
      for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${urls[directory]}/blog/archive/`);
        const years = page.locator(".archive-list.card > .archive-year.card.-variant-nested");
        expect(await years.count()).toBe(readBlog().years.length);
        const layout = await page.locator(".archive-list").evaluate((card) => {
          const style = getComputedStyle(card);
          const yearStyle = getComputedStyle(card.firstElementChild.querySelector(".content"));
          return {
            width: card.getBoundingClientRect().width,
            mainWidth:
              card.parentElement.clientWidth -
              parseFloat(getComputedStyle(card.parentElement).paddingLeft) -
              parseFloat(getComputedStyle(card.parentElement).paddingRight),
            gap: parseFloat(style.gap),
            yearBorder: parseFloat(yearStyle.borderTopWidth),
            yearPadding: parseFloat(yearStyle.paddingTop),
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(layout.width).toBeCloseTo(layout.mainWidth, 0);
        expect(layout.gap).toBeGreaterThan(0);
        expect(layout.yearBorder).toBeGreaterThan(0);
        expect(layout.yearPadding).toBeGreaterThan(0);
        expect(layout.overflow).toBe(false);
      }
    }
  } finally {
    await page.close();
  }
});

test("blog post content is capped at 65ch inside a full-width card with responsive padding", async () => {
  const page = await browser.newPage();
  const paddingByWidth = new Map();
  try {
    for (const directory of ["dist-baseline", "dist"]) {
      for (const width of [375, 479, 480, 767, 768, 1024, 1280]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(`${urls[directory]}/blog/blogging-from-the-cli/`);
        await page.evaluate(() => document.fonts.ready);
        const dimensions = await page.locator(".blog-post-content").evaluate((content) => {
          const card = content.parentElement;
          const cardStyle = getComputedStyle(card);
          const available =
            card.clientWidth -
            parseFloat(cardStyle.paddingLeft) -
            parseFloat(cardStyle.paddingRight);
          const probe = document.createElement("div");
          probe.style.width = "65ch";
          const spacing = matchMedia("(min-width: 48em)").matches
            ? "lg"
            : matchMedia("(min-width: 30em)").matches
              ? "md"
              : "sm";
          probe.style.paddingBlockStart = `var(--spacing-padding-container-${spacing})`;
          content.append(probe);
          const limit = probe.getBoundingClientRect().width;
          const expectedPadding = getComputedStyle(probe).paddingTop;
          probe.remove();
          const rect = content.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          return {
            content: rect.width,
            expected: Math.min(available, limit),
            card: cardRect.width,
            article: card.parentElement.getBoundingClientRect().width,
            leftGap: rect.left - cardRect.left,
            rightGap: cardRect.right - rect.right,
            topGap: content.firstElementChild.getBoundingClientRect().top - cardRect.top,
            firstChildMargin: parseFloat(getComputedStyle(content.firstElementChild).marginTop),
            expectedFirstChildMargin: Math.max(0, (available - rect.width) / 2),
            overflow: document.documentElement.scrollWidth > innerWidth,
            padding: [
              cardStyle.paddingTop,
              cardStyle.paddingRight,
              cardStyle.paddingBottom,
              cardStyle.paddingLeft,
            ],
            expectedPadding,
          };
        });
        expect(dimensions.content).toBeCloseTo(dimensions.expected, 0);
        expect(dimensions.card).toBeCloseTo(dimensions.article, 0);
        expect(dimensions.leftGap).toBeCloseTo(dimensions.rightGap, 0);
        expect(dimensions.topGap).toBeCloseTo(dimensions.leftGap, 0);
        expect(dimensions.firstChildMargin).toBeCloseTo(dimensions.expectedFirstChildMargin, 0);
        expect(dimensions.overflow).toBe(false);
        if (directory === "dist-baseline") {
          expect(parseFloat(dimensions.expectedPadding)).toBeGreaterThan(0);
          paddingByWidth.set(width, dimensions.expectedPadding);
        }
        expect(dimensions.padding).toEqual(Array(4).fill(paddingByWidth.get(width)));
      }
    }
  } finally {
    await page.close();
  }
});

test("original hero images lead individual post prose and never appear in post lists", async () => {
  const heroes = (await blogAssets()).filter((asset) => asset.fileName.endsWith("/hero.png"));
  expect(heroes.length).toBeGreaterThan(0);
  const context = await browser.newContext({
    viewport: { width: 375, height: 1000 },
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  try {
    for (const asset of heroes) {
      const postUrl = `/${asset.fileName.slice(0, -"hero.png".length)}`;
      await page.goto(`${urls.dist}${postUrl}`);
      const image = page.locator(".blog-post-content > p:first-child > img");
      expect(await image.count()).toBe(1);
      expect(await image.getAttribute("alt")).not.toBe("");
      expect(await image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(
        true,
      );
      const response = await page.request.get(await image.evaluate((element) => element.src));
      expect(
        createHash("sha256")
          .update(await response.body())
          .digest("hex"),
      ).toBe(
        createHash("sha256")
          .update(await readFile(asset.source))
          .digest("hex"),
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(access(`dist${postUrl}index.md`)).rejects.toThrow();
    }
    for (const path of ["/blog/", "/blog/page/2/", "/blog/tags/wordpress/"]) {
      await page.goto(`${urls.dist}${path}`);
      expect(await page.locator(".post-list img").count()).toBe(0);
    }
  } finally {
    await context.close();
  }
});

test("Shiki highlights exact line ranges and comment notation without unsafe HTML", async () => {
  const markdown = createPostMarkdown();
  const page = await browser.newPage();
  try {
    const lines = ["const a = 1;", "const b = 2;", "const c = 3;", "const d = 4;"];
    await page.setContent(markdown.render(`\`\`\`js {2,4}\n${lines.join("\n")}\n\`\`\``));
    expect(
      await page
        .locator(".line")
        .evaluateAll((elements) => elements.map((element) => element.dataset.line)),
    ).toEqual(["1", "2", "3", "4"]);
    expect(await page.locator(".line.highlighted").allTextContents()).toEqual([lines[1], lines[3]]);
    await page.setContent(markdown.render(`\`\`\`js {2-3}\n${lines.join("\n")}\n\`\`\``));
    expect(await page.locator(".line.highlighted").allTextContents()).toEqual([lines[1], lines[2]]);
    await page.setContent(
      markdown.render("```js\nconst a = 1; // [!code highlight]\nconst b = 2;\n```"),
    );
    expect(await page.locator(".line.highlighted").count()).toBe(1);
    expect(await page.locator("code").textContent()).not.toContain("[!code");
    await page.setContent(
      markdown.render(
        "```js\n// [!code highlight:2]\nconst a = 1;\nconst b = 2;\nconst c = 3;\n```",
      ),
    );
    expect(await page.locator(".line.highlighted").allTextContents()).toEqual([lines[0], lines[1]]);
    const html = markdown.render(
      '# Heading\n\n<script>alert(1)</script>\n\n```html {1}\n<img onerror="alert(1)">\n```',
    );
    expect(html).toContain('id="heading"');
    expect(html).not.toContain("<script>");
    await page.setContent(html);
    expect(await page.locator("img").count()).toBe(0);
    expect(await page.locator("code").textContent()).toBe('<img onerror="alert(1)">');
    expect(() => markdown.render("```not-a-real-language\nexample\n```")).toThrow();
  } finally {
    await page.close();
  }
});

test("Pantoken code tabs support keyboard controls, safe demos and no-JS content", async () => {
  const markdown = createPostMarkdown();
  const code =
    "::: tabs\n@tab HTML\n```html\n<p>Example</p>\n```\n@tab:active CSS\n```css {1}\np { color: red; }\n```\n:::";
  const demo =
    '::: demo\n@tab HTML\n```html\n<p id="result">Initial</p>\n```\n@tab CSS\n```css\np {color: rgb(255, 0, 0)}\n```\n@tab JS\n```js\ndocument.querySelector("p").textContent = "Rendered";\ntry { parent.document.body.dataset.escaped = "yes"; } catch {}\nfetch("https://example.com").catch(() => { document.body.dataset.network = "blocked"; });\n```\n:::';
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(`${urls.dist}/blog/my-posts-wordpress-plugin/`);
    const stylesheet = await page.locator('link[rel="stylesheet"]').getAttribute("href");
    await page.locator(".blog-prose").evaluate(
      (element, html) => {
        element.innerHTML = html;
      },
      createPostMarkdown({ stylesheet }).render(`${code}\n\n${demo}\n\n${code}`),
    );
    const groups = page.locator(".code-tabs");
    expect(await groups.count()).toBe(3);
    expect(await groups.first().locator("iframe").count()).toBe(0);
    expect(
      await groups
        .first()
        .locator(".panel")
        .evaluateAll((elements) => elements.every((element) => !element.hidden)),
    ).toBe(true);
    const ids = await groups
      .locator("[id]")
      .evaluateAll((elements) => elements.map((element) => element.id));
    expect(new Set(ids).size).toBe(ids.length);
    await page.addScriptTag({
      type: "module",
      content: await readFile("src/scripts/code-tabs.js", "utf8"),
    });
    const first = groups.first();
    await expect
      .poll(() => first.getByRole("tab", { name: "CSS" }).getAttribute("aria-selected"))
      .toBe("true");
    await first.getByRole("tab", { name: "CSS" }).focus();
    await page.keyboard.press("ArrowLeft");
    expect(await first.getByRole("tab", { name: "HTML" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    await page.keyboard.press("End");
    expect(await first.getByRole("tab", { name: "CSS" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    await page.keyboard.press("Home");
    expect(await first.getByRole("tab", { name: "HTML" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    await groups.nth(1).getByRole("tab", { name: "Result" }).click();
    const frame = page.frameLocator('iframe[title="Code example result"]');
    await expect.poll(() => frame.locator("#result").textContent()).toBe("Rendered");
    expect(
      await frame.locator("#result").evaluate((element) => getComputedStyle(element).color),
    ).toBe("rgb(255, 0, 0)");
    expect(await page.locator("body").getAttribute("data-escaped")).toBeNull();
    await expect.poll(() => frame.locator("body").getAttribute("data-network")).toBe("blocked");
    expect(await groups.nth(1).locator("iframe").getAttribute("sandbox")).toBe("allow-scripts");
    expect(await first.getByRole("tabpanel", { name: "HTML" }).isVisible()).toBe(true);
    expect(
      await groups.nth(2).getByRole("tab", { name: "CSS" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      (await new AxeBuilder({ page }).include(".code-tabs").exclude("iframe").analyze()).violations,
    ).toEqual([]);
    expect(markdown.render('<iframe src="https://example.com"></iframe>')).not.toContain("iframe");
    expect(markdown.render("```js\nconsole.log(1)\n```")).not.toContain("code-tabs");
    expect(() => markdown.render("::: demo\n@tab A\n```python\nprint(1)\n```\n:::")).toThrow(
      "Demo groups",
    );
  } finally {
    await context.close();
  }
});

test("tabbed and standalone demo results share the same bordered wrapper", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(`${urls.dist}/blog/my-posts-wordpress-plugin/`);
    const stylesheet = await page.locator('link[rel="stylesheet"]').getAttribute("href");
    const markdown = createPostMarkdown({ stylesheet });
    const example = "@tab HTML\n```html\n<p>Same result</p>\n```\n";
    await page.locator(".blog-prose").evaluate(
      (element, html) => {
        element.innerHTML = html;
      },
      markdown.render(`::: demo-result\n${example}:::\n\n::: demo\n${example}:::`),
    );
    const standalone = page.locator(".blog-prose > .code-demo");
    const tabbed = page.locator(".code-tabs > .panel > .code-demo");
    expect(await standalone.count()).toBe(1);
    expect(await tabbed.count()).toBe(1);
    expect(await standalone.locator("iframe").getAttribute("srcdoc")).toBe(
      await tabbed.locator("iframe").getAttribute("srcdoc"),
    );
    const readStyles = (locator) =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return [
          "borderTopWidth",
          "borderTopStyle",
          "borderTopColor",
          "borderRadius",
          "overflow",
        ].map((property) => style[property]);
      });
    expect(await readStyles(tabbed)).toEqual(await readStyles(standalone));
    expect(await standalone.evaluate((element) => getComputedStyle(element).borderTopStyle)).toBe(
      "solid",
    );
    expect(await readStyles(tabbed.locator("iframe"))).toEqual(
      await readStyles(standalone.locator("iframe")),
    );
  } finally {
    await page.close();
  }
});

test.each(["dist", "dist-baseline"])(
  "%s: demo srcdocs share unprefixed Pantoken styles and public tokens",
  async (directory) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(urls[directory]);
      const stylesheet = await page.locator('link[rel="stylesheet"]').getAttribute("href");
      const example =
        '<h2>Example</h2><p>Paragraph <a href="#example">link</a></p><input aria-label="Text"><button type="button">Plain button</button><div class="card" style="color:var(--color-text-muted);background:var(--component-card-background-color)">Public tokens</div>';
      const html = createPostMarkdown({ stylesheet }).render(
        `::: demo-result\n@tab HTML\n\`\`\`html\n${example}\n\`\`\`\n:::`,
      );
      expect(html).toContain("https://iywahl.com http://127.0.0.1:* http://localhost:*");
      await page.locator("main").evaluate(
        (element, content) => {
          element.innerHTML = `<div class="blog-prose"><div id="base-probe" class="blog-prose">${content.example}</div>${content.html}</div>`;
        },
        { example, html },
      );
      await page.addScriptTag({
        type: "module",
        content: await readFile("src/scripts/code-tabs.js", "utf8"),
      });
      const frame = page.frameLocator('iframe[title="Code example result"]');
      const styles = (locator) =>
        locator.evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return [
              "fontFamily",
              "fontSize",
              "fontWeight",
              "lineHeight",
              "color",
              "backgroundColor",
              "paddingTop",
              "marginTop",
              "marginBottom",
            ].map((property) => style[property]);
          }),
        );
      for (const scheme of ["light", "dark"]) {
        await page.locator("html").evaluate((element, value) => {
          element.dataset.colorScheme = value;
        }, scheme);
        await expect
          .poll(() => frame.locator("html").getAttribute("data-color-scheme"))
          .toBe(scheme);
        await frame.locator("h2").evaluate(() => document.fonts.ready);
        await expect
          .poll(() => styles(frame.locator("h2, p, a, input, button, .card")))
          .toEqual(
            await styles(
              page.locator(
                "#base-probe h2, #base-probe p, #base-probe a, #base-probe input, #base-probe button, #base-probe .card",
              ),
            ),
          );
        expect(
          await frame.locator(".card").evaluate((element) => getComputedStyle(element).color),
        ).not.toBe(
          await frame.locator("body").evaluate((element) => getComputedStyle(element).color),
        );
        expect(
          await frame
            .locator(".card")
            .evaluate((element) => parseFloat(getComputedStyle(element).paddingTop)),
        ).toBeGreaterThan(0);
        for (const input of [page.locator("#base-probe input"), frame.locator("input")]) {
          await input.evaluate((element) => {
            element.style.transition = "none";
          });
        }
        await page.locator("#base-probe input").focus();
        const focusColor = await page
          .locator("#base-probe input")
          .evaluate((element) => getComputedStyle(element).outlineColor);
        await frame.locator("input").focus();
        await page.waitForTimeout(200);
        expect(
          await frame
            .locator("input")
            .evaluate((element) => getComputedStyle(element).outlineStyle),
        ).toBe("solid");
        expect(
          await frame
            .locator("input")
            .evaluate((element) => getComputedStyle(element).outlineWidth),
        ).not.toBe("0px");
        expect(
          await frame
            .locator("input")
            .evaluate((element) => getComputedStyle(element).outlineColor),
        ).toBe(focusColor);
        expect(await frame.locator("button").getAttribute("class")).toBeNull();
        expect(await frame.locator("html").getAttribute("data-pantoken-theme")).toBe("rebrand");
        expect(await frame.locator("html").getAttribute("data-pantoken-color")).toBe("sea");
        expect(
          await frame
            .locator("body")
            .evaluate(() =>
              [...document.fonts].some(
                (font) =>
                  font.family.includes("Atkinson Hyperlegible Next") && font.status === "loaded",
              ),
            ),
        ).toBe(true);
      }
    } finally {
      await context.close();
    }
  },
);

test("standalone and tabbed code results follow light, dark, and system themes", async () => {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  try {
    await page.goto(`${urls.dist}/blog/my-posts-wordpress-plugin/`);
    const stylesheet = await page.locator('link[rel="stylesheet"]').getAttribute("href");
    const markdown = createPostMarkdown({ stylesheet });
    const source = "@tab HTML\n```html\n<p>Theme preview</p>\n```\n";
    await page.locator(".blog-prose").evaluate(
      (element, html) => {
        element.innerHTML = html;
      },
      markdown.render(`::: demo-result\n${source}:::\n\n::: demo\n${source}:::`),
    );
    await page.addScriptTag({
      type: "module",
      content: await readFile("src/scripts/code-tabs.js", "utf8"),
    });
    await page.getByRole("tab", { name: "Result", exact: true }).click();
    for (const mode of ["light", "dark", "system"]) {
      await page.locator(`[data-color-mode="${mode}"]`).click();
      const schemes = mode === "system" ? ["light", "dark"] : [mode];
      for (const scheme of schemes) {
        if (mode === "system") await page.emulateMedia({ colorScheme: scheme });
        await expect
          .poll(() => page.locator("html").getAttribute("data-color-scheme"))
          .toBe(scheme);
        const background = await page
          .locator("html")
          .evaluate((element) => getComputedStyle(element).backgroundColor);
        for (const selector of [
          ".blog-prose > .code-demo > iframe",
          ".code-tabs .code-demo > iframe",
        ]) {
          const iframe = page.locator(selector);
          const frame = page.frameLocator(selector);
          await expect
            .poll(() => frame.locator("html").getAttribute("data-color-scheme"))
            .toBe(scheme);
          await expect
            .poll(() =>
              frame
                .locator("html")
                .evaluate((element) => getComputedStyle(element).backgroundColor),
            )
            .toBe(background);
          expect(
            await iframe.evaluate((element) => getComputedStyle(element).backgroundColor),
          ).toBe(background);
          expect(await iframe.getAttribute("sandbox")).toBe("allow-scripts");
        }
      }
    }
  } finally {
    await context.close();
  }
});

test("demo frames grow and shrink with content without vertical scrollbars", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(`${urls.dist}/blog/my-posts-wordpress-plugin/`);
    const stylesheet = await page.locator('link[rel="stylesheet"]').getAttribute("href");
    const source =
      '@tab HTML\n```html\n<div id="content" style="height:600px">Example</div>\n```\n';
    await page.locator(".blog-prose").evaluate(
      (element, html) => {
        element.innerHTML = html;
      },
      createPostMarkdown({ stylesheet }).render(
        `::: demo-result\n${source}:::\n\n::: demo\n${source}:::`,
      ),
    );
    await page.addScriptTag({
      type: "module",
      content: await readFile("src/scripts/code-tabs.js", "utf8"),
    });
    await page.getByRole("tab", { name: "Result", exact: true }).click();
    for (const selector of [
      ".blog-prose > .code-demo > iframe",
      ".code-tabs .code-demo > iframe",
    ]) {
      const iframe = page.locator(selector);
      const frame = page.frameLocator(selector);
      for (const height of [600, 90, 900, 120]) {
        await frame.locator("#content").evaluate((element, value) => {
          element.style.height = `${value}px`;
        }, height);
        await expect.poll(() => iframe.evaluate((element) => element.clientHeight)).toBe(height);
        expect(
          await frame
            .locator("html")
            .evaluate((element) => element.scrollHeight <= element.clientHeight),
        ).toBe(true);
      }
    }
    const before = await page
      .locator("iframe")
      .first()
      .evaluate((element) => element.clientHeight);
    await page.evaluate(() =>
      window.postMessage({ type: "iywahl-demo-height", height: 12345 }, "*"),
    );
    expect(
      await page
        .locator("iframe")
        .first()
        .evaluate((element) => element.clientHeight),
    ).toBe(before);
  } finally {
    await page.close();
  }
});

test("dev watcher regenerates posts and reloads clients after source edits", async () => {
  const handlers = {};
  const messages = [];
  const errors = [];
  let generations = 0;
  site({
    optimize: false,
    renderTemplates: false,
    regenerate: async () => {
      generations++;
    },
  }).configureServer({
    middlewares: { use() {} },
    watcher: {
      add() {},
      on(event, handler) {
        handlers[event] = handler;
      },
    },
    ws: {
      send(message) {
        messages.push(message);
      },
    },
    config: {
      logger: {
        error(error) {
          errors.push(error);
        },
      },
    },
  });
  handlers.all("change", resolve("src/blog/posts/example/index.md"));
  await expect.poll(() => generations).toBe(1);
  expect(messages).toEqual([{ type: "full-reload" }]);
  expect(errors).toEqual([]);
  handlers.all("change", resolve(".generated/site/blog/example/index.html"));
  await new Promise((resolve) => setTimeout(resolve, 120));
  expect(generations).toBe(1);
});

test("production and baseline demo frames reference the bundled site stylesheet", async () => {
  const html = createPostMarkdown().render(
    "::: demo-result\n@tab HTML\n```html\n<p>Example</p>\n```\n:::",
  );
  for (const optimize of [false, true]) {
    const bundle = {
      css: { type: "asset", fileName: "assets/site-test.css", source: "body { color: black; }" },
      html: { type: "asset", fileName: "example.html", source: html },
    };
    await site({ optimize }).generateBundle({}, bundle);
    expect(bundle.html.source).toContain("/assets/site-test.css");
    expect(bundle.html.source).not.toContain("/styles/site.css");
  }
});

test("Shiki line numbers appear in both themes and stay out of copied code", async () => {
  const markdown = createPostMarkdown();
  const body = "```js {2}\nconst a = 1;\nconst b = 2;\n```\n\n```\nplain text\n```";
  const page = await browser.newPage();
  try {
    await page.goto(`${urls.dist}/blog/my-posts-wordpress-plugin/`);
    await page.locator(".blog-prose").evaluate((element, html) => {
      element.innerHTML = html;
    }, markdown.render(body));
    for (const colorScheme of ["light", "dark"]) {
      await page.locator("html").evaluate((element, scheme) => {
        element.dataset.colorScheme = scheme;
      }, colorScheme);
      expect(
        await page.locator(".shiki .line").evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element, "::before");
            return {
              number: style.content,
              selection: style.userSelect,
              width: parseFloat(style.minWidth),
            };
          }),
        ),
      ).toEqual([
        { number: '"1"', selection: "none", width: expect.any(Number) },
        { number: '"2"', selection: "none", width: expect.any(Number) },
        { number: '"1"', selection: "none", width: expect.any(Number) },
      ]);
      expect(
        await page
          .locator(".line.highlighted")
          .evaluate((element) => getComputedStyle(element).backgroundColor),
      ).not.toBe("rgba(0, 0, 0, 0)");
    }
    expect(
      await page
        .locator("code")
        .first()
        .evaluate((element) => {
          const selection = getSelection();
          const range = document.createRange();
          range.selectNodeContents(element);
          selection.removeAllRanges();
          selection.addRange(range);
          return selection.toString();
        }),
    ).toBe("const a = 1;\nconst b = 2;");
  } finally {
    await page.close();
  }
});

test("new posts highlight code literally and drafts remove stale generated routes", async () => {
  const directory = "src/blog/posts/integration-draft-probe";
  const body =
    "---\ntitle: Integration probe\npublished_at: 2026-10-09T00:00:00Z\ndraft: false\ntags: Test\n---\n\n```js {1}\n{{ undefined_example }}\n```\n\n    <script>literal()</script>\n\n<script>unsafe()</script>\n";
  await mkdir(directory, { recursive: true });
  try {
    await writeFile(`${directory}/index.md`, body);
    await writeFile(
      `${directory}/example.png`,
      await readFile("public/assets/favicon/iywahl-favicon.png"),
    );
    await generateSite();
    const filename = resolve(staging, "blog/integration-draft-probe/index.html");
    const html = await readFile(filename, "utf8");
    expect(html).toContain('class="shiki shiki-themes github-light github-dark"');
    expect(html).toMatch(/style="[^"]*--shiki-light-bg:#[\da-f]{3,8}[^"]*"/i);
    expect(html).toMatch(/style="[^"]*--shiki-dark-bg:#[\da-f]{3,8}[^"]*"/i);
    expect(html).toContain("--shiki-light:#");
    expect(html).toContain("--shiki-dark:#");
    expect(html).toContain("undefined_example");
    expect(html).toContain('class="line highlighted"');
    expect(html).toContain("&lt;script&gt;literal()&lt;/script&gt;");
    expect(html).not.toContain("<script>unsafe()");
    expect(await readFile(resolve(staging, "blog/integration-draft-probe/example.png"))).toEqual(
      await readFile(`${directory}/example.png`),
    );
    await writeFile(`${directory}/index.md`, body.replace("draft: false", "draft: true"));
    await generateSite();
    await expect(access(filename)).rejects.toThrow();
    await expect(
      access(resolve(staging, "blog/integration-draft-probe/example.png")),
    ).rejects.toThrow();
    expect(await readFile(resolve(staging, "blog/feed.xml"), "utf8")).not.toContain(
      "Integration probe",
    );
    expect(await readFile(resolve(staging, "sitemap.xml"), "utf8")).not.toContain(
      "integration-draft-probe",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
    await generateSite();
  }
});

for (const width of [320, 1280]) {
  for (const colorScheme of ["light", "dark"]) {
    test(`blog ${width}px ${colorScheme}: readable, accessible, no-JS and intact assets`, async () => {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        colorScheme,
        javaScriptEnabled: false,
      });
      const page = await context.newPage();
      const failures = [];
      page.on("response", (response) => {
        if (response.status() >= 400) failures.push(response.url());
      });
      for (const path of [
        "/blog/",
        "/blog/blogging-from-the-cli/",
        "/blog/migrate-from-wordpress-to-ghost/",
        "/blog/os-x-yosemite-mamp-homebrew-development-setup/",
      ]) {
        const styles = async () =>
          page.locator("h1, .blog-header, .blog-prose, .post-meta").evaluateAll((elements) =>
            elements.map((element) => {
              const style = getComputedStyle(element);
              return [
                "color",
                "fontFamily",
                "fontStyle",
                "fontSize",
                "lineHeight",
                "backgroundColor",
              ].map((property) => style[property]);
            }),
          );
        await page.goto(`${urls["dist-baseline"]}${path}`);
        const baseline = await styles();
        await page.goto(`${urls.dist}${path}`);
        expect(await styles()).toEqual(baseline);
        expect(await page.locator("html").getAttribute("data-pantoken-color")).toBe("sea");
        expect(
          await page.getByRole("link", { name: "iyWahl home", exact: true }).getAttribute("href"),
        ).toBe("/");
        expect(await page.locator(`.blog-brand .og-${colorScheme}`).isVisible()).toBe(true);
        expect(
          await page
            .locator(`.blog-brand .og-${colorScheme === "light" ? "dark" : "light"}`)
            .isVisible(),
        ).toBe(false);
        expect(
          await page
            .locator(".blog-brand img")
            .evaluateAll((images) =>
              images.every((image) => image.complete && image.naturalWidth === 283),
            ),
        ).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        expect(
          await page
            .locator(".blog-prose img")
            .evaluateAll((images) =>
              images.every((image) => image.complete && image.naturalWidth > 0),
            ),
        ).toBe(true);
        if (path === "/blog/" || path === "/blog/blogging-from-the-cli/") {
          const auditContext = await browser.newContext({
            viewport: { width, height: 1000 },
            colorScheme,
          });
          const auditPage = await auditContext.newPage();
          await auditPage.goto(`${urls.dist}${path}`);
          expect((await new AxeBuilder({ page: auditPage }).analyze()).violations).toEqual([]);
          await auditContext.close();
        }
        await page.screenshot({
          path: `test-results/blog-${width}-${colorScheme}-${path.split("/").filter(Boolean).at(-1)}.png`,
          fullPage: path === "/blog/",
        });
      }
      expect(failures).toEqual([]);
      await context.close();
    }, 30000);
  }
}

test("blog appearance persists through navigation and local CMS stays out of production", async () => {
  const page = await browser.newPage();
  await page.goto(`${urls.dist}/blog/`);
  const initialHeader = await page.locator(".blog-header").boundingBox();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  expect(await page.locator(".blog-brand .og-light").isVisible()).toBe(true);
  expect(await page.locator(".blog-brand .og-dark").isVisible()).toBe(false);
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  expect(await page.locator(".blog-brand .og-dark").isVisible()).toBe(true);
  expect(await page.locator(".blog-brand .og-light").isVisible()).toBe(false);
  expect(await page.locator(".blog-header").boundingBox()).toEqual(initialHeader);
  await page.locator(".post-list a").first().click();
  await expect.poll(() => page.locator("html").getAttribute("data-color-scheme")).toBe("dark");
  expect(await page.locator(".blog-brand .og-dark").isVisible()).toBe(true);
  const configuration = parseYaml(await readFile("tools/cms/config.yml", "utf8"));
  expect(configuration.local_backend.url).toBe("http://127.0.0.1:8081/api/v1");
  expect(configuration.collections[0].path).toBe("{{slug}}/index");
  expect(configuration.collections[0].media_folder).toBe("");
  expect(configuration.collections[0].public_folder).toBe("/blog/{{dirname}}");
  expect(configuration.collections[0].fields.find((field) => field.name === "draft").default).toBe(
    true,
  );
  expect(await readFile("tools/cms/index.html", "utf8")).not.toContain("https://");
  await page.close();
});

for (const colorScheme of ["light", "dark"]) {
  test.skipIf(!process.env.CMS_TEST_URL)(
    `local Decap preview stays light with ${colorScheme} system preference`,
    async () => {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      const failures = [];
      page.on("response", (response) => {
        if (response.status() >= 400) failures.push(response.url());
      });
      const readTypography = async (scope) => {
        await scope.evaluate(() => document.fonts.ready);
        return scope.locator("h1, .post-meta, .blog-prose").evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return [
              "fontFamily",
              "fontSize",
              "fontWeight",
              "lineHeight",
              "color",
              "backgroundColor",
            ].map((property) => style[property]);
          }),
        );
      };
      try {
        await page.goto(`${urls.dist}/blog/my-posts-wordpress-plugin/`);
        await page.locator("html").evaluate((element) => {
          element.dataset.colorScheme = "light";
        });
        const expected = await readTypography(page);
        await page.goto(process.env.CMS_TEST_URL);
        await page.getByRole("button", { name: /Login/i }).click();
        await page.getByRole("link", { name: '"My Posts" Wordpress Plugin', exact: true }).click();
        await expect.poll(() => page.frames().length).toBe(2);
        const preview = page.frames().find((frame) => frame !== page.mainFrame());
        await preview.locator(".blog-prose").waitFor();
        await expect
          .poll(() => preview.locator("html").getAttribute("data-pantoken-theme"))
          .toBe("rebrand");
        expect(await preview.locator("html").getAttribute("data-pantoken-color")).toBe("sea");
        expect(await preview.locator("html").getAttribute("data-color-scheme")).toBe("light");
        await expect.poll(() => readTypography(preview)).toEqual(expected);
        expect(
          await preview.evaluate(() =>
            [...document.fonts].some(
              (font) =>
                font.family.includes("Atkinson Hyperlegible Next") && font.status === "loaded",
            ),
          ),
        ).toBe(true);
        await expect
          .poll(() =>
            preview
              .locator(".blog-prose img")
              .evaluateAll(
                (images) =>
                  images.length > 0 &&
                  images.every((image) => image.complete && image.naturalWidth > 0),
              ),
          )
          .toBe(true);
        expect(failures).toEqual([]);
        for (const pathname of [
          "preview/../index.md",
          "preview/assets/missing.woff2",
          "preview/preview.js.map",
        ]) {
          expect(
            (await page.request.get(new URL(pathname, process.env.CMS_TEST_URL).href)).status(),
          ).toBe(404);
        }
      } finally {
        await context.close();
      }
    },
  );
}

test.skipIf(!process.env.CMS_TEST_URL)("local Decap renders sandboxed demo tabs", async () => {
  const directory = "src/blog/posts/integration-demo-probe";
  await expect(access(directory)).rejects.toThrow();
  await mkdir(directory);
  const source =
    "---\ntitle: CMS demo probe\npublished_at: 2024-01-30T00:48:19.476Z\ndraft: true\n---\n\n::: demo\n@tab HTML\n```html\n<p id=\"result\">Initial</p>\n```\n@tab JavaScript\n```js\ndocument.querySelector('p').textContent = 'Preview result';\n```\n:::";
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await writeFile(`${directory}/index.md`, source);
    await page.goto(process.env.CMS_TEST_URL);
    await page.getByRole("button", { name: /Login/i }).click();
    await page.getByRole("link", { name: "CMS demo probe", exact: true }).click();
    const preview = page.frameLocator("#preview-pane");
    await preview.getByRole("tab", { name: "Result", exact: true }).click();
    await expect
      .poll(() => preview.frameLocator("iframe").locator("#result").textContent())
      .toBe("Preview result");
    expect(await preview.locator("iframe").getAttribute("sandbox")).toBe("allow-scripts");
    const result = preview.frameLocator("iframe");
    expect(await result.locator("html").getAttribute("data-color-scheme")).toBe("light");
    await result.locator("p").evaluate(() => document.fonts.ready);
    expect(
      await result.locator("p").evaluate((element) => getComputedStyle(element).fontFamily),
    ).toContain("Atkinson Hyperlegible Next");
    expect(
      await result
        .locator("body")
        .evaluate(() =>
          [...document.fonts].some(
            (font) =>
              font.family.includes("Atkinson Hyperlegible Next") && font.status === "loaded",
          ),
        ),
    ).toBe(true);
    await preview.getByRole("tab", { name: "HTML", exact: true }).click();
    expect(await preview.getByRole("tabpanel", { name: "HTML", exact: true }).isVisible()).toBe(
      true,
    );
  } finally {
    await context.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test.skipIf(!process.env.CMS_TEST_URL)(
  "local Decap preserves Markdown and slugs and writes uploaded media",
  async () => {
    const directory = "src/blog/posts/integration-cms-probe";
    const media = `${directory}/cms-integration-probe.png`;
    const body =
      "This is a temporary **Markdown** round-trip check.\n\n::: tabs\n@tab Template\n```njk {1}\n{{ literal_template }}\n```\n@tab Text\nPlain example\n:::\n\n    <script>literal_code()</script>\n";
    const source = `---\ntitle: CMS integration probe\npublished_at: 2024-01-30T00:48:19.476Z\nmodified_at:\nsnippet: Local CMS test\ntags: Deno, Fresh\nauthors: Danny Wahl\ndraft: true\n---\n\n${body}`;
    await expect(access(`${directory}/index.md`)).rejects.toThrow();
    await expect(access(media)).rejects.toThrow();
    await mkdir(directory, { recursive: true });
    await writeFile(`${directory}/index.md`, source);
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    try {
      await page.goto(process.env.CMS_TEST_URL);
      await page.getByRole("button", { name: /Login/i }).click();
      await page.getByRole("link", { name: "CMS integration probe", exact: true }).click();
      await expect.poll(() => page.frames().length).toBe(2);
      const preview = page.frames().find((frame) => frame !== page.mainFrame());
      await preview.locator(".shiki .line.highlighted").waitFor();
      expect(
        await preview
          .locator(".shiki .line.highlighted")
          .evaluate((element) => getComputedStyle(element, "::before").content),
      ).toBe('"1"');
      await preview.getByRole("tab", { name: "Text", exact: true }).click();
      expect(
        await preview.getByRole("tabpanel", { name: "Text", exact: true }).textContent(),
      ).toContain("Plain example");
      await preview.getByRole("tab", { name: "Template", exact: true }).click();
      expect(await preview.locator(".shiki .line.highlighted").textContent()).toBe(
        "{{ literal_template }}",
      );
      expect(await preview.locator(".shiki").count()).toBe(1);
      const endpoint = new URL("preview/render", process.env.CMS_TEST_URL).href;
      const rendered = await page.request.post(endpoint, { data: { body } });
      expect(rendered.status()).toBe(200);
      expect(await rendered.text()).toBe(createPostMarkdown().render(body));
      expect((await page.request.post(endpoint, { data: { body: 42 } })).status()).toBe(400);
      expect(
        (await page.request.post(endpoint, { data: { body: "x".repeat(1024 * 1024) } })).status(),
      ).toBe(413);
      expect(
        (
          await page.request.post(endpoint, {
            data: { body },
            headers: { Origin: "https://example.com" },
          })
        ).status(),
      ).toBe(403);
      expect(
        (
          await page.request.post(endpoint, {
            data: { body: "```not-a-real-language\nexample\n```" },
          })
        ).status(),
      ).toBe(422);
      await page.locator("[id^=title-field]").fill("CMS integration probe renamed");
      await page.getByRole("button", { name: "Publish", exact: true }).click();
      await page.getByText("Publish now", { exact: true }).click();
      await expect
        .poll(async () =>
          (await readFile(`${directory}/index.md`, "utf8")).includes(
            "CMS integration probe renamed",
          ),
        )
        .toBe(true);
      const saved = await readFile(`${directory}/index.md`, "utf8");
      const frontmatter = parseYaml(saved.match(/^---\n([\s\S]*?)\n---/)[1]);
      expect(frontmatter.draft).toBe(true);
      expect(new Date(frontmatter.published_at).toISOString()).toBe("2024-01-30T00:48:19.476Z");
      expect(saved.slice(saved.indexOf("\n---", 4) + 4).trim()).toBe(body.trim());
      await expect(
        access("src/blog/posts/cms-integration-probe-renamed/index.md"),
      ).rejects.toThrow();
      const uploadContext = await browser.newContext();
      const uploadPage = await uploadContext.newPage();
      uploadPage.setDefaultTimeout(5000);
      try {
        await uploadPage.goto(process.env.CMS_TEST_URL);
        await uploadPage.getByRole("button", { name: /Login/i }).click();
        await uploadPage
          .getByRole("link", { name: "CMS integration probe renamed", exact: true })
          .click();
        await uploadPage.locator("[id^=title-field]").first().waitFor();
        await uploadPage.locator('button[title="Add Component"]').click();
        await uploadPage.getByText("Image", { exact: true }).click();
        await uploadPage.getByRole("button", { name: "Choose an image", exact: true }).click();
        await uploadPage.getByText("Upload", { exact: true }).waitFor();
        await uploadPage.locator("input[type=file]").setInputFiles({
          name: "cms-integration-probe.png",
          mimeType: "image/png",
          buffer: await readFile("public/assets/favicon/iywahl-favicon.png"),
        });
        await uploadPage.getByText("Choose selected", { exact: true }).click();
        await expect
          .poll(() => {
            const frame = uploadPage.frames().find((frame) => frame !== uploadPage.mainFrame());
            return (
              frame
                ?.locator('.blog-prose img[data-cms-asset*="cms-integration-probe"]')
                .evaluateAll(
                  (images) =>
                    images.length > 0 &&
                    images.every((image) => image.complete && image.naturalWidth > 0),
                ) ?? false
            );
          })
          .toBe(true);
        await uploadPage.getByRole("button", { name: "Publish", exact: true }).click();
        await uploadPage.getByText("Publish now", { exact: true }).click();
        await expect
          .poll(async () => {
            try {
              await access(media);
              return true;
            } catch {
              return false;
            }
          })
          .toBe(true);
        expect(await readFile(media)).toEqual(
          await readFile("public/assets/favicon/iywahl-favicon.png"),
        );
        expect(await readFile(`${directory}/index.md`, "utf8")).toContain(
          "/blog/integration-cms-probe/cms-integration-probe.png",
        );
        expect(
          (
            await uploadPage.request.get(
              `${process.env.CMS_TEST_URL}blog/integration-cms-probe/cms-integration-probe.png`,
            )
          ).status(),
        ).toBe(200);
      } finally {
        await uploadContext.close();
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
      await rm(media, { force: true });
      await context.close();
    }
  },
);

test.skipIf(!process.env.CMS_TEST_URL)(
  "local Decap resolves archived images and hides Markdown from media routes",
  async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    try {
      await page.goto(process.env.CMS_TEST_URL);
      await page.getByRole("button", { name: /Login/i }).click();
      await page.getByRole("link", { name: '"My Posts" Wordpress Plugin', exact: true }).click();
      await page.locator("[id^=title-field]").first().waitFor();
      await expect
        .poll(() =>
          page
            .locator('img[src*="my-posts.jpg"]')
            .evaluateAll((images) =>
              images.some((image) => image.complete && image.naturalWidth > 0),
            ),
        )
        .toBe(true);
      expect(
        (
          await page.request.get(
            `${process.env.CMS_TEST_URL}blog/my-posts-wordpress-plugin/my-posts.jpg`,
          )
        ).status(),
      ).toBe(200);
      expect(
        (
          await page.request.get(
            `${process.env.CMS_TEST_URL}blog/my-posts-wordpress-plugin/index.md`,
          )
        ).status(),
      ).toBe(404);
      await page
        .getByRole("button", { name: "Choose different image", exact: true })
        .first()
        .click();
      await page.getByText("my-posts.jpg", { exact: true }).waitFor();
    } finally {
      await context.close();
    }
  },
);
