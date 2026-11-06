import "../../src/styles/site.css";
import tagIcons from "../../src/data/tag-icons.json";
import { initializeCodeTabs } from "../../src/scripts/code-tabs.js";

const { CMS, h, createClass } = window;
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

function previewDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

CMS.registerPreviewStyle("/preview/preview.css");
const BodyPreview = createClass({
  getInitialState() {
    return { html: "", error: null, loading: true };
  },
  componentDidMount() {
    this.renderMarkdown();
  },
  componentDidUpdate(previous) {
    if (previous.body !== this.props.body) this.renderMarkdown();
  },
  componentWillUnmount() {
    this.controller.abort();
  },
  async renderMarkdown() {
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    this.setState({ error: null, loading: true });
    try {
      const response = await fetch("/preview/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: this.props.body || "" }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(await response.text());
      const html = await response.text();
      if (!controller.signal.aborted) this.setState({ html, loading: false });
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("CMS Markdown preview failed:", error);
      this.setState({ error: error.message, html: "", loading: false });
    }
  },
  render() {
    if (this.state.error) return h("p", { role: "alert" }, this.state.error);
    const document = new DOMParser().parseFromString(this.state.html, "text/html");
    for (const image of document.querySelectorAll("img")) {
      const source = image.getAttribute("src");
      if (source) {
        image.dataset.cmsAsset = source;
        const path = source.startsWith(this.props.mediaPrefix)
          ? source.slice(this.props.mediaPrefix.length)
          : source;
        const asset = this.props.getAsset(path);
        image.src = String(asset);
      }
    }
    return h("div", {
      className: "card blog-prose",
      "aria-busy": this.state.loading,
      dangerouslySetInnerHTML: { __html: document.body.innerHTML },
      ref: (element) => {
        if (element) initializeCodeTabs(element);
      },
    });
  },
});
CMS.registerPreviewTemplate("posts", ({ entry, getAsset }) => {
  const data = entry.get("data");
  const directory = String(entry.get("path") || "")
    .replace(/^src\/blog\/posts\//, "")
    .replace(/\/[^/]+$/, "");
  const published = previewDate(data.get("published_at"));
  const modified = previewDate(data.get("modified_at"));
  const topics = [
    ...new Set(
      String(data.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
  return h(
    "main",
    {
      className: "blog-main",
      ref(element) {
        if (!element) return;
        const document = element.ownerDocument;
        document.documentElement.lang = "en";
        document.documentElement.dataset.pantokenTheme = "rebrand";
        document.documentElement.dataset.pantokenColor = "sea";
        document.documentElement.dataset.colorScheme = "light";
        document.body.classList.add("blog-page");
      },
    },
    h(
      "article",
      {},
      h(
        "header",
        { className: "post-header" },
        h(
          "p",
          { className: "post-meta" },
          published &&
            h("time", { dateTime: published.toISOString() }, dateFormat.format(published)),
          published &&
            modified &&
            modified >= published &&
            h(
              "span",
              {},
              " (Updated ",
              h("time", { dateTime: modified.toISOString() }, dateFormat.format(modified)),
              ")",
            ),
          " \u00b7 ",
          data.get("authors") || "Danny Wahl",
        ),
        h("h1", {}, data.get("title") || "Untitled post"),
        topics.length > 0 &&
          h(
            "ul",
            { className: "post-topics", "aria-label": "Topics" },
            topics.map((label) => {
              const slug = label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              const icon = Object.hasOwn(tagIcons, slug) ? tagIcons[slug].icon : "tag";
              return h(
                "li",
                { key: label },
                h(
                  "a",
                  {
                    className: "pill post-topic-pill",
                    "data-topic": slug,
                    href: `/blog/tags/${slug}/`,
                    onClick: (event) => event.preventDefault(),
                  },
                  h("span", { className: `icon -icon-${icon}`, "aria-hidden": true }),
                  label,
                ),
              );
            }),
          ),
      ),
      h(BodyPreview, { body: data.get("body"), getAsset, mediaPrefix: `/blog/${directory}/` }),
    ),
  );
});
