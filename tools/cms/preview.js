import "../../src/styles/site.css";
import tagIcons from "../../src/data/tag-icons.json";

const { CMS, h } = window;
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

function previewDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

CMS.registerPreviewStyle("/preview/preview.css");
CMS.registerPreviewTemplate("posts", ({ entry, widgetFor }) => {
  const data = entry.get("data");
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
                    className: "instui-pill post-topic-pill",
                    "data-topic": slug,
                    href: `/blog/tags/${slug}/`,
                    onClick: (event) => event.preventDefault(),
                  },
                  h("span", { className: `instui-icon -icon-${icon}`, "aria-hidden": true }),
                  label,
                ),
              );
            }),
          ),
      ),
      h("div", { className: "instui-card blog-prose" }, widgetFor("body")),
    ),
  );
});
