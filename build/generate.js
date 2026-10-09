import Eleventy from '@11ty/eleventy';
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readBlog } from './blog.js';

export const staging = fileURLToPath(new URL('../.generated/site/', import.meta.url));
let previous = new Set();

export async function blogAssets() {
  const root = fileURLToPath(new URL('../src/blog/posts/', import.meta.url));
  const assets = [];
  async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const source = resolve(directory, entry.name);
      if (entry.isDirectory()) await collect(source);
      else if (entry.isFile() && !/\.(?:md|njk)$|\.11tydata\.(?:js|json)$/.test(entry.name)) {
        assets.push({ fileName: `blog/${relative(root, source).split('\\').join('/')}`, source });
      }
    }
  }
  for (const post of readBlog().posts) await collect(resolve(root, post.slug));
  return assets;
}

export async function generateSite() {
  const pages = await new Eleventy(undefined, staging, { quietMode: true }).toJSON();
  const current = new Set();
  for (const page of pages) {
    const filename = resolve(page.outputPath);
    if (relative(staging, filename).startsWith('..')) throw new Error('Generated output escaped staging');
    current.add(filename);
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, page.content);
  }
  for (const asset of await blogAssets()) {
    const filename = resolve(staging, asset.fileName);
    current.add(filename);
    await mkdir(dirname(filename), { recursive: true });
    await cp(asset.source, filename);
  }
  for (const filename of previous) if (!current.has(filename)) await rm(filename, { force: true });
  previous = current;
  for (const directory of ['styles', 'scripts']) {
    await cp(new URL(`../src/${directory}/`, import.meta.url), resolve(staging, directory), { recursive: true });
  }
  return pages;
}

export async function cleanStaging() {
  await rm(staging, { recursive: true, force: true });
  previous = new Set();
}