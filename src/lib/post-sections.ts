// Turns a stored post body into the sections shown on the reading page.
import { looksLikeHtml, parseRichText, richTextToPlain, safeHref, type RichElement, type RichNode, type RichTag } from "@/lib/richtext";

export type BodySection = {
  id: string;
  /** Null for text that comes before the first heading; the page supplies the label. */
  title: string | null;
  nodes: RichNode[];
};

/** Anchor ids the reading page uses for its own sections. */
export const ABSTRACT_ID = "abstract";
export const INTRO_ID = "introduction";
export const BODY_ID = "full-text";

const HEADINGS: RichTag[] = ["h1", "h2", "h3", "h4"];
const BLOCK_TAGS = new Set<RichTag>(["p", "div", "ul", "ol", "blockquote", "h1", "h2", "h3", "h4", "pre", "hr", "figure", "table", "iframe"]);

const element = (tag: RichTag, children: RichNode[], extra: Partial<RichElement> = {}): RichElement => ({ type: "element", tag, children, ...extra });
const text = (value: string): RichNode => ({ type: "text", value });

function isBlock(node: RichNode): node is RichElement {
  return node.type === "element" && (BLOCK_TAGS.has(node.tag) || node.tag === "img");
}

function isBlank(node: RichNode) {
  return node.type === "text" ? !node.value.trim() : node.tag === "br";
}

/* ---------- Markdown (posts written before the CMS stored HTML) ---------- */

const INLINE = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*/g;

function inline(source: string): RichNode[] {
  const nodes: RichNode[] = [];
  let last = 0;
  for (const match of source.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text(source.slice(last, start)));
    if (match[1] !== undefined) nodes.push(element("code", [text(match[1])]));
    else if (match[2] !== undefined) {
      const href = safeHref(match[3]);
      nodes.push(href ? element("a", inline(match[2]), { href }) : text(match[2]));
    } else if (match[4] !== undefined || match[5] !== undefined) nodes.push(element("strong", inline(match[4] ?? match[5])));
    else nodes.push(element("em", inline(match[6])));
    last = start + match[0].length;
  }
  if (last < source.length) nodes.push(text(source.slice(last)));
  return nodes;
}

function parseMarkdown(source: string): RichNode[] {
  const nodes: RichNode[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let fence: string[] | null = null;

  const flush = () => {
    if (paragraph.length) nodes.push(element("p", inline(paragraph.join(" "))));
    if (quote.length) nodes.push(element("blockquote", [element("p", inline(quote.join(" ")))]));
    if (list) nodes.push(element(list.ordered ? "ol" : "ul", list.items.map((item) => element("li", inline(item)))));
    paragraph = [];
    quote = [];
    list = null;
  };

  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    if (fence) {
      if (/^\s*(```|~~~)/.test(raw)) {
        nodes.push(element("pre", [element("code", [text(fence.join("\n"))])]));
        fence = null;
      } else fence.push(raw);
      continue;
    }

    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) {
      flush();
      fence = [];
      continue;
    }
    if (!line) {
      flush();
      continue;
    }

    const heading = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (heading) {
      flush();
      nodes.push(element(HEADINGS[Math.min(heading[1].length, 4) - 1], inline(heading[2])));
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flush();
      nodes.push(element("hr", []));
      continue;
    }

    const quoted = /^>\s?(.*)$/.exec(line);
    if (quoted) {
      if (paragraph.length || list) flush();
      quote.push(quoted[1]);
      continue;
    }

    const bullet = /^[-*+]\s+(.+)$/.exec(line);
    const numbered = bullet ? null : /^\d+[.)]\s+(.+)$/.exec(line);
    const item = bullet ?? numbered;
    if (item) {
      const ordered = Boolean(numbered);
      if (paragraph.length || quote.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(item[1]);
      continue;
    }

    if (list || quote.length) flush();
    paragraph.push(line);
  }

  if (fence) nodes.push(element("pre", [element("code", [text(fence.join("\n"))])]));
  flush();
  return nodes;
}

/* ---------- Sections ---------- */

/** Top-level wrappers are opened up and loose inline content is gathered into paragraphs. */
function toBlocks(nodes: RichNode[]): RichElement[] {
  const blocks: RichElement[] = [];
  let run: RichNode[] = [];

  const flush = () => {
    while (run.length && isBlank(run[0])) run.shift();
    while (run.length && isBlank(run[run.length - 1])) run.pop();
    if (run.length) blocks.push(element("p", run));
    run = [];
  };

  for (const node of nodes) {
    if (node.type === "element" && node.tag === "div") {
      flush();
      blocks.push(...toBlocks(node.children));
    } else if (isBlock(node)) {
      flush();
      blocks.push(node);
    } else run.push(node);
  }
  flush();
  return blocks;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

const same = (a: string, b: string) => a.replace(/\s+/g, " ").trim().toLowerCase() === b.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * Splits a post body into sections for the Sections panel. Bodies are HTML from the CMS, or
 * Markdown for posts that predate it. A section starts at each heading of the highest level the
 * post uses; lower headings stay inside their section.
 */
export function parsePostBody(content: string, title: string): BodySection[] {
  let blocks = toBlocks(looksLikeHtml(content) ? parseRichText(content) : parseMarkdown(content));

  // The page prints the title itself, so a body that opens by repeating it loses that heading.
  const first = blocks[0];
  if (first && HEADINGS.includes(first.tag) && same(richTextToPlain(first.children), title)) blocks = blocks.slice(1);

  const used = HEADINGS.filter((tag) => blocks.some((block) => block.tag === tag && richTextToPlain(block.children)));
  // h1 and h2 are both treated as section headings: imported posts use either for the same purpose.
  const breaks = new Set<RichTag>(used.some((tag) => tag === "h1" || tag === "h2") ? ["h1", "h2"] : used.slice(0, 1));

  const taken = new Set<string>([ABSTRACT_ID, INTRO_ID, BODY_ID]);
  const uniqueId = (label: string) => {
    const base = slug(label) || "section";
    let id = base;
    for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
    taken.add(id);
    return id;
  };

  const sections: BodySection[] = [];
  let current: BodySection | null = null;

  for (const block of blocks) {
    const label = breaks.has(block.tag) ? richTextToPlain(block.children) : "";
    if (label) {
      current = { id: uniqueId(label), title: label, nodes: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { id: breaks.size ? INTRO_ID : BODY_ID, title: null, nodes: [] };
      sections.push(current);
    }
    current.nodes.push(block);
  }

  return sections;
}

/** Plain text of a body, for descriptions and word counts. */
export function bodyToPlain(content: string): string {
  return richTextToPlain(looksLikeHtml(content) ? parseRichText(content) : parseMarkdown(content)).replace(/\s+/g, " ").trim();
}
