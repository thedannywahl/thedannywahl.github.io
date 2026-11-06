import { MarkdownExit } from "markdown-exit";
import anchor from "markdown-it-anchor";
import { bundledLanguages, createHighlighter } from "shiki";
import { transformerMetaHighlight, transformerNotationHighlight } from "@shikijs/transformers";
import { sanitizeMarkdown } from "./blog.js";
import { markdownTabs } from "./markdown-tabs.js";

const shiki = await createHighlighter({
  themes: ["github-light", "github-dark"],
  langs: Object.keys(bundledLanguages),
  langAlias: { markup: "html", apacheconf: "nginx", njk: "jinja", nunjucks: "jinja" },
});

export function createPostMarkdown({ stylesheet = "/styles/site.css", colorScheme } = {}) {
  const markdown = new MarkdownExit({
    html: true,
    highlight(code, language, meta) {
      const lang = language || "text";
      return shiki.codeToHtml(code.endsWith("\n") ? code.slice(0, -1) : code, {
        lang,
        meta: { __raw: meta },
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
        transformers: [
          {
            name: "iywahl:code-language",
            code(node) {
              node.properties.class = `language-${lang}`;
            },
            line(node, line) {
              node.properties["data-line"] = line;
            },
          },
          transformerMetaHighlight(),
          transformerNotationHighlight({ matchAlgorithm: "v3" }),
        ],
      });
    },
  });
  markdown.use(anchor);
  const demos = new Map();
  markdownTabs(markdown, demos, { stylesheet, colorScheme });
  const render = markdown.render.bind(markdown);
  markdown.render = (source, env = {}) => {
    demos.clear();
    env.codeTabsIndex = 0;
    let html = sanitizeMarkdown(render(source, env));
    for (const [marker, iframe] of demos) {
      html = html.replace(`<div id="${marker}"></div>`, iframe);
    }
    return html;
  };
  return markdown;
}
