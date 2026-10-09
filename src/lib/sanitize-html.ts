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
  "CENTER",
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
  "style",
  "align",
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

const ALLOWED_CSS_PROPERTIES = new Set([
  "text-align",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "color",
  "background-color",
  "margin",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-bottom",
  "padding",
  "padding-left",
  "padding-right",
  "padding-top",
  "padding-bottom",
  "border",
  "border-left",
  "border-right",
  "border-top",
  "border-bottom",
  "border-radius",
  "border-color",
  "border-style",
  "border-width",
  "max-width",
  "min-width",
  "width",
  "height",
  "display",
  "line-height",
  "letter-spacing",
]);

function sanitizeStyleAttribute(rawStyle = ""): string {
  if (!rawStyle || typeof rawStyle !== "string") return "";
  // Block any dangerous CSS injection vectors
  if (/javascript:|expression|behavior|url\(/i.test(rawStyle)) return "";

  const declarations = rawStyle.split(";");
  const cleanDecls: string[] = [];

  for (const decl of declarations) {
    const trimmed = decl.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const prop = trimmed.slice(0, colonIndex).trim().toLowerCase();
    const val = trimmed.slice(colonIndex + 1).trim();

    if (ALLOWED_CSS_PROPERTIES.has(prop) && !/url\(|javascript:|expression/i.test(val)) {
      cleanDecls.push(`${prop}: ${val}`);
    }
  }

  return cleanDecls.join("; ");
}

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

  // Transform legacy <center> tags to centered divs with robust alignment classes
  doc.body.querySelectorAll("center").forEach((centerNode) => {
    const div = doc.createElement("div");
    div.className = "ql-align-center text-center";
    div.setAttribute("style", "text-align: center;");
    while (centerNode.firstChild) {
      div.appendChild(centerNode.firstChild);
    }
    centerNode.replaceWith(div);
  });

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

      // Handle align attribute and normalize to classes
      if (name === "align") {
        const val = attr.value.toLowerCase().trim();
        if (!["left", "center", "right", "justify"].includes(val)) {
          node.removeAttribute(attr.name);
        } else {
          if (val === "center") {
            node.classList.add("ql-align-center", "text-center");
          } else if (val === "right") {
            node.classList.add("ql-align-right", "text-right");
          } else if (val === "justify") {
            node.classList.add("ql-align-justify", "text-justify");
          }
        }
      }

      // Sanitize inline style attribute and preserve text-align
      if (name === "style") {
        const safeStyle = sanitizeStyleAttribute(attr.value);
        if (safeStyle) {
          node.setAttribute("style", safeStyle);
          if (/text-align\s*:\s*center/i.test(safeStyle)) {
            node.classList.add("ql-align-center", "text-center");
          } else if (/text-align\s*:\s*right/i.test(safeStyle)) {
            node.classList.add("ql-align-right", "text-right");
          } else if (/text-align\s*:\s*justify/i.test(safeStyle)) {
            node.classList.add("ql-align-justify", "text-justify");
          }
        } else {
          node.removeAttribute("style");
        }
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
