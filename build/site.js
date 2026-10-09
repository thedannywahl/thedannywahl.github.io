import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, sep } from 'node:path';
import nunjucks from 'nunjucks';
import { optimize as optimizeSvg } from 'svgo';
import { minify } from 'html-minifier-terser';
import { blogAssets } from './generate.js';

const source = fileURLToPath(new URL('../src/', import.meta.url));
const projectAssets = join(source, 'assets/projects');
const dataPath = join(source, 'data/projects.json');

export function projectUrl(url) {
  if (typeof url !== 'string' || !url.trim()) throw new Error('Invalid project URL');
  const resolved = new URL(url, 'https://iywahl.com/');
  if (resolved.protocol !== 'https:') throw new Error(`Invalid project URL: ${url}`);
  return resolved;
}

export function readProjects() {
  const projects = JSON.parse(readFileSync(dataPath, 'utf8'));
  const ids = new Set();
  for (const project of projects) {
    if (!/^[a-z][a-z0-9-]*$/.test(project.id) || ids.has(project.id)) {
      throw new Error(`Invalid or duplicate project ID: ${project.id}`);
    }
    projectUrl(project.url);
    if (!project.name ||
      !['sea', 'blue', 'aurora', 'plum'].includes(project.color)) {
      throw new Error(`Invalid project: ${project.id}`);
    }
    ids.add(project.id);
  }
  return projects;
}

export function projectArtwork(project, scheme) {
  if (!['light', 'dark'].includes(scheme)) throw new Error('Invalid color scheme');
  const themedFilename = `${project.id}-og-${scheme}.svg`;
  const filename = scheme === 'light' || existsSync(join(projectAssets, themedFilename))
    ? themedFilename : `${project.id}-og.svg`;
  const hostname = projectUrl(project.url).hostname;
  const artwork = readFileSync(join(projectAssets, filename), 'utf8');
  return optimizeSvg(artwork, {
    plugins: [
      { name: 'prefixIds', params: { prefix: `${project.id}-${scheme}`, prefixClassNames: false } },
      {
        name: 'project-decoration',
        fn: () => ({
          element: {
            enter(node, parent) {
              if (node.name === 'svg' && parent.type === 'root') {
                Object.assign(node.attributes, {
                  class: `og-${scheme}`,
                  'aria-hidden': 'true',
                  focusable: 'false',
                  preserveAspectRatio: 'xMidYMid slice',
                });
              }
              if (node.name === 'text' && node.attributes.x === '100' &&
                  node.attributes.y === '556' &&
                  node.children.some(child => child.type === 'text' && child.value.trim() === hostname)) {
                parent.children = parent.children.filter(child => child !== node);
              }
            },
          },
        }),
      },
    ],
  }).data;
}

export function renderPage(html) {
  const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(source, {
    noCache: true,
  }), { autoescape: true, throwOnUndefined: true });
  environment.addGlobal('projectArtwork', projectArtwork);
  return environment.renderString(html, { projects: readProjects() });
}

export function site({ optimize, renderTemplates = true, regenerate }) {
  const watched = [dataPath, join(source, 'index.html'),
    ...readdirSync(join(source, 'partials')).map(filename => join(source, 'partials', filename)),
    ...readdirSync(projectAssets).map(filename => join(projectAssets, filename))];
  return {
    name: 'iywahl-static-site',
    enforce: 'post',
    buildStart() {
      for (const filename of watched) this.addWatchFile(filename);
    },
    configureServer(server) {
      if (regenerate) {
        let pending;
        let generation = Promise.resolve();
        server.watcher.add(source);
        server.watcher.on('all', (_event, filename) => {
          if (!filename.startsWith(`${source}${sep}`)) return;
          clearTimeout(pending);
          pending = setTimeout(() => {
            generation = generation.then(regenerate).then(() => server.ws.send({ type: 'full-reload' }))
              .catch(error => { server.config.logger.error(error.stack); server.ws.send({ type: 'error', err: { message: error.message, stack: error.stack } }); });
          }, 80);
        });
        server.httpServer?.once('close', () => clearTimeout(pending));
        server.middlewares.use((request, response, next) => {
          const pathname = new URL(request.url, 'http://localhost').pathname;
          if (!['/blog/feed', '/blog/feed/', '/feed', '/feed/'].includes(pathname)) return next();
          response.setHeader('Content-Type', 'application/atom+xml; charset=utf-8');
          response.end(readFileSync(new URL('../.generated/site/blog/feed.xml', import.meta.url)));
        });
        return;
      }
      server.watcher.add(watched);
      server.watcher.on('change', filename => {
        if (watched.includes(filename) || filename.startsWith(`${projectAssets}${sep}`) ||
            filename.startsWith(`${join(source, 'partials')}${sep}`)) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler: renderTemplates ? renderPage : html => html,
    },
    async generateBundle(_options, bundle) {
      if (!renderTemplates) {
        for (const asset of await blogAssets()) {
          this.emitFile({ type: 'asset', fileName: asset.fileName, source: readFileSync(asset.source) });
        }
        for (const fileName of ['blog/feed.xml', 'sitemap.xml']) {
          this.emitFile({ type: 'asset', fileName,
            source: readFileSync(new URL(`../.generated/site/${fileName}`, import.meta.url)) });
        }
        const feed = readFileSync(new URL('../.generated/site/blog/feed.xml', import.meta.url));
        for (const fileName of ['blog/feed', 'feed']) this.emitFile({ type: 'asset', fileName, source: feed });
      }
      if (!optimize) return;
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'asset' && asset.fileName.endsWith('.html')) {
          asset.source = await minify(String(asset.source), {
            collapseWhitespace: true,
            removeComments: true,
            keepClosingSlash: true,
          });
        }
      }
    },
  };
}