import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { site } from './build/site.js';
import { bluePalette, productionCss } from './build/optimize-css.js';
import { generateSite, cleanStaging, staging } from './build/generate.js';
import { tagIconStyles } from './build/tag-icons.js';

export default defineConfig(async ({ command }) => {
  const optimize = command === 'build' && process.env.SITE_OPTIMIZE !== 'false';
  await cleanStaging();
  const pages = await generateSite();
  return {
    root: staging,
    appType: 'mpa',
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
    base: '/',
    plugins: [site({ optimize, renderTemplates: false, regenerate: generateSite })],
    css: { postcss: { plugins: [tagIconStyles(), bluePalette(), ...(optimize ? [productionCss()] : [])] } },
    build: {
      outDir: fileURLToPath(new URL(process.env.SITE_BASELINE === 'true' ? './dist-baseline' : './dist', import.meta.url)),
      rolldownOptions: { input: pages.filter(page => page.outputPath.endsWith('.html')).map(page => resolve(page.outputPath)) },
      emptyOutDir: true,
      cssCodeSplit: false,
      cssMinify: optimize,
      assetsInlineLimit: 0,
    },
  };
});