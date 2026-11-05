import { defineConfig, lazyPlugins } from "vite-plus";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { site } from "./build/site.js";
import { bluePalette, productionCss } from "./build/optimize-css.js";
import { generateSite, cleanStaging, staging } from "./build/generate.js";
import { tagIconStyles } from "./build/tag-icons.js";

export default defineConfig(async ({ command }) => {
  const optimize = command === "build" && process.env.SITE_OPTIMIZE !== "false";
  await cleanStaging();
  const pages = await generateSite();
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
        plugins: [tagIconStyles(), bluePalette(), ...(optimize ? [productionCss()] : [])],
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
