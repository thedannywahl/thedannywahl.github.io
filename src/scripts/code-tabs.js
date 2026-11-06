const initialized = new WeakSet();
const observedDocuments = new WeakSet();

function synchronizeDemoThemes(document) {
  const scheme = document.documentElement.dataset.colorScheme;
  for (const frame of document.querySelectorAll('iframe[title="Code example result"][srcdoc]')) {
    const content = new DOMParser().parseFromString(frame.srcdoc, "text/html");
    if (content.documentElement.dataset.colorScheme === scheme) continue;
    if (scheme) content.documentElement.dataset.colorScheme = scheme;
    else delete content.documentElement.dataset.colorScheme;
    frame.srcdoc = `<!doctype html>${content.documentElement.outerHTML}`;
  }
}

export function initializeCodeTabs(root) {
  const document = root.ownerDocument || root;
  synchronizeDemoThemes(document);
  if (!observedDocuments.has(document)) {
    observedDocuments.add(document);
    document.defaultView.addEventListener("message", (event) => {
      if (
        event.data?.type !== "iywahl-demo-height" ||
        !Number.isFinite(event.data.height) ||
        event.data.height <= 0
      )
        return;
      const frame = [
        ...document.querySelectorAll('iframe[title="Code example result"][srcdoc]'),
      ].find((frame) => frame.contentWindow === event.source);
      if (frame) frame.style.height = `${Math.ceil(event.data.height)}px`;
    });
    new MutationObserver(() => synchronizeDemoThemes(document)).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-color-scheme"],
    });
  }
  for (const group of root.querySelectorAll(".code-tabs")) {
    if (initialized.has(group)) continue;
    initialized.add(group);
    const list = group.querySelector(":scope > .list");
    const buttons = [...list.querySelectorAll(":scope > button")];
    const panels = [...group.querySelectorAll(":scope > .panel")];
    list.setAttribute("role", "tablist");
    panels.forEach((panel) => {
      panel.setAttribute("role", "tabpanel");
      panel.tabIndex = 0;
    });
    const select = (index) => {
      buttons.forEach((button, position) => {
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", String(position === index));
        button.classList.toggle("-selected", position === index);
        button.tabIndex = position === index ? 0 : -1;
        panels[position].hidden = position !== index;
      });
    };
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => select(index));
      button.addEventListener("keydown", (event) => {
        const next = {
          ArrowRight: (index + 1) % buttons.length,
          ArrowLeft: (index + buttons.length - 1) % buttons.length,
          Home: 0,
          End: buttons.length - 1,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(next);
        buttons[next].focus();
      });
    });
    select(
      Math.max(
        0,
        buttons.findIndex((button) => button.classList.contains("-selected")),
      ),
    );
  }
}

if (typeof document !== "undefined") initializeCodeTabs(document);
