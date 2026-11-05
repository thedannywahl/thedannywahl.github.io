import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import postcss from "postcss";

const require = createRequire(import.meta.url);
const available = new Set(
  JSON.parse(readFileSync(require.resolve("@pantoken/plugin-simple-icons/manifest.json"), "utf8")),
);

export function readTagIcons() {
  const mapping = JSON.parse(
    readFileSync(new URL("../src/data/tag-icons.json", import.meta.url), "utf8"),
  );
  return Object.fromEntries(
    Object.entries(mapping).map(([tag, appearance]) => {
      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) ||
        !appearance ||
        !available.has(appearance.icon) ||
        typeof appearance.color !== "string" ||
        !/^#[0-9A-F]{6}$/i.test(appearance.color)
      ) {
        throw new Error(`Invalid tag icon mapping: ${tag} -> ${JSON.stringify(appearance)}`);
      }
      return [tag, { icon: appearance.icon, color: appearance.color }];
    }),
  );
}

export function tagIconStyles() {
  return {
    postcssPlugin: "iywahl-tag-icons",
    Once(root) {
      const mapping = readTagIcons();
      for (const slug of new Set(Object.values(mapping).map((appearance) => appearance.icon))) {
        const filename = require.resolve(`@pantoken/plugin-simple-icons/icons/${slug}.css`);
        root.append(postcss.parse(readFileSync(filename, "utf8"), { from: filename }).nodes);
      }
      for (const [tag, appearance] of Object.entries(mapping)) {
        const rule = postcss.rule({
          selector: `.post-topic-pill[data-topic="${tag}"]`,
          source: root.source,
        });
        rule.append(
          postcss.decl({
            prop: "--topic-brand-color",
            value: appearance.color,
            source: root.source,
          }),
        );
        root.append(rule);
      }
    },
  };
}
