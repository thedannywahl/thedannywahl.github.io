import { createServer } from 'node:http';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, access, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = resolve(root, '.generated/cms');
const version = '3.16.3';
const integrity = 'hf+dPlCh7TJmWl8+6VRzHYOWhri5xgUknrZbDewaWe4s9B7xJ8PQugp2QHeSldMUKzav6+z0oIpwUYhUJDYtYw==';

export async function ensureEditor() {
  const bundle = resolve(cache, 'decap-cms.js');
  try { await access(bundle); return bundle; } catch {}
  const response = await fetch(`https://registry.npmjs.org/decap-cms/-/decap-cms-${version}.tgz`);
  if (!response.ok) throw new Error(`CMS download failed: ${response.status}`);
  const archive = Buffer.from(await response.arrayBuffer());
  if (createHash('sha512').update(archive).digest('base64') !== integrity) throw new Error('CMS package integrity mismatch');
  await mkdir(cache, { recursive: true });
  const tarball = resolve(cache, 'editor.tgz');
  await writeFile(tarball, archive);
  try {
    await promisify(execFile)('tar', ['-xzf', tarball, '--strip-components=2', '-C', cache, 'package/dist/decap-cms.js']);
  } finally { await rm(tarball, { force: true }); }
  return bundle;
}

export async function startCms() {
  const bundle = await ensureEditor();
  const port = Number(process.env.CMS_PORT || 8079);
  const proxyPort = Number(process.env.CMS_PROXY_PORT || 8081);
  const proxy = spawn(resolve(root, 'node_modules/.bin/decap-server'), [], {
    cwd: root, stdio: 'inherit', env: { ...process.env, BIND_HOST: '127.0.0.1', PORT: String(proxyPort), ORIGIN: `http://127.0.0.1:${port}` },
  });
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/config.yml') {
        const configuration = parse(await readFile(resolve(root, 'tools/cms/config.yml'), 'utf8'));
        configuration.local_backend.url = `http://127.0.0.1:${proxyPort}/api/v1`;
        response.setHeader('Content-Type', 'text/yaml; charset=utf-8');
        return response.end(stringify(configuration));
      }
      let filename;
      if (pathname === '/' || pathname === '/index.html') filename = resolve(root, 'tools/cms/index.html');
      else if (pathname === '/decap-cms.js') filename = bundle;
      else if (pathname.startsWith('/blog/')) {
        const media = resolve(root, 'src/blog/posts');
        filename = resolve(media, pathname.slice('/blog/'.length));
        if (relative(media, filename).startsWith('..')) throw new Error('Invalid media path');
        if (!/\.(?:png|jpe?g|webp|gif|avif|svg|pdf|zip|txt|csv)$/i.test(filename)) throw new Error('Not a media file');
      } else { response.writeHead(404).end(); return; }
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.pdf': 'application/pdf' };
      response.setHeader('Content-Type', mime[extname(filename)] || 'application/octet-stream');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.end(await readFile(filename));
    } catch { response.writeHead(404).end(); }
  });
  const stop = () => { proxy.kill(); server.close(); };
  proxy.once('error', error => { console.error(error.message); stop(); process.exitCode = 1; });
  proxy.once('exit', code => { server.close(); if (code) process.exitCode = code; });
  server.once('error', error => { console.error(error.message); stop(); process.exitCode = 1; });
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  server.listen(port, '127.0.0.1', () => console.log(`Local CMS: http://127.0.0.1:${port}/ (repository: ${root})`));
  return { server, proxy, stop };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--setup')) {
    console.log(`Local CMS bundle: ${await ensureEditor()}`);
  } else { await startCms(); }
}