# iywahl.com

![iywahl: I break things.](https://iywahl.com/assets/social/iywahl-og.png)

A static project gallery and Markdown blog built with Eleventy, Vite, and
Pantoken. Markdown Exit handles post rendering and excerpt parsing, with
markdown-it-compatible heading anchors and direct Shiki highlighting through
Markdown Exit's `highlight` option. Eleventy
renders templates into an ignored staging directory; Vite
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
assets change. Markdown post edits regenerate the site and reload the page,
including its demo frames. Use `npm run build` to generate `dist/` and `npm run preview` to
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

All token, component, theme, and site CSS is combined and transformed to omit
Pantoken's `instui-` prefix: `.instui-card` becomes `.card`, and
`--instui-component-card-background-color` becomes `--component-card-background-color`.
The same transform runs for the site and CMS preview; demo srcdocs load that
shared stylesheet. Author component classes and CSS variables without the prefix.
The homepage and blog reuse the same theme-switcher partial to keep component
classes consistent.
Production prunes unused tokens while preserving references from generated HTML
and published Markdown examples, including their transitive dependencies.
It then flattens typed `@property` registrations into plain declarations to
remove registration overhead; production does not retain typed-token animation
or validation semantics.
Development and CMS previews retain all tokens for unsaved examples. Readable
names remain unchanged in production; name mangling is disabled so example CSS
can use the same names as the site. Vite still minifies CSS and fingerprints assets,
and HTML is minified after template rendering. There is no token-generation or
template runtime in the browser.

Blue palette
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
slugs to icon slugs and explicit brand colors. Icon CSS comes from Pantoken's
Simple Icons plugin; its manifest validates the selected icon slugs.
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

On startup, the CMS compiles the site's stylesheet and local fonts into its
ignored preview cache. The preview uses the blog's typography, theme, article
card, and topic pills, always in light mode to match the editor. Restart the
CMS after changing site styles. The body uses the same sanitized Markdown
Exit/Shiki renderer as the site, including heading anchors and code highlighting.
Preview rendering stays local; preview requests are limited to 1 MiB.

Highlight code lines using fence metadata such as `js {2,4-6}`, or append
`// [!code highlight]` to a line. A standalone `// [!code highlight:2]`
highlights the next two lines. These work in both the site and CMS preview.
Code blocks show line numbers starting at 1; numbers are excluded from copied code.

Group examples using `@mdit/plugin-tab` syntax with Pantoken tabs:

````md
::: tabs
@tab HTML

```html
<p>Hello</p>
```

@tab CSS

```css
p {
  color: rebeccapurple;
}
```
:::
````

Use `::: demo` instead of `::: tabs` to add a **Result** panel assembled
from the same source fences. Use `::: demo-result` to show only the rendered
result, with no source tabs. Demos accept at most one `html`, `css`, and
`js` (or `javascript`) fence; any subset is allowed. Code-only tabs never
execute their examples. Ordinary fences remain unchanged. Use
`@tab:active Title` to select an initial tab.

Result frames load the blog's compiled stylesheet and fonts with the same
Pantoken theme, typography, base spacing, and focus styles. Plain elements
remain plain elements: no component classes are added to example HTML, and
example CSS takes precedence over the base styles.
Site demos follow the Light/System/Dark control; CMS demos stay light.
Explicit colors in example CSS are not rewritten for dark mode.
Demo frames automatically adjust their height when content, fonts, or viewport
width change, including when a Result tab becomes visible.
Result frames allow scripts but not same-origin access, forms, popups, or
top-level navigation. Their content security policy permits same-site styles
and fonts from `https://iywahl.com` and loopback development servers
(`127.0.0.1` / `localhost`) but blocks other external assets and network requests; examples
must otherwise be self-contained. Neither nested demo groups
nor duplicate language fences are supported. Tabs work with mouse and
Left/Right/Home/End keys in both the site and CMS. Without JavaScript, all
panels remain readable.

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
