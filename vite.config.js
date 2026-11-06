import { defineConfig, lazyPlugins } from "vite-plus";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { site } from "./build/site.js";
import { bluePalette, pantokenNames, productionCss } from "./build/optimize-css.js";
import { generateSite, cleanStaging, staging } from "./build/generate.js";
import { tagIconStyles } from "./build/tag-icons.js";
import { readBlog } from "./build/blog.js";

export default defineConfig(async ({ command }) => {
  const optimize = command === "build" && process.env.SITE_OPTIMIZE !== "false";
  await cleanStaging();
  const pages = await generateSite();
  const content = optimize
    ? [
        ...pages.map((page) => page.content),
        ...readBlog().posts.map((post) =>
          readFileSync(new URL(`./src/blog/posts/${post.slug}/index.md`, import.meta.url), "utf8"),
        ),
      ]
    : [];
  return {
    staged: {
      "*": "vp check --fix",
    },
    fmt: {},
    lint: {
      jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
      rules: { "vite-plus/prefer-vite-plus-imports": "error" },
      options: { typeAware: true, typeCheck: true },
    },
    root: staging,
    appType: "mpa",
    publicDir: fileURLToPath(new URL("./public", import.meta.url)),
    base: "/",
    plugins: lazyPlugins(() => [
      site({ optimize, renderTemplates: false, regenerate: generateSite }),
    ]),
    css: {
      postcss: {
        plugins: [
          tagIconStyles(),
          bluePalette(),
          pantokenNames(),
          ...(optimize ? [productionCss({ content })] : []),
        ],
      },
    },
    build: {
      outDir: fileURLToPath(
        new URL(
          process.env.SITE_BASELINE === "true" ? "./dist-baseline" : "./dist",
          import.meta.url,
        ),
      ),
      rolldownOptions: {
        input: pages
          .filter((page) => page.outputPath.endsWith(".html"))
          .map((page) => resolve(page.outputPath)),
      },
      emptyOutDir: true,
      cssCodeSplit: false,
      cssMinify: optimize,
      assetsInlineLimit: 0,
    },
  };
});
