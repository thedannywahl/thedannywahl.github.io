# iywahl.com

![iywahl: I break things.](https://iywahl.com/assets/social/iywahl-og.png)

A static project gallery and Markdown blog built with Eleventy, Vite, and
Pantoken. Eleventy renders templates into an ignored staging directory; Vite
bundles all pages and their shared assets. A small script powers the light/system/dark button-set and remembers
the selection locally. The gallery remains usable without JavaScript, following
the system color scheme. Hosting is GitHub Pages, not Deno.

## Development

Use Node.js 24 or newer.

```sh
npm ci
npx playwright install chromium
npm run dev
```

Vite prints the local URL and reloads when the page, partial, project data, or SVG
assets change. Use `npm run build` to generate `dist/` and `npm run preview` to
inspect the production output. Generated files are not committed.

## Source

- [src/index.html](src/index.html): page content and metadata.
- [src/data/projects.json](src/data/projects.json): project names, URLs, and palettes.
- [src/partials/project-card.njk](src/partials/project-card.njk): shared card markup.
- [src/styles/site.css](src/styles/site.css): package imports and site-owned styles.
- [src/scripts/color-scheme.js](src/scripts/color-scheme.js): persistent appearance control.
- [src/assets/projects](src/assets/projects): original light/dark project SVGs.
- [public/assets](public/assets): site favicons and social images, copied unchanged.
- [build/site.js](build/site.js): rendering, schema.org JSON-LD, SVG processing, and HTML minification.
- [build/optimize-css.js](build/optimize-css.js): Pantoken palette and CSS optimization.

To add a project, add its data record and matching `<id>-og.svg` and
`<id>-og-light.svg` artwork. Project URLs must use HTTPS and IDs must be unique.
SVG IDs and references are prefixed during rendering, and the bottom URL is
omitted in the gallery because it already appears in the caption. Source artwork
remains unchanged. Inline SVGs inherit the locally bundled Atkinson font.

The homepage and blog pages include Open Graph, Twitter cards, and schema.org
JSON-LD. Posts expose their author, publication/update dates, and topics as
`BlogPosting` data. Unfurls use the blue-tinted 1200x630
[public/assets/social/iywahl-og-light.png](public/assets/social/iywahl-og-light.png);
both light and dark artwork are retained in PNG and SVG formats.

## Production Optimization

All token, component, theme, and site CSS is combined before Pantoken's
`@pantoken/plugin-props-minify` prunes unused custom properties, flattens typed
registrations, and consistently shortens property names. Vite then minifies the
CSS and fingerprints assets. HTML is minified after template rendering. There
is no token-generation or template runtime in the browser.

Readable CSS property names remain available during development. Blue palette
values are derived from the installed package to isolate blue cards from the
page's sea palette. Fonts and required third-party attribution ship locally.
Production retains the normal and italic 400, 500, 600, and 700 font weights
used by the gallery and blog; update this set if future content needs other faces.

```sh
npm test
npm run test:coverage
```

Tests build optimized and unoptimized artifacts, report CSS raw/gzip sizes, and
compare computed styles in Chromium across mobile/desktop and light/dark modes.
They also check semantics, SVG references, asset loading, focus, reduced motion,
accessibility, and deployment guards. The suite also checks theme switching,
system changes, storage failures, and unchanged card
geometry with the top-right control. Screenshots go to `test-results/`; coverage
goes to `coverage/coverage-final.json`. Run coverage last after updating tests.
`npm run build:baseline` generates the unoptimized comparison in `dist-baseline/`.

## GitHub Pages

[The workflow](.github/workflows/deploy.yml) validates pull requests and builds
with Node/npm. Pushes to `master`, or a manual workflow run on `master`, deploy
only the optimized `dist/` artifact through the `github-pages` environment.
Pull requests never deploy. No Deno installation or Deno Deploy credentials are
needed.

## Blog

The blog lives at `/blog/`, with pagination, a year archive, topic pages, an
Atom feed at `/blog/feed.xml`, and a sitemap. The old `/blog/feed` and advertised
`/feed` URLs also return Atom XML. Feed IDs remain compatible with the old site.
Everything is static HTML, using the same Pantoken `sea` palette, local Atkinson
fonts, and appearance controls as the gallery. No CMS code ships to readers.

Posts live in [src/blog/posts](src/blog/posts), one `<slug>/index.md` per post.
The directory name is the permanent URL, independent of title edits. Use YAML
frontmatter followed by plain Markdown:

```yaml
---
title: A new post
published_at: 2026-10-09T12:00:00.000Z
modified_at:
snippet: A short description.
tags: CSS, Accessibility
authors: Danny Wahl
draft: true
---
```

Drafts are excluded from pages, listings, feeds, and the sitemap, including in
the local site preview. Set `draft: false` when ready. Dates are displayed in UTC;
an update date earlier than publication is not displayed. New posts use the
same frontmatter as the imported archive. Markdown template expressions remain
literal, indented/fenced code is supported, and executable HTML is stripped.

Builds use only local posts and assets, never Git history or network-fetched
content. [src/data/feed-ids.json](src/data/feed-ids.json) preserves existing Atom
entry IDs, so editing an archived post's title does not create a duplicate feed
entry. New posts use their permanent URL as the feed ID.

Topic pills use [src/data/tag-icons.json](src/data/tag-icons.json) to map topic
slugs to Simple Icons brand slugs. Icon CSS comes from Pantoken's Simple Icons
plugin; brand colors are derived from the installed `simple-icons` registry.
Only mapped glyphs ship in the CSS. Unmapped topics use Pantoken's neutral tag
icon. Brand tints adapt to both themes while labels retain readable text colors.

Post media is colocated beside its `index.md` in [src/blog/posts](src/blog/posts).
Original `/blog/<slug>/<filename>` URLs are preserved by the build; Markdown
bodies and original media bytes are unchanged. Decap's image picker uses the
current post's directory, and new uploads go there too. The global media library
can browse the whole post collection. No archived blog images are stored in
`public/`.
Images and small downloadable files can also be added beside posts manually. Choose
unique filenames; don't rename or delete media already linked by a post. Keep
uploads below 10 MiB as a recommendation, not a CMS-enforced limit. Large video
or audio files should be hosted separately.

## Local Editor

Decap runs only on your machine, without GitHub login, OAuth, or a CMS database:

```sh
npm run cms:setup
npm run cms
```

Open `http://127.0.0.1:8079/` and click **Login** to enter local mode. The editor
and filesystem proxy bind to loopback only. Initial setup downloads a pinned,
integrity-checked editor bundle into the ignored cache; subsequent starts use
that local copy, so editing works offline. `CMS_PORT` and `CMS_PROXY_PORT` can
override the default ports 8079 and 8081. Stop with Ctrl-C.

**Publish now** saves files in this checkout. It does not commit, push, or deploy;
the post's **Draft** field controls whether the site build includes it. Run
`npm run dev` in another terminal to preview saved changes, then review, commit,
and push through your normal Git workflow. Use **Add Component > Image > Choose
an image** for entry-local assets, or **Choose different image** on an existing
image. Existing Markdown image references resolve from their owning post folders.
Use Markdown source mode for
code-heavy posts. Local mode does not support the PR-based editorial workflow.

The editor configuration and UI are in [tools/cms](tools/cms), outside the
public site. [build/cms.js](build/cms.js) always targets this repository, even
when launched from another directory with `node /path/to/repo/build/cms.js`.
There is no deployed `/admin/`. Never expose the local filesystem proxy to a
network or tunnel it publicly; it is a trusted local editing service.

The proxy's Git and validation helpers use scoped security overrides verified
by the local browser smoke test. Some Eleventy/Nunjucks development dependencies
still have upstream audit advisories without patched stable releases; only
trusted local templates and content should enter this build. The public site
has no generator or CMS runtime.

With the local CMS running, its optional save/upload smoke test is:

```sh
CMS_TEST_URL=http://127.0.0.1:8079/ npx vitest run -t 'local Decap'
```

The normal CI suite runs offline against imported content and skips that
interactive-service test. After updating tests, run `npm run test:coverage` last.

In the repository's **Settings > Pages**, select **GitHub Actions** as the build
source. Set the custom domain to `iywahl.com`, configure its DNS for GitHub Pages,
and enable **Enforce HTTPS** once GitHub has provisioned the certificate.
[public/CNAME](public/CNAME) and canonical/social URLs target `https://iywahl.com/`.
GitHub Pages settings, DNS, and the first deployment must be confirmed separately;
the local build does not change them.
