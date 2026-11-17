// Small, dependency-free rich-text layer. Markup from the CMS is never trusted:
 // pages parse it into a tree and render React elements instead of raw HTML.

export type RichTag =
  | "p" | "br" | "strong" | "em" | "u" | "ul" | "ol" | "li" | "a" | "blockquote" | "h2" | "h3"
  | "h1" | "h4" | "pre" | "code" | "hr" | "img" | "figure" | "figcaption" | "span" | "div"
  | "table" | "thead" | "tbody" | "tr" | "th" | "td" | "iframe";

export type RichElement = {
  type: "element";
  tag: RichTag;
  href?: string;
  src?: string;
  alt?: string;
  /** "button" for links the CMS editor inserted as call-to-action buttons. */
  variant?: string;
  children: RichNode[];
};
export type RichNode = { type: "text"; value: string } | RichElement;

const EMBED_HOSTS = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];
const BLOCKS = new Set<RichTag>(["p", "div", "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "h4", "pre", "figure", "hr", "table", "thead", "tbody", "tr"]);
const KEEP_OPEN = new Set<RichTag>(["ul", "ol", "li", "blockquote", "table", "thead", "tbody", "tr", "td", "th", "figure"]);
const CELLS = new Set<RichTag>(["td", "th"]);

const ARTICLE_TAGS: Record<string, RichTag> = {
  p: "p", div: "div", br: "br", strong: "strong", b: "strong", em: "em", i: "em", u: "u",
  ul: "ul", ol: "ol", li: "li", a: "a", blockquote: "blockquote",
  h1: "h1", h2: "h2", h3: "h3", h4: "h4", pre: "pre", code: "code", hr: "hr", img: "img",
  figure: "figure", figcaption: "figcaption", span: "span",
  table: "table", thead: "thead", tbody: "tbody", tr: "tr", th: "th", td: "td",
  iframe: "iframe",
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(value: string) {
  return value.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (whole, entity: string) => {
    try {
      if (entity.startsWith("#x") || entity.startsWith("#X")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
      if (entity.startsWith("#")) return String.fromCodePoint(Number(entity.slice(1)));
    } catch {
      return whole;
    }
    return ENTITIES[entity.toLowerCase()] ?? whole;
  });
}

function attribute(attributes: string, name: string) {
  const match = attributes.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

export function safeHref(value?: string) {
  if (!value) return undefined;
  const href = value.trim();
  if (href.startsWith("#")) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? href : undefined;
  } catch {
    return undefined;
  }
}

function safeEmbed(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && EMBED_HOSTS.includes(url.hostname) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeSrc(value?: string) {
  if (!value) return undefined;
  const src = value.trim();
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  try {
    const url = new URL(src);
    return ["http:", "https:"].includes(url.protocol) ? src : undefined;
  } catch {
    return undefined;
  }
}

export function parseRichText(html: string): RichNode[] {
  const root: RichNode[] = [];
  const stack: { tag: RichTag; href?: string; variant?: string; children: RichNode[] }[] = [];
  const target = () => (stack.length ? stack[stack.length - 1].children : root);
  const source = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<![^>]*>/g, "");

  const closeTop = () => {
    const frame = stack.pop();
    if (!frame) return;
    const parent = target();
    if (frame.tag === "a" && !frame.href) parent.push(...frame.children);
    else parent.push({ type: "element", tag: frame.tag, href: frame.href, variant: frame.variant, children: frame.children });
  };
  const closeWhile = (predicate: (tag: RichTag) => boolean) => {
    while (stack.length && predicate(stack[stack.length - 1].tag)) closeTop();
  };

  const pattern = /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    if (match.index > cursor) {
      const text = decode(source.slice(cursor, match.index));
      if (text) target().push({ type: "text", value: text });
    }
    cursor = pattern.lastIndex;

    const closing = match[1] === "/";
    const tag = ARTICLE_TAGS[match[2].toLowerCase()];
    if (!tag) continue;

    if (closing) {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].tag === tag) {
          while (stack.length > index) closeTop();
          break;
        }
      }
      continue;
    }

    if (tag === "img") {
      const src = safeSrc(attribute(match[3], "src"));
      if (src) target().push({ type: "element", tag: "img", src, alt: decode(attribute(match[3], "alt") ?? ""), children: [] });
      continue;
    }

    if (tag === "iframe") {
      const src = safeEmbed(attribute(match[3], "src"));
      if (src) target().push({ type: "element", tag: "iframe", src, children: [] });
      const close = source.toLowerCase().indexOf("</iframe", pattern.lastIndex);
      if (close !== -1) {
        const end = source.indexOf(">", close);
        pattern.lastIndex = end === -1 ? source.length : end + 1;
        cursor = pattern.lastIndex;
      }
      continue;
    }

    if (tag === "hr" || tag === "br") {
      target().push({ type: "element", tag, children: [] });
      continue;
    }

    if (CELLS.has(tag)) closeWhile((openTag) => CELLS.has(openTag));
    else if (tag === "tr") closeWhile((openTag) => openTag === "tr" || CELLS.has(openTag));
    else if (tag === "thead" || tag === "tbody") closeWhile((openTag) => openTag === "thead" || openTag === "tbody" || openTag === "tr" || CELLS.has(openTag));
    else if (tag === "li") closeWhile((openTag) => openTag !== "ul" && openTag !== "ol" && !CELLS.has(openTag));
    else if (BLOCKS.has(tag)) closeWhile((openTag) => !KEEP_OPEN.has(openTag));

    stack.push({
      tag,
      href: tag === "a" ? safeHref(attribute(match[3], "href")) : undefined,
      variant: tag === "a" && attribute(match[3], "data-variant") === "button" ? "button" : undefined,
      children: [],
    });
  }

  if (cursor < source.length) {
    const text = decode(source.slice(cursor));
    if (text) target().push({ type: "text", value: text });
  }
  while (stack.length) closeTop();
  return root;
}

export function richTextToPlain(nodes: RichNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return node.value;
      if (node.tag === "br") return "\n";
      if (node.tag === "img") return " ";
      return `${richTextToPlain(node.children)} `;
    })
    .join("")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Writes a parsed tree back as allowlisted markup for storage. */
export function serializeRichText(nodes: RichNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return escapeHtml(node.value);
      if (node.tag === "br" || node.tag === "hr") return `<${node.tag}>`;
      if (node.tag === "img") return node.src ? `<img src="${escapeHtml(node.src)}"${node.alt ? ` alt="${escapeHtml(node.alt)}"` : ""}>` : "";
      if (node.tag === "iframe") return node.src ? `<iframe src="${escapeHtml(node.src)}"></iframe>` : "";
      const inner = serializeRichText(node.children);
      if (node.tag === "a") {
        if (!node.href) return inner;
        const external = /^https?:/i.test(node.href);
        return `<a href="${escapeHtml(node.href)}"${external ? ' target="_blank" rel="noreferrer noopener"' : ""}${node.variant ? ` data-variant="${escapeHtml(node.variant)}"` : ""}>${inner}</a>`;
      }
      return `<${node.tag}>${inner}</${node.tag}>`;
    })
    .join("");
}

export function sanitizeRichText(html: string) {
  const nodes = parseRichText(html);
  return { html: serializeRichText(nodes), text: richTextToPlain(nodes) };
}

export function plainToRichHtml(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function looksLikeHtml(content: string) {
  return /<(p|div|h[1-6]|ul|ol|li|blockquote|pre|table|figure|img|br)\b[^>]*>/i.test(content);
}
