# iywahl.com

A static project gallery built with npm, Vite, and Pantoken. Templates render at
build time; a small script powers the light/system/dark button-set and remembers
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
- [build/site.js](build/site.js): rendering, SVG processing, and HTML minification.
- [build/optimize-css.js](build/optimize-css.js): Pantoken palette and CSS optimization.

To add a project, add its data record and matching `<id>-og.svg` and
`<id>-og-light.svg` artwork. Project URLs must use HTTPS and IDs must be unique.
SVG IDs and references are prefixed during rendering, and the bottom URL is
omitted in the gallery because it already appears in the caption. Source artwork
remains unchanged. Inline SVGs inherit the locally bundled Atkinson font.

## Production Optimization

All token, component, theme, and site CSS is combined before Pantoken's
`@pantoken/plugin-props-minify` prunes unused custom properties, flattens typed
registrations, and consistently shortens property names. Vite then minifies the
CSS and fingerprints assets. HTML is minified after template rendering. There
is no token-generation or template runtime in the browser.

Readable CSS property names remain available during development. Blue palette
values are derived from the installed package to isolate blue cards from the
page's sea palette. Fonts and required third-party attribution ship locally.
Production retains only the normal 400, 500, 600, and 700 font weights used by
the page and SVG artwork; update this set if future content needs other faces.

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

In the repository's **Settings > Pages**, select **GitHub Actions** as the build
source. Set the custom domain to `iywahl.com`, configure its DNS for GitHub Pages,
and enable **Enforce HTTPS** once GitHub has provisioned the certificate.
[public/CNAME](public/CNAME) and canonical/social URLs target `https://iywahl.com/`.
GitHub Pages settings, DNS, and the first deployment must be confirmed separately;
the local build does not change them.
