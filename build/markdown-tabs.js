import { randomUUID } from "node:crypto";
import { tab } from "@mdit/plugin-tab";

function reportDemoHeight() {
  let scheduled = false;
  let previous = 0;
  const measure = () => {
    scheduled = false;
    const body = document.body;
    const height = Math.ceil(Math.max(body.getBoundingClientRect().height, body.scrollHeight));
    if (height > 0 && height !== previous) {
      previous = height;
      parent.postMessage({ type: "iywahl-demo-height", height }, "*");
    }
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(measure, 0);
  };
  new ResizeObserver(schedule).observe(document.body);
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
  addEventListener("load", schedule);
  addEventListener("resize", schedule);
  void document.fonts.ready.then(schedule);
  schedule();
}

export function markdownTabs(markdown, demos, { stylesheet, colorScheme }) {
  const escape = markdown.utils.escapeHtml;
  for (const name of ["tabs", "demo", "demo-result"]) {
    markdown.renderer.rules[`${name}_source_hidden`] = () => "";
    markdown.use(tab, {
      name,
      openRenderer(info, tokens, index, options, env) {
        const id = `code-tabs-${env.codeTabsIndex++}`;
        tokens[index].meta.groupId = id;
        const buttons = info.data.map(
          (item, position) =>
            `<button type="button" class="tab${info.active === position ? " -selected" : ""}" id="${id}-tab-${position}" aria-controls="${id}-panel-${position}">${escape(item.title)}</button>`,
        );
        if (name !== "tabs") {
          const parts = { html: "", css: "", js: "" };
          const seen = new Set();
          for (let i = index + 1; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type === `${name}_tabs_close` && token.level === tokens[index].level) break;
            if (token.type.endsWith("_tabs_open"))
              throw new Error("Demo groups cannot contain nested tabs");
            if (token.type !== "fence") continue;
            const lang = token.info.trim().split(/\s+/)[0];
            const key = { html: "html", css: "css", js: "js", javascript: "js" }[lang];
            if (!key || seen.has(key))
              throw new Error("Demo groups require at most one HTML, CSS, and JavaScript fence");
            seen.add(key);
            parts[key] = token.content;
          }
          if (!seen.size) throw new Error("Demo groups require HTML, CSS, or JavaScript code");
          const assetSources = "https://iywahl.com http://127.0.0.1:* http://localhost:*";
          const csp = `default-src 'none'; script-src 'unsafe-inline'; style-src 'self' 'unsafe-inline' ${assetSources}; font-src 'self' ${assetSources}; img-src data: blob:; base-uri 'none'; form-action 'none'`;
          const scheme = colorScheme ? ` data-color-scheme="${escape(colorScheme)}"` : "";
          const document = `<!doctype html><html lang="en" data-pantoken-theme="rebrand" data-pantoken-color="sea"${scheme}><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><link rel="stylesheet" href="${escape(stylesheet)}"><style>${parts.css.replace(/<\/style/gi, "<\\/style")}</style><style>html,body{min-height:0}body{display:flow-root}</style></head><body>${parts.html}<script>(${reportDemoHeight.toString()})();</script><script>${parts.js.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
          const marker = `demo-${randomUUID()}`;
          demos.set(
            marker,
            `<iframe title="Code example result" sandbox="allow-scripts" referrerpolicy="no-referrer" srcdoc="${escape(document)}"></iframe>`,
          );
          if (name === "demo-result") {
            for (let i = index + 1; i < tokens.length; i++) {
              if (
                tokens[i].type === `${name}_tabs_close` &&
                tokens[i].level === tokens[index].level
              )
                break;
              tokens[i].type = `${name}_source_hidden`;
            }
            tokens[index].meta.result = `<div id="${marker}"></div>`;
            return '<div class="code-demo">';
          }
          tokens[index].meta.result =
            `<section class="panel" id="${id}-panel-${info.data.length}" aria-labelledby="${id}-tab-${info.data.length}"><div class="code-demo"><div id="${marker}"></div></div></section>`;
          buttons.push(
            `<button type="button" class="tab" id="${id}-tab-${info.data.length}" aria-controls="${id}-panel-${info.data.length}">Result</button>`,
          );
        }
        return `<div class="tabs code-tabs"><div class="list" aria-label="Code example">${buttons.join("")}</div>`;
      },
      closeRenderer(tokens, index) {
        const opening = tokens
          .slice(0, index)
          .findLast(
            (token) => token.type === `${name}_tabs_open` && token.level === tokens[index].level,
          );
        return `${opening.meta.result || ""}</div>`;
      },
      tabOpenRenderer(info, tokens, index) {
        const opening = tokens
          .slice(0, index)
          .findLast(
            (token) =>
              token.type === `${name}_tabs_open` && token.level === tokens[index].level - 1,
          );
        return `<section class="panel" id="${opening.meta.groupId}-panel-${info.index}" aria-labelledby="${opening.meta.groupId}-tab-${info.index}">`;
      },
      tabCloseRenderer: () => "</section>",
    });
  }
}
