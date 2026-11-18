import { parseRichText, type RichElement, type RichNode } from "@/lib/richtext";

function renderNodes(nodes: RichNode[]) {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.value;
    const element = node as RichElement;
    const kids = renderNodes(element.children);
    switch (element.tag) {
      case "p":
        return (
          <p key={index} className="mb-2.5 border-s-2 border-white/25 ps-3 text-[14px] leading-relaxed text-white/92 last:mb-0 md:text-[15px]">
            {kids}
          </p>
        );
      case "br":
        return <br key={index} />;
      case "strong":
        return (
          <strong key={index} className="font-semibold text-white">
            {kids}
          </strong>
        );
      case "em":
        return <em key={index}>{kids}</em>;
      case "a":
        return element.href ? (
          <a key={index} href={element.href} className="underline underline-offset-2">
            {kids}
          </a>
        ) : (
          <span key={index}>{kids}</span>
        );
      default:
        return <span key={index}>{kids}</span>;
    }
  });
}

/** Dark glass context panel over the page hero (editable in CMS). */
export function HeroContextPanel({ html, panelOpacity }: { html: string; panelOpacity: number }) {
  const nodes = parseRichText(html);
  if (!html.trim() || nodes.length === 0) return null;

  return (
    <div
      className="mt-4 max-w-xl rounded-md border border-white/12 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:mt-0"
      style={{ backgroundColor: `rgba(10, 10, 10, ${panelOpacity / 100})` }}
    >
      <div className="space-y-1">{renderNodes(nodes)}</div>
    </div>
  );
}