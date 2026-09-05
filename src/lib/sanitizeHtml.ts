const allowedTags = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "DEL",
  "INS",
  "SPAN",
  "H1", // Supported for parsing; automatically demoted to H2 if present
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "PRE",
  "CODE",
  "KBD",
  "SAMP",
  "VAR",
  "A",
  "IMG",
  "FIGURE",
  "FIGCAPTION",
  "TABLE",
  "THEAD",
  "TBODY",
  "TFOOT",
  "TR",
  "TH",
  "TD",
  "CAPTION",
  "IFRAME",
  "DETAILS",
  "SUMMARY",
  "MARK",
  "HR",
  "TIME",
  "SMALL",
  "SUB",
  "SUP",
  "ABBR",
  "DL",
  "DT",
  "DD",
  "Q",
  "CITE",
  "DFN",
  "ADDRESS",
  "DIV",
  "ARTICLE",
  "SECTION",
  "HEADER",
  "FOOTER",
]);

const allowedAttrs = new Set([
  "href",
  "name",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "loading",
  "allow",
  "allowfullscreen",
  "frameborder",
  "data-list",
  "class",
  "id",
  "open",
  "datetime",
  "colspan",
  "rowspan",
  "scope",
  "start",
  "reversed",
  "type",
  "cite",
]);

const isSafeUrl = (value = "") =>
  /^(https?:|mailto:|tel:|\/|#|data:image\/)/i.test(value.trim());

/**
 * Demote headings by one level (H1->H2, H2->H3, etc.)
 * ONLY when an H1 exists in the content, ensuring exactly one H1 on the page (the blog title).
 */
const demoteHeadingsIfH1Present = (doc: Document) => {
  const hasH1 = Boolean(doc.body.querySelector("h1"));
  if (!hasH1) return;

  const headingLevels: Record<string, string> = {
    H1: "H2",
    H2: "H3",
    H3: "H4",
    H4: "H5",
    H5: "H6",
    H6: "H6",
  };

  const headings = Array.from(doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  for (const heading of headings) {
    const originalTag = heading.tagName.toUpperCase();
    const newTag = headingLevels[originalTag] || "H2";
    const newEl = doc.createElement(newTag);

    // Preserve all valid attributes
    for (const attr of heading.attributes) {
      newEl.setAttribute(attr.name, attr.value);
    }

    // Preserve all children
    while (heading.firstChild) {
      newEl.appendChild(heading.firstChild);
    }

    heading.replaceWith(newEl);
  }
};

export const sanitizeHtml = (raw = ""): string => {
  if (typeof window === "undefined" || !raw) return raw || "";

  const doc = new DOMParser().parseFromString(raw, "text/html");

  // If user pasted H1 in content, demote headings 1 level down so blog title remains the sole H1
  demoteHeadingsIfH1Present(doc);

  doc.body.querySelectorAll("*").forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || !allowedAttrs.has(name)) {
        node.removeAttribute(attr.name);
        return;
      }

      if ((name === "href" || name === "src") && !isSafeUrl(attr.value)) {
        node.removeAttribute(attr.name);
      }
    });

    if (node.tagName === "A") {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  // Ensure all tables are wrapped in a responsive, full-width container
  doc.body.querySelectorAll("table").forEach((table) => {
    const parent = table.parentElement;
    if (parent && parent.classList.contains("table-wrapper")) return;
    const wrapper = doc.createElement("div");
    wrapper.className = "table-wrapper";
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  return doc.body.innerHTML;
};

export default sanitizeHtml;
