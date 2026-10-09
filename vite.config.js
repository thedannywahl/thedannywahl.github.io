import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { site } from './build/site.js';
import { bluePalette, productionCss } from './build/optimize-css.js';

export default defineConfig(({ command }) => {
  const optimize = command === 'build' && process.env.SITE_OPTIMIZE !== 'false';
  return {
    root: fileURLToPath(new URL('./src', import.meta.url)),
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
    base: '/',
    plugins: [site({ optimize })],
    css: { postcss: { plugins: [bluePalette(), ...(optimize ? [productionCss()] : [])] } },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      cssCodeSplit: false,
      cssMinify: optimize,
      assetsInlineLimit: 0,
    },
  };
});