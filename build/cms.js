import { createServer } from "node:http";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile, access, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { build } from "vite-plus";
import { bluePalette, pantokenNames } from "./optimize-css.js";
import { tagIconStyles } from "./tag-icons.js";
import { createPostMarkdown } from "./markdown.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const cache = resolve(root, ".generated/cms");
const version = "3.16.3";
const integrity =
  "hf+dPlCh7TJmWl8+6VRzHYOWhri5xgUknrZbDewaWe4s9B7xJ8PQugp2QHeSldMUKzav6+z0oIpwUYhUJDYtYw==";
const preview = resolve(cache, "preview");

export async function buildPreview() {
  await build({
    configFile: false,
    root,
    base: "/preview/",
    publicDir: false,
    css: { postcss: { plugins: [tagIconStyles(), bluePalette(), pantokenNames()] } },
    build: {
      outDir: preview,
      emptyOutDir: true,
      assetsInlineLimit: 0,
      cssCodeSplit: false,
      rolldownOptions: {
        input: resolve(root, "tools/cms/preview.js"),
        output: {
          entryFileNames: "preview.js",
          assetFileNames: (asset) =>
            asset.names.some((name) => name.endsWith(".css"))
              ? "preview.css"
              : "assets/[name]-[hash][extname]",
        },
      },
    },
  });
}

export async function ensureEditor() {
  const bundle = resolve(cache, "decap-cms.js");
  try {
    await access(bundle);
    return bundle;
  } catch {}
  const response = await fetch(`https://registry.npmjs.org/decap-cms/-/decap-cms-${version}.tgz`);
  if (!response.ok) throw new Error(`CMS download failed: ${response.status}`);
  const archive = Buffer.from(await response.arrayBuffer());
  if (createHash("sha512").update(archive).digest("base64") !== integrity)
    throw new Error("CMS package integrity mismatch");
  await mkdir(cache, { recursive: true });
  const tarball = resolve(cache, "editor.tgz");
  await writeFile(tarball, archive);
  try {
    await promisify(execFile)("tar", [
      "-xzf",
      tarball,
      "--strip-components=2",
      "-C",
      cache,
      "package/dist/decap-cms.js",
    ]);
  } finally {
    await rm(tarball, { force: true });
  }
  return bundle;
}

export async function startCms() {
  const bundle = await ensureEditor();
  await buildPreview();
  const markdown = createPostMarkdown({ stylesheet: "/preview/preview.css", colorScheme: "light" });
  const port = Number(process.env.CMS_PORT || 8079);
  const proxyPort = Number(process.env.CMS_PROXY_PORT || 8081);
  const proxy = spawn(resolve(root, "node_modules/.bin/decap-server"), [], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      BIND_HOST: "127.0.0.1",
      PORT: String(proxyPort),
      ORIGIN: `http://127.0.0.1:${port}`,
    },
  });
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      if (pathname === "/preview/render") {
        if (request.method !== "POST") {
          response.writeHead(405, { Allow: "POST" }).end();
          return;
        }
        if (request.headers.origin && request.headers.origin !== `http://127.0.0.1:${port}`) {
          response.writeHead(403).end("Preview requests must come from the local editor");
          return;
        }
        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of request) {
            size += chunk.length;
            if (size > 1024 * 1024) {
              response.writeHead(413).end("Markdown preview exceeds 1 MiB");
              return;
            }
            chunks.push(chunk);
          }
          const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          if (typeof data?.body !== "string") {
            response.writeHead(400).end("Preview requires a Markdown body string");
            return;
          }
          const html = markdown.render(data.body);
          response
            .writeHead(200, {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-store",
              "X-Content-Type-Options": "nosniff",
            })
            .end(html);
        } catch (error) {
          console.error("CMS Markdown preview failed:", error);
          response
            .writeHead(error instanceof SyntaxError ? 400 : 422)
            .end("Unable to render Markdown preview. Check the code language and Markdown syntax.");
        }
        return;
      }
      if (pathname === "/config.yml") {
        const configuration = parse(await readFile(resolve(root, "tools/cms/config.yml"), "utf8"));
        configuration.local_backend.url = `http://127.0.0.1:${proxyPort}/api/v1`;
        response.setHeader("Content-Type", "text/yaml; charset=utf-8");
        return response.end(stringify(configuration));
      }
      let filename;
      if (pathname === "/" || pathname === "/index.html")
        filename = resolve(root, "tools/cms/index.html");
      else if (pathname === "/decap-cms.js") filename = bundle;
      else if (pathname.startsWith("/preview/")) {
        filename = resolve(preview, pathname.slice("/preview/".length));
        if (relative(preview, filename).startsWith("..") || !/\.(?:css|js|woff2)$/.test(filename)) {
          response.writeHead(404).end();
          return;
        }
      } else if (pathname.startsWith("/blog/")) {
        const media = resolve(root, "src/blog/posts");
        filename = resolve(media, pathname.slice("/blog/".length));
        if (relative(media, filename).startsWith("..")) throw new Error("Invalid media path");
        if (!/\.(?:png|jpe?g|webp|gif|avif|svg|pdf|zip|txt|csv)$/i.test(filename))
          throw new Error("Not a media file");
      } else {
        response.writeHead(404).end();
        return;
      }
      const mime = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".avif": "image/avif",
        ".pdf": "application/pdf",
        ".css": "text/css; charset=utf-8",
        ".woff2": "font/woff2",
      };
      response.setHeader("Content-Type", mime[extname(filename)] || "application/octet-stream");
      response.setHeader("X-Content-Type-Options", "nosniff");
      if (extname(filename) === ".woff2") response.setHeader("Access-Control-Allow-Origin", "*");
      response.end(await readFile(filename));
    } catch {
      response.writeHead(404).end();
    }
  });
  const stop = () => {
    proxy.kill();
    server.close();
  };
  proxy.once("error", (error) => {
    console.error(error.message);
    stop();
    process.exitCode = 1;
  });
  proxy.once("exit", (code) => {
    server.close();
    if (code) process.exitCode = code;
  });
  server.once("error", (error) => {
    console.error(error.message);
    stop();
    process.exitCode = 1;
  });
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  server.listen(port, "127.0.0.1", () =>
    console.log(`Local CMS: http://127.0.0.1:${port}/ (repository: ${root})`),
  );
  return { server, proxy, stop };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--setup")) {
    console.log(`Local CMS bundle: ${await ensureEditor()}`);
  } else {
    await startCms();
  }
}
