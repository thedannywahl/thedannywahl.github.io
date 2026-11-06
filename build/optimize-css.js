import postcss from "postcss";
import { pruneCustomProps } from "@pantoken/plugin-prune-custom-props";
import { flattenProperty } from "@pantoken/plugin-flatten-property";

export function pantokenNames() {
  const variables = (value) => value.replace(/--instui-/g, "--");
  const selectors = (value) => variables(value).replace(/\.instui-/g, ".");
  return {
    postcssPlugin: "iywahl-pantoken-names",
    OnceExit(root) {
      root.walkDecls((declaration) => {
        declaration.prop = variables(declaration.prop);
        declaration.value = variables(declaration.value);
      });
      root.walkRules((rule) => {
        rule.selector = selectors(rule.selector);
      });
      root.walkAtRules((rule) => {
        rule.params = selectors(rule.params);
      });
    },
  };
}

export function bluePalette() {
  return {
    postcssPlugin: "iywahl-blue-palette",
    OnceExit(root) {
      const colors = new Map();
      root.walkDecls((declaration) => {
        if (
          declaration.parent.selector === ":root" &&
          declaration.prop.startsWith("--instui-primitive-color-blue-blue") &&
          declaration.value.startsWith("#")
        ) {
          colors.set(declaration.prop, declaration);
        }
      });
      if (colors.size !== 20) throw new Error("Expected the complete Pantoken blue palette");
      const rule = postcss.rule({ selector: '[data-pantoken-color="blue"]', source: root.source });
      for (const declaration of colors.values()) rule.append(declaration.clone());
      root.append(rule);
    },
  };
}

export function productionCss({ content = [] } = {}) {
  return {
    postcssPlugin: "iywahl-production-css",
    OnceExit(root) {
      const references = new Set(
        content.flatMap((source) => [...source.matchAll(/--[\w-]+/g)].map((match) => match[0])),
      );
      // The pruner discovers roots in CSS declarations, not in HTML or code examples.
      const contentReferences = postcss.rule({ selector: ":root", source: root.source });
      for (const reference of references) {
        contentReferences.append({ prop: "content", value: `var(${reference})` });
      }
      root.append(contentReferences);
      postcss([pruneCustomProps()]).process(root, { from: root.source.input.file }).sync();
      contentReferences.remove();
      postcss([flattenProperty()]).process(root, { from: root.source.input.file }).sync();
      root.walkAtRules("font-face", (rule) => {
        const declarations = new Map(
          rule.nodes.filter((node) => node.type === "decl").map((node) => [node.prop, node.value]),
        );
        if (
          declarations.get("font-family") === "Atkinson Hyperlegible Next" &&
          (!["normal", "italic"].includes(declarations.get("font-style")) ||
            !["400", "500", "600", "700"].includes(declarations.get("font-weight")))
        ) {
          rule.remove();
        }
      });
      root.walk((node) => {
        if (!node.source?.input?.file) node.source = root.source;
      });
    },
  };
}
