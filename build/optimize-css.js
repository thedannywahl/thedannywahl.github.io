import postcss from 'postcss';
import { applyMinify, pruneCustomProps, flattenProperty, mangleCustomProps } from '@pantoken/plugin-props-minify';

export function optimizeCss(css) {
  return applyMinify(css, { prune: true, flatten: true, mangle: true });
}

export function bluePalette() {
  return {
    postcssPlugin: 'iywahl-blue-palette',
    OnceExit(root) {
      const colors = new Map();
      root.walkDecls(declaration => {
        if (declaration.parent.selector === ':root' &&
            declaration.prop.startsWith('--instui-primitive-color-blue-blue') &&
            declaration.value.startsWith('#')) {
          colors.set(declaration.prop, declaration);
        }
      });
      if (colors.size !== 20) throw new Error('Expected the complete Pantoken blue palette');
      const rule = postcss.rule({ selector: '[data-pantoken-color="blue"]', source: root.source });
      for (const declaration of colors.values()) rule.append(declaration.clone());
      root.append(rule);
    },
  };
}

export function productionCss() {
  return {
    postcssPlugin: 'iywahl-production-css',
    OnceExit(root) {
      root.walkAtRules('font-face', rule => {
        const declarations = new Map(rule.nodes.filter(node => node.type === 'decl')
          .map(node => [node.prop, node.value]));
        if (declarations.get('font-family') === 'Atkinson Hyperlegible Next' &&
            (!['normal', 'italic'].includes(declarations.get('font-style')) ||
             !['400', '500', '600', '700'].includes(declarations.get('font-weight')))) {
          rule.remove();
        }
      });
      postcss([pruneCustomProps(), flattenProperty(), mangleCustomProps()])
        .process(root, { from: root.source.input.file }).sync();
      root.walk(node => {
        if (!node.source?.input?.file) node.source = root.source;
      });
    },
  };
}