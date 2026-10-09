import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import postcss from 'postcss';
import * as registry from 'simple-icons';

const require = createRequire(import.meta.url);
const icons = new Map(Object.values(registry).filter(icon => icon.slug).map(icon => [icon.slug, icon]));
const available = new Set(JSON.parse(readFileSync(require.resolve('@pantoken/plugin-simple-icons/manifest.json'), 'utf8')));

export function readTagIcons() {
  const mapping = JSON.parse(readFileSync(new URL('../src/data/tag-icons.json', import.meta.url), 'utf8'));
  return Object.fromEntries(Object.entries(mapping).map(([tag, slug]) => {
    const icon = icons.get(slug);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) || !icon || !available.has(slug) || !/^[0-9A-F]{6}$/i.test(icon.hex)) {
      throw new Error(`Invalid tag icon mapping: ${tag} -> ${slug}`);
    }
    return [tag, { icon: slug, color: `#${icon.hex}` }];
  }));
}

export function tagIconStyles() {
  return {
    postcssPlugin: 'iywahl-tag-icons',
    Once(root) {
      const mapping = readTagIcons();
      for (const slug of new Set(Object.values(mapping).map(appearance => appearance.icon))) {
        const filename = require.resolve(`@pantoken/plugin-simple-icons/icons/${slug}.css`);
        root.append(postcss.parse(readFileSync(filename, 'utf8'), { from: filename }).nodes);
      }
      for (const [tag, appearance] of Object.entries(mapping)) {
        const rule = postcss.rule({ selector: `.post-topic-pill[data-topic="${tag}"]`, source: root.source });
        rule.append(postcss.decl({ prop: '--topic-brand-color', value: appearance.color, source: root.source }));
        root.append(rule);
      }
    },
  };
}